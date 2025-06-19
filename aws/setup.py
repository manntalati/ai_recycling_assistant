from sagemaker import Model, Session
from sagemaker.serverless import ServerlessInferenceConfig

sess = Session()
model = Model(
    image_uri='763104351884.dkr.ecr.us-east-1.amazonaws.com/tensorflow-inference:2.18-cpu',
    model_data="s3://recycling-assistant/models/best_model.keras",
    role="arn:aws:iam::872752221913:role/SageMakerRecyclingRole",
    sagemaker_session=sess,
)
config = ServerlessInferenceConfig(memory_size_in_mb=2048, max_concurrency=4)
model.deploy(endpoint_name="cnn-recycling-serverless-endpoint2", serverless_inference_config=config)
print("✅ Deployed serverless endpoint")