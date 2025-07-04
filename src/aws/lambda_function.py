import json
import boto3
import io
import base64
import uuid
import numpy as np
from PIL import Image, ImageFile
from datetime import datetime

ImageFile.LOAD_TRUNCATED_IMAGES = True

s3_client = boto3.client('s3')
sagemaker_runtime = boto3.client('sagemaker-runtime')

SAGEMAKER_ENDPOINT_NAME = "recycling-assistant-serverless"
S3_BUCKET_NAME = "recycling-assistant"

class_names = ['cardboard', 'glass', 'metal', 'paper', 'plastic', 'trash']

def lambda_handler(event, context):
    try:
        raw_body = event.get('body')
        body = {}
        if isinstance(raw_body, str):
            try:
                body = json.loads(raw_body)
            except json.JSONDecodeError:
                print("Failed to parse body as JSON")
                pass
        elif isinstance(raw_body, dict):
            body = raw_body
        else:
            print(f"Body is neither string nor dict: {type(raw_body)}")
        
        image_base64 = body.get('image')
        if not image_base64:
            return {'statusCode': 400, 'body': json.dumps({'error': 'Image data is required'})}

        try:
            image_data = base64.b64decode(image_base64)
            print(f"Decoded image size: {len(image_data)} bytes")
        except Exception:
            return {'statusCode': 400, 'body': json.dumps({'error': 'Invalid base64 image data'})}

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_id = uuid.uuid4().hex[:8]
        image_key = f"images/{timestamp}_{unique_id}.jpg"

        try:
            img = Image.open(io.BytesIO(image_data)).convert('RGB')
            resized = img.resize((224, 224))
            
        except Exception as e:
            return {'statusCode': 400, 'body': json.dumps({'error': f'Image processing failed: {e}'})}
        
        buf = io.BytesIO()
        resized.save(buf, format='JPEG', quality=95)
        jpeg_bytes = buf.getvalue()
        try:
            s3_client.put_object(
                Bucket=S3_BUCKET_NAME,
                Key=image_key,
                Body=image_data,
                ContentType='image/jpeg',
                Metadata={'timestamp': timestamp, 'unique_id': unique_id}
            )
            s3_url = f"https://{S3_BUCKET_NAME}.s3.amazonaws.com/{image_key}"
            print(f"Uploaded to S3: {s3_url}")
        except Exception as e:
            return {'statusCode': 500, 'body': json.dumps({'error': f'S3 upload failed: {e}'})}
        try:
            print("Trying raw JPEG bytes method...")
            resp = sagemaker_runtime.invoke_endpoint(
                EndpointName=SAGEMAKER_ENDPOINT_NAME,
                ContentType='image/jpeg',
                Body=jpeg_bytes
            )
            method = 'raw-jpeg'
            print("Raw JPEG method succeeded")
        except Exception as e:
            print(f"Raw JPEG method failed: {e}")
            try:
                payload = {"instances": [{"s3_uri": s3_url}]}
                print(f"S3 payload: {json.dumps(payload)}")
                
                resp = sagemaker_runtime.invoke_endpoint(
                    EndpointName=SAGEMAKER_ENDPOINT_NAME,
                    ContentType='application/json',
                    Body=json.dumps(payload)
                )
                method = 's3-json'
                print("S3 method succeeded")
            except Exception as e2:
                print(f"S3 method failed: {e2}")
                img_array = np.array(resized, dtype=np.float32)
                instances = np.expand_dims(img_array, axis=0).tolist()
                payload = {'instances': instances}                
                resp = sagemaker_runtime.invoke_endpoint(
                    EndpointName=SAGEMAKER_ENDPOINT_NAME,
                    ContentType='application/json',
                    Body=json.dumps(payload)
                )
                method = 'json-raw'

        result = json.loads(resp['Body'].read().decode())
        
        if isinstance(result, dict):
            if 'predictions' in result:
                preds = result['predictions']
            elif 'predicted name' in result:
                predicted_name = result['predicted name']
                score = result['score']
                return {
                    'statusCode': 200,
                    'body': json.dumps({
                        'predicted_class': predicted_name,
                        'confidence_score': score,
                        'all_predictions': {predicted_name: score},
                        's3_url': s3_url,
                        'method': method
                    })
                }
            else:
                preds = result
        else:
            preds = result
        
        preds = np.array(preds[0] if isinstance(preds, list) else preds)
        
        def softmax(x):
            exp_x = np.exp(x - np.max(x))
            return exp_x / np.sum(exp_x)
        
        softmax_preds = softmax(preds)
        idx = int(np.argmax(softmax_preds))
        return {
            'statusCode': 200,
            'body': json.dumps({
                'predicted_class': class_names[idx],
                'confidence_score': float(softmax_preds[idx]),
                'all_predictions': dict(zip(class_names, softmax_preds.tolist())),
                's3_url': s3_url,
                'method': method
            })
        }

    except json.JSONDecodeError:
        return {'statusCode': 400, 'body': json.dumps({'error': 'Invalid JSON format'})}
    except Exception as e:
        return {'statusCode': 500, 'body': json.dumps({'error': f'Unexpected error: {e}'})}