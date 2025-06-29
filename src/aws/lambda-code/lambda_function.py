import json
import boto3
import base64
import io
from PIL import Image
import tensorflow as tf
import numpy as np
import uuid
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
            resized_img = img.resize((512, 256))
            img_array = tf.keras.utils.img_to_array(resized_img) / 255.0
            img_array = tf.expand_dims(img_array, 0)

        except Exception as e:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': f'Image processing failed: {str(e)}'})
            }
        
        try:
            # Upload the image to S3
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
            img_byte_arr = io.BytesIO()
            resized_img.save(img_byte_arr, format='JPEG')
            img_base64_for_sagemaker = base64.b64encode(img_byte_arr.getvalue()).decode('utf-8')

            payload = {
                "instances": [{"b64": img_base64_for_sagemaker}]
            }

            response = sagemaker_runtime.invoke_endpoint(
                EndpointName=SAGEMAKER_ENDPOINT_NAME,
                ContentType='application/json',
                Body=json.dumps(payload)
            )

            result = json.loads(response['Body'].read().decode())
            if 'predictions' in result and len(result['predictions']) > 0:
                scores = tf.nn.softmax(result['predictions'][0]).numpy()
                predicted_class = class_names[int(np.argmax(scores))]
                score = float(scores[int(np.argmax(scores))])
        except Exception as e:
            return {
                'statusCode': 500,
                'body': json.dumps({'error': f'Prediction failed: {str(e)}'})
            }
        return {
            'statusCode': 200,
            'body': json.dumps({
                'predicted_name': predicted_class,
                'score': score,
                's3_url': s3_url
            })
        }

    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Invalid JSON format'})
        }