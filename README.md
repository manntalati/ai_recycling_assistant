# AI Recycling Assistant

An intelligent mobile application that uses computer vision and machine learning to classify recyclable materials and provide users with specific recycling instructions. The app helps users make environmentally conscious decisions by accurately identifying different types of waste and providing actionable recycling guidance.

## 🎯 Project Goal

The AI Recycling Assistant aims to solve the global problem of improper waste disposal by:
- **Accurately classifying** recyclable materials using deep learning
- **Providing specific instructions** for proper recycling of each material type
- **Educating users** about sustainable waste management practices
- **Reducing contamination** in recycling streams through clear guidance

## 🏗️ Architecture

![D00ED281-878C-4E8F-9894-4BE5871B5286](https://github.com/user-attachments/assets/8ccd539a-d071-4678-81a3-6a7c3d7228bc)

## 🚀 Main Features

### 📱 Mobile Application
- **Camera Integration**: Take photos directly within the app
- **Gallery Selection**: Choose images from device gallery
- **Real-time Classification**: Instant material identification
- **Recycling Tips**: Category-specific instructions for each material
- **Confidence Scoring**: Transparent AI confidence levels
- **Scrollable Interface**: View full images and detailed results

### 🤖 AI Classification
- **6 Material Categories**: Cardboard, Glass, Metal, Paper, Plastic, Trash
- **Deep Learning Model**: CNN-based image classification
- **High Accuracy**: Trained on diverse dataset of recyclable materials
- **Real-time Processing**: Fast inference via AWS SageMaker

### ♻️ Recycling Guidance
- **Cardboard**: Flatten boxes, remove tape, keep dry
- **Glass**: Rinse thoroughly, remove caps, separate by color
- **Metal**: Rinse clean, crush cans, remove plastic parts
- **Paper**: Keep dry, remove contaminants, shred sensitive docs
- **Plastic**: Check recycling numbers, rinse, remove labels
- **Trash**: Proper disposal guidance and waste reduction tips

## 🛠️ Technology Stack

### Frontend
- **React Native** with Expo
- **TypeScript** for type safety
- **Expo Image Picker** for camera/gallery access
- **Expo Image Manipulator** for image preprocessing

### Backend & AI
- **AWS Lambda** for serverless processing
- **AWS SageMaker** for ML model hosting
- **AWS API Gateway** for REST API
- **AWS S3** for image storage and audit trail
- **TensorFlow/Keras** for deep learning model

### Machine Learning
- **CNN Architecture**: Convolutional Neural Network
- **Transfer Learning**: Pre-trained model optimization
- **Hyperparameter Tuning**: Keras Tuner for model optimization
- **Data Augmentation**: Enhanced training dataset

## 📊 Model Performance

- **Training Dataset**: 2,527 images across 6 categories
- **Model Architecture**: Custom CNN with dropout and dense layers
- **Validation Accuracy**: ~70% on balanced test set
- **Inference Speed**: Real-time classification (<2 seconds)

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8+
- AWS Account with SageMaker, Lambda, and S3 access
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
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

4. **Configure AWS credentials**
   ```bash
   aws configure
   ```

5. **Deploy the backend**
   ```bash
   cd src/aws
   # Follow deployment instructions in model_deployment.ipynb
   ```

### Running the Application

```bash
cd src/frontend/recycling-assistant
npm start
```

Choose your platform:
- **iOS Simulator**: Press `i`
- **Android Emulator**: Press `a`
- **Expo Go App**: Scan QR code with Expo Go

## 📁 Project Structure

```
ai_recycling_assistant/
├── src/
│   ├── frontend/recycling-assistant/    # React Native app
│   ├── aws/                            # AWS Lambda & deployment
│   ├── notebooks/                      # ML training & analysis
│   └── models/                         # Trained model files
├── data/                               # Training dataset
├── requirements.txt                    # Python dependencies
└── README.md                          # This file
```

## 🔧 Development

### Training the Model
1. Navigate to `src/notebooks/`
2. Run `model_training.ipynb` for basic training
3. Run `hyperparameter_tuning.ipynb` for optimized model
4. Export model to `src/models/`

### Deploying Updates
1. Update Lambda function: `src/aws/lambda_function.py`
2. Deploy to AWS: `aws lambda update-function-code`
3. Test via API Gateway endpoint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- TrashNet dataset for training data
- AWS for cloud infrastructure
- Expo for mobile development framework
- TensorFlow team for ML framework
