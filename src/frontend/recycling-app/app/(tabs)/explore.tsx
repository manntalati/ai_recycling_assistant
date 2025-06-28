import 'react-native-get-random-values';
import { Amplify, Storage } from 'aws-amplify';
import awsconfig from './aws-exports';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, SafeAreaView, Image, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
//import DocumentPicker, { DocumentPickerResponse, isInProgress, types } from 'react-native-document-picker';
//import AWSHelper from './awshelper.js';

Amplify.configure(awsconfig);

const result = await Storage.put('test.txt', 'Hello');

async function pathToImageFile(imageUri: string) {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    await Storage.put('images', blob, {
      contentType: 'image/jpeg' // contentType is optional
    });
  } catch (err) {
    console.log('Error uploading file:', err);
  }
}

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
    //const handleDocumentSelect = (value: Array<DocumentPickerResponse>): DocumentPickerResponse | any => {
    //  AWSHelper.uploadFile(value[0].uri)
    //}

  //const handleError = (err: unknown) => {
  //  if (DocumentPicker.isCancel(err)) {
  //    console.warn('cancelled')
  //    // User cancelled the picker, exit any dialogs or menus and move on
  //  } else if (isInProgress(err)) {
  //    console.warn('multiple pickers were opened, only the last will be considered')
  //  } else {
  //    throw err
  //  }
  //}

  


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
    // Convert the image URI to a blob
        pathToImageFile(uri);

    //console.log('S3 key is', uploadResult?.key);
    //setMsg({ message: `Uploaded as ${uploadResult?.key}`, type: MessageType.SUCCESS });
  }
}

  }
    //upload the image to s3 bucket and do the prediction
  

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