# ai_recycling_assistant

## AWS
Set up AWS and IAM roles
- LambdaSageMakerInvokeRole
- SageMakerRecyclingRole
- recycling-assistant-dev User

## Current Progress
- Data Preprocessing & Preparation -- completed
- CNN Model -- completed
- Hyperparameter Tuned Model to gain best features -- completed

## Next Steps
- Deploy model on AWS SageMaker -- completed, it now has an serverless endpoint on AWS so there are not massive recurrent costs
- Create pipeline with AWS Lambda, API Gatway & S3 Buckets for user-uploaded images -> needs to be done and additionally need to have s3 connected to react native with right cognito credentials -> currently facing issues with the cognito access and having users upload images to s3 bucket
  
AWS Steps:
1. prepare and upload model artificats -> uploaded best_model.keras in s3 bucket --> completed
2. setup.py contains the aws prebuilt inference container --> completed
3. inference.py contains the necessay functions for predicting --> completed
4. create sagemaker model -> has been done and is called cnn-recycling-model --> completed
5. deploy endpoint (endpoint has been created recycling-classifier-serverless) --> completed
6. s3 buckets need to be hooked up -> current step
7. test & trials
