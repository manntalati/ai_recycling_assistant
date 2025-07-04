import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useState } from 'react';
import * as ImageManipulator from 'expo-image-manipulator';

const API_GATEWAY_URL = 'https://fv4kq08sea.execute-api.us-east-1.amazonaws.com/prod/recycling-assistant';

const recyclingTips = {
  cardboard: {
    title: '📦 Cardboard',
    tips: [
      'Flatten boxes to save space',
      'Remove any tape or labels',
      'Keep dry and clean',
      'Place in cardboard recycling bin'
    ],
    color: '#8B4513'
  },
  glass: {
    title: '🥃 Glass',
    tips: [
      'Rinse thoroughly',
      'Remove caps and lids',
      'Separate by color if required',
      'Place in glass recycling bin'
    ],
    color: '#0066CC'
  },
  metal: {
    title: '🥫 Metal',
    tips: [
      'Rinse clean',
      'Crush cans to save space',
      'Remove any plastic parts',
      'Place in metal recycling bin'
    ],
    color: '#FFD700'
  },
  paper: {
    title: '📄 Paper',
    tips: [
      'Keep dry and clean',
      'Remove any plastic or metal',
      'Shred sensitive documents',
      'Place in paper recycling bin'
    ],
    color: '#228B22'
  },
  plastic: {
    title: '🥤 Plastic',
    tips: [
      'Check the recycling number',
      'Rinse thoroughly',
      'Remove caps and labels',
      'Place in plastic recycling bin'
    ],
    color: '#FF6B35'
  },
  trash: {
    title: '🗑️ Trash',
    tips: [
      'This item cannot be recycled',
      'Dispose in regular waste bin',
      'Consider reducing waste',
      'Look for reusable alternatives'
    ],
    color: '#DC3545'
  }
};

export default function HomeScreen() {
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
      const manipResult = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 224, height: 224 }}], {format: ImageManipulator.SaveFormat.JPEG, base64: true});
      const smallBase64 = manipResult.base64!;
      const payload = { image: smallBase64 };
      const response = await fetch(API_GATEWAY_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)});
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }
      const data = await response.json();
      setPrediction(data);
      Alert.alert('Done!',`Predicted: ${data.predicted_class}\nConfidence: ${(data.confidence_score * 100).toFixed(2)}%`);
    } catch (err: any) {
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
          <Text style={[styles.resultText, styles.errorText]}>Error</Text>
        </View>
      );
    }

    const category = prediction.predicted_class;
    const tips = recyclingTips[category as keyof typeof recyclingTips];

    return (
      <View style={styles.resultContainer}>
        <Text style={[styles.resultText, styles.successText]}>
          {tips?.title || `Category: ${category}`}
        </Text>
        <Text style={styles.confidenceText}>
          Confidence: {(prediction.confidence_score * 100).toFixed(2)}%
        </Text>
        
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>♻️ Next Steps:</Text>
          {tips?.tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {prediction.all_predictions && (
          <View style={styles.allPredictions}>
            <Text style={styles.allPredictionsTitle}>All Predictions:</Text>
            {Object.entries(prediction.all_predictions).map(([category, score], index) => (
              <Text key={index} style={styles.predictionItem}>
                {category}: {((score as number)*100).toFixed(2)}%
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

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.button, styles.cameraButton]} 
          onPress={takePhoto}
          disabled={isProcessing}
        >
          <Ionicons name='camera-outline' size={24} color='#fff' />
          <Text style={styles.buttonText}>Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.galleryButton]} 
          onPress={selectFromGallery}
          disabled={isProcessing}
        >
          <Ionicons name="images-outline" size={24} color='#fff' />
          <Text style={styles.buttonText}>Gallery</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
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
            <Ionicons name="image-outline" size={80} color="#ddd" />
            <Text style={styles.placeholder}>No image selected</Text>
            <Text style={styles.placeholderSubtitle}>Take a photo or choose from gallery</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cameraButton: {
    backgroundColor: '#007bff',
  },
  galleryButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6c757d',
  },
  resultContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  resultText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  successText: {
    color: '#28a745',
  },
  errorText: {
    color: '#dc3545',
  },
  confidenceText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 12,
  },
  tipsContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#495057',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  tipBullet: {
    fontSize: 12,
    color: '#6c757d',
    marginRight: 8,
    marginTop: 1,
  },
  tipText: {
    fontSize: 12,
    color: '#6c757d',
    flex: 1,
    lineHeight: 16,
  },
  allPredictions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  allPredictionsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#495057',
  },
  predictionItem: {
    fontSize: 11,
    color: '#6c757d',
    marginLeft: 8,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
  },
  placeholder: {
    fontSize: 18,
    color: '#6c757d',
    marginTop: 15,
    fontWeight: '500',
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: '#adb5bd',
    marginTop: 5,
    textAlign: 'center',
  },
});