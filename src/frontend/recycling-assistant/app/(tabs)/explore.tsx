import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { StyleSheet, Text, View, Button, SafeAreaView, Image, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

const API_GATEWAY_URL = 'https://fv4kq08sea.execute-api.us-east-1.amazonaws.com/prod/recycling-assistant';

export default function TabTwoScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera permissions to take a photo!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.65,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      await classifyImage(uri);
    }
  }

  async function selectFromGallery() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      await classifyImage(uri);
    }
  }

  async function classifyImage(uri: string) {
    setIsProcessing(true);
    setPrediction(null);

    try {
    // 1️⃣ Resize & compress locally to model’s 256×512 JPEG, and grab base64
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [
        
        { resize: { width: 224, height: 224 } }
      ],
      {
        compress: 0.2,                         // tune between 0.5–0.8
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true
      }
    );

    const smallBase64 = manipResult.base64!;
    console.log('Resized to', manipResult.width, '×', manipResult.height);
    console.log('Base64 length:', smallBase64.length);

    // 2️⃣ POST to your API Gateway
    const response = await fetch(API_GATEWAY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: smallBase64 }),
    });

    console.log('API status:', response.status);
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    console.log('Prediction:', data);
    setPrediction(data);

    Alert.alert(
      'Done!',
      `Predicted: ${data.predicted_class}\nConfidence: ${(data.confidence_score*100).toFixed(1)}%`
    );
  } catch (err: any) {
    console.error('classifyImage error:', err);
    Alert.alert('Error', err.message || 'Unknown');
    setPrediction({ error: true });
  } finally {
    setIsProcessing(false);
  }
}

  const renderPredictionResult = () => {
    if (!prediction) return null;

    if (prediction.error) {
      return (
        <View style={styles.resultContainer}>
          <Text style={[styles.resultText, styles.errorText]}>
            Error
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.resultContainer}>
        <Text style={[styles.resultText, styles.successText]}>
          🗂️ Category: {prediction.predicted_class}
        </Text>
        <Text style={styles.confidenceText}>
          📊 Confidence: {(prediction.confidence_score * 100).toFixed(1)}%
        </Text>
        
        {prediction.all_predictions && (
          <View style={styles.allPredictions}>
            <Text style={styles.allPredictionsTitle}>All Predictions:</Text>
            {Object.entries(prediction.all_predictions).map(([category, score], index) => (
              <Text key={index} style={styles.predictionItem}>
                {category}: {((score as number) * 100).toFixed(1)}%
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Recycling Assistant</Text>
        <Text style={styles.subtitle}>Classify Your Image Below!</Text>
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <Ionicons name='camera-outline' size={20} style={styles.icon} />
          <Button 
            title='Take Photo' 
            onPress={takePhoto} 
            disabled={isProcessing}
          />
        </View>

        <View style={styles.button}>
          <Ionicons name="images-outline" size={20} style={styles.icon} />
          <Button 
            title='Choose from Gallery' 
            onPress={selectFromGallery} 
            disabled={isProcessing}
          />
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        {isProcessing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Analyzing image...</Text>
          </View>
        )}
        
        {renderPredictionResult()}
        
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons name="image-outline" size={60} color="#ccc" />
            <Text style={styles.placeholder}>No image selected</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "white",
    paddingVertical: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    marginBottom: 15,
    padding: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  icon: {
    marginRight: 8,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  resultContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  successText: {
    color: '#28a745',
  },
  errorText: {
    color: '#dc3545',
  },
  confidenceText: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 10,
  },
  allPredictions: {
    marginTop: 10,
  },
  allPredictionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#495057',
  },
  predictionItem: {
    fontSize: 12,
    color: '#6c757d',
    marginLeft: 10,
  },
  image: {
    width: 300,
    height: 400,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  placeholder: {
    fontSize: 16,
    color: '#888',
    marginTop: 10,
  },
});