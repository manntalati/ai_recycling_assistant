# AI Recycling Assistant

A mobile application that uses machine learning to classify recyclable materials and provide users with specific recycling instructions.

## Project Goal

The AI Recycling Assistant aims to solve the global problem of improper waste disposal by:
- **Accurately classifying** recyclable materials using deep learning
- **Providing specific instructions** for proper recycling of each material type

## Architecture

![D00ED281-878C-4E8F-9894-4BE5871B5286](https://github.com/user-attachments/assets/8ccd539a-d071-4678-81a3-6a7c3d7228bc)

## Main Features

### Mobile Application
- **Camera Integration**: Take photos directly within the app
- **Gallery Selection**: Choose images from device gallery
- **Real-time Classification**: Instant material identification
- **Recycling Tips**: Category-specific instructions for each material
- **Confidence Scoring**: Transparent AI confidence levels

### AI Classification
- **6 Material Categories**: Cardboard, Glass, Metal, Paper, Plastic, Trash
- **Machine Learning Model**: CNN-based image classification
- **Real-time Processing**: Fast inference via AWS SageMaker

## Technology Stack

### Frontend
- **React Native** with Expo and **TypeScript**

### Backend & AI
- **AWS Lambda** for serverless processing
- **AWS SageMaker** for ML model hosting
- **AWS API Gateway** for REST API
- **AWS S3** for image storage and audit trail
- **TensorFlow/Keras** for deep learning model

### Machine Learning
- **CNN Architecture**: Trained on input of 224x224 images
- **Hyperparameter Tuning**: Keras Tuner for model optimization

## Model Performance
- **Validation Accuracy**: >80% on test set
- **Inference Speed**: Real-time classification (<2 seconds)

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8+
- AWS Account with SageMaker, Lambda, and S3 access
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/manntalati/ai_recycling_assistant.git
   cd ai_recycling_assistant
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up the frontend**
   ```bash
   cd src/frontend/recycling-assistant
   npm install
   ```

### Running the Application

```bash
cd src/frontend/recycling-assistant
npm start
```

## Future Implementations
- s3 specific buckets for each user to query old and new predictions for each user
- Caching to identify already present images within the s3 buckets 
