import { Amplify } from '@aws-amplify/core';
//mport awsconfig from './aws-exports';
import Storage from '@aws-amplify/storage'
import { uploadData } from '@aws-amplify/storage';
import 'react-native-get-random-values';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, SafeAreaView, Image, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
//import { S3Client, CreateBucketCommand, DeleteBucketCommand } from '@aws-sdk/client-s3';
//import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { S3Client, CreateBucketCommand, DeleteBucketCommand } from "@aws-sdk/client-s3";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { useCallback } from 'react';

Amplify.configure({
  Auth: {
    Cognito: {
      identityPoolId: 'us-east-1:5c380182-fc89-45e2-b943-1f7a84c291b4',
      //region: 'us-east-1',
    }
    //region: 'us-east-1',
  },
  Storage: {
    S3: {
      bucket: 'recycling-assistant',
      region: 'us-east-1',
    }
  },
});

//const client = new S3Client({
//  region: "us-east-1",
//  credentials: fromCognitoIdentityPool({
//    identityPoolId: "us-east-1:5c380182-fc89-45e2-b943-1f7a84c291b4",
//    clientConfig: { region: "us-east-1" },
//  }),
//});

enum MessageType {
  SUCCESS = 0,
  FAILURE = 1,
  EMPTY = 2,
}

export default function App() {
  const [msg, setMsg] = useState<{ message: string; type: MessageType }>({
    message: "",
    type: MessageType.FAILURE,
  });
  const [imageUri, setImageUri] = useState<string | null>(null);

  async function classify() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to take a photo!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync();
    if (!result.canceled) {
      setImageUri(result.assets && result.assets.length > 0 ? result.assets[0].uri : null);
      console.log('error');
    }
    //upload the image to s3 bucket and do the prediction
  }

  async function upload() {
    const result = await ImagePicker.launchImageLibraryAsync();
  if (!result.canceled) {
    const uri = result.assets && result.assets.length > 0 ? result.assets[0].uri : null;
    setImageUri(uri);
    if (uri) {
      const response = await fetch(uri);
      const blob = await response.blob();
      const key = `images/${Date.now()}.jpeg`;
      try {
        await uploadData({
          key,
          data: blob,
          options: {
            contentType: 'image/jpeg',
            //accessLevel: 'public',
          },
        }).result;
        setMsg({ message: `Uploaded as ${key}`, type: MessageType.SUCCESS });
      } catch (err) {
        console.error(err);
        setMsg({ message: err instanceof Error ? err.message : "Unknown error", type: MessageType.FAILURE });
      }
    }
  }
    //upload the image to s3 bucket and do the prediction
  }

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Recycling Assistant</Text>
        </View>
        <View style={styles.button}>
          <Ionicons name="camera-outline" size={20} /> <Button onPress={classify} title='Take Image'></Button>
        </View>
        <View style={styles.button}>
          <Ionicons name="images-outline" size={20} /> <Button onPress={upload} title='Upload Image'></Button>
        </View>
        <Text
          style={
            msg.type === MessageType.SUCCESS
              ? styles.successText
              : styles.failureText
          }
        >
          {msg.message}
        </Text>
        <View style={styles.image2}>
          <Text style={styles.text}>Prediction: </Text>
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
  },
  image2: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  image: {
    width: 300,
    height: 450,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  placeholder: {
    fontSize: 16,
    color: '#888',
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
    height: 60,
    backgroundColor: "#eee",
    marginBottom: 50,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#eee',
    flexDirection: 'row',
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#eee',
  },
});