import json
import boto3
import io
import base64
import uuid
import numpy as np
from PIL import Image
from datetime import datetime

s3_client = boto3.client('s3')
sagemaker_runtime = boto3.client('sagemaker-runtime')

SAGEMAKER_ENDPOINT_NAME = "recycling-classifier-serverless"
S3_BUCKET_NAME = "recycling-assistant"

class_names = ['cardboard', 'glass', 'metal', 'paper', 'plastic', 'trash']

def lambda_handler(event, context):
    try:
        body = json.loads(event['body']) if isinstance(event.get('body'), str) else event.get('body', {})
        image_base64 = body.get('image')
        if not image_base64:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Image data is required'})
            }
        try:
            image_data = base64.b64decode(image_base64)
        except Exception as e:
            return {
                'statusCode': 400, 
                'body': json.dumps({'error': 'Invalid base64 image data'})
            }
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_id = str(uuid.uuid4())[:8]
        image_key = f"images/{timestamp}_{unique_id}.jpg"
        try:
            img = Image.open(io.BytesIO(image_data)).convert("RGB")
            resized_img = img.resize((256, 512))
            img_array = np.array(resized_img, dtype=np.float32)
            img_array = img_array / 255.0
            img_array = np.expand_dims(img_array, axis=0)

            print(f"Preprocessed image shape: {img_array.shape}")

        except Exception as e:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': f'Image processing failed: {str(e)}'})
            }
        
        try:
            s3_client.put_object(
                Bucket=S3_BUCKET_NAME,
                Key=image_key,
                Body=image_data,
                ContentType='image/jpeg',
                Metadata={
                    'timestamp': timestamp,
                    'unique_id': unique_id
                }
            )
            s3_url = f"https://{S3_BUCKET_NAME}.s3.amazonaws.com/{image_key}"
            print(f"Image uploaded to S3: {s3_url}")
        
        except Exception as e:
            return {
                'statusCode': 500,
                'body': json.dumps({'error': f'S3 upload failed: {str(e)}'})
            }
        try:
            payload = {
                "instances": [{"s3_uri": s3_url}]
            }

            response = sagemaker_runtime.invoke_endpoint(
                EndpointName=SAGEMAKER_ENDPOINT_NAME,
                ContentType='application/json',
                Body=json.dumps(payload)
            )

            result = json.loads(response['Body'].read().decode())
            print("S3 worked")

            if 'predictions' in result:
                predictions = result['predictions'][0]
            else:
                predictions = result[0] if isinstance(result, list) else result
                
            predictions = np.array(predictions)
            predicted_class = class_names[np.argmax(predictions)]
            confidence_score = float(predictions[np.argmax(predictions)])
                
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'predicted_class': predicted_class,
                    'confidence_score': confidence_score,
                    'all_predictions': {class_names[i]: float(predictions[i]) for i in range(len(class_names))},
                    's3_url': s3_url,
                    'method': 's3'
                })
            }
        
        except Exception as e:
            print(f"S3 failed")
            pass
        
        try:
            binary_data = img_array.tobytes()

            response = sagemaker_runtime.invoke_endpoint(
                EndpointName=SAGEMAKER_ENDPOINT_NAME,
                ContentType='application/octet-stream',
                Body=binary_data
            )

            result = json.loads(response['Body'].read().decode())

            if 'prediction' in result:
                predictions = result['prediction'][0]
            else:
                predictions = result[0] if isinstance(result, list) else result

            predictions = np.array(predictions)
            predicted_class = predictions[np.argmax(predictions)]
            confidence_score = float(predictions[np.argmax(predictions)])
        
        except Exception as e:
            payload = {
                "instances": img_array.tolist()
            }

            response = sagemaker_runtime.invoke_endpoint(
                EndpointName=SAGEMAKER_ENDPOINT_NAME,
                ContentType='application/json',
                Body=json.dumps(payload)
            )

            result = json.loads(response['Body'].read().decode())

            if 'predictions' in result:
                predictions = result['predictions'][0]
            else:
                predictions = result[0] if isinstance(result, list) else result
            
            predictions = np.array(predictions)
            predicted_class = class_names[np.argmax(predictions)]
            confidence_score = float(predictions[np.argmax(predictions)])

        except Exception as e:
            return {
                'statusCode': 500,
                'body': json.dumps({'error': f'Prediction failed: {str(e)}'})
            }
        return {
            'statusCode': 200,
            'body': json.dumps({
                'predicted_class': predicted_class,
                'confidence_score': confidence_score,
                'all_predictions': {class_names[i]: float(predictions[i]) for i in range(len(class_names))},
                's3_url': s3_url,
            })
        }

    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Invalid JSON format'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f'Unexpected error: {str(e)}'})
        }