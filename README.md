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
- BLOCKER: AWS SageMaker Quota for endpoint compute needs to be upgraded which the ticket has been submitted for
- Deploy model on AWS SageMaker
- Create pipeline with AWS Lambda, API Gatway & S3 Buckets for user-uploaded images

-- Figure out what is wrong with the AWS endpoint and creating the endpoint for that
AWS Steps:
1. prepare and upload model artificats -> uploaded best_model.keras in s3 bucket --> completed
2. setup.py contains the aws prebuilt inference container --> completed
3. inference.py contains the necessay functions for predicting --> completed
4. create sagemaker model -> has been done and is called cnn-recycling-model --> completed
5. deploy endpoint (endpoint has been created cnn-recycling-config) but has not been deployed due to ResourceLimitExceeded error --> current step
6. s3 buckets need to be hooked up
7. test & trials