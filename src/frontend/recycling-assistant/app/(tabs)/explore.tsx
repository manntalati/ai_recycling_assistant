import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { StyleSheet, Text, View, Button, SafeAreaView, Image, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import 'react-native-get-random-values';
import { Amplify } from '@aws-amplify/core';
import awsconfig from '../aws-exports';
import { uploadData } from '@aws-amplify/storage';
import { fetchAuthSession } from '@aws-amplify/auth';

Amplify.configure(awsconfig);

export default function TabTwoScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  async function initializeAuth() {
    try {
      const session = await fetchAuthSession();
      console.log('Session details:', {
        credentials: !!session.credentials,
        identityId: session.identityId,
        tokens: !!session.tokens
      });
      
      if (session.credentials) {
        setIsAuthenticated(true);
        console.log('Authentication successful with Cognito Identity Pool');
        console.log('Identity ID:', session.identityId);
      } else {
        console.log('No credentials in session, forcing refresh...');
        const refreshedSession = await fetchAuthSession({ forceRefresh: true });
        if (refreshedSession.credentials) {
          setIsAuthenticated(true);
          console.log('Authentication successful after refresh');
        } else {
          throw new Error('No credentials available after refresh');
        }
      }
    } catch (error) {
      console.log('Authentication error:', error);
      console.log('Full error object:', JSON.stringify(error, null, 2));
      
      // Try alternative approach - still attempt upload without explicit auth check
      console.log('Attempting to proceed without explicit auth check...');
      setIsAuthenticated(true); // Allow user to try uploading
      
      Alert.alert(
        'Authentication Warning', 
        'Could not verify AWS credentials. You can still try uploading - it may work if your Cognito pool is configured correctly.',
        [{ text: 'OK' }]
      );
    }
  }

  async function classify() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera permissions to take a photo!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      await uploadAndPredict(uri);
    }
  }

  async function upload() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      await uploadAndPredict(uri);
    }
  }

  async function uploadAndPredict(uri: string) {
    if (!isAuthenticated) {
      Alert.alert('Error', 'Not authenticated with AWS');
      return;
    }

    setIsUploading(true);
    setPrediction(null);

    try {
      // Read the file as a blob
      const response = await fetch(uri);
      const blob = await response.blob();

      const timestamp = Date.now();
      const fileName = `uploads/${timestamp}-image.jpg`;

      // Upload to S3
      const result = await uploadData({
        path: fileName,
        data: blob,
        options: {
          onProgress: ({ transferredBytes, totalBytes }) => {
            if (totalBytes) {
              const progress = Math.round((transferredBytes / totalBytes) * 100);
              console.log(`Upload progress: ${progress}%`);
            }
          },
        },
      }).result;

      console.log("Upload successful! Path:", result.path);

      // Call your API Gateway endpoint for prediction
      await getPrediction(fileName);

    } catch (error) {
      console.log("Upload error:", error);
      Alert.alert('Upload Failed', 'Failed to upload image to S3');
    } finally {
      setIsUploading(false);
    }
  }

  async function getPrediction(s3Key: string) {
    try {
      // Replace with your actual API Gateway endpoint URL
      const API_ENDPOINT = 'https://your-api-id.execute-api.us-east-1.amazonaws.com/dev/predict';
      
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          s3_key: s3Key,
          bucket_name: awsconfig.aws_user_files_s3_bucket
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPrediction(data.prediction || 'No prediction available');
      } else {
        throw new Error('Prediction API call failed');
      }
    } catch (error) {
      console.log('Prediction error:', error);
      setPrediction('Prediction failed');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Recycling Assistant</Text>
        <Text style={styles.status}>
          Status: {isAuthenticated ? 'Connected' : 'Connecting...'}
        </Text>
      </View>

      <View style={styles.button}>
        <Ionicons name='camera-outline' size={20} style={styles.icon} />
        <Button 
          title='Take Photo' 
          onPress={classify} 
          disabled={!isAuthenticated || isUploading}
        />
      </View>

      <View style={styles.button}>
        <Ionicons name="images-outline" size={20} style={styles.icon} />
        <Button 
          title='Upload from Gallery' 
          onPress={upload} 
          disabled={!isAuthenticated || isUploading}
        />
      </View>
      
      <View style={styles.image2}>
        {isUploading && <Text style={styles.text}>Uploading and analyzing...</Text>}
        
        {prediction && (
          <Text style={[styles.text, styles.predictionText]}>
            Prediction: {prediction}
          </Text>
        )}
        
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text style={styles.placeholder}>No image selected</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  successText: {
    color: "green",
  },
  failureText: {
    color: "red",
  },
  text: {
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
    alignItems: 'flex-start',
    fontSize: 16,
    marginBottom: 10,
  },
  predictionText: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  status: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  image2: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    padding: 20,
  },
  image: {
    width: 300,
    height: 400,
    borderRadius: 12,
    resizeMode: 'cover',
    marginTop: 10,
  },
  placeholder: {
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
  icon: {
    marginRight: 8,
  },
  label: {
    color: '#black',
    fontSize: 18,
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 80,
    backgroundColor: "#f5f5f5",
    marginBottom: 30,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  button: {
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});