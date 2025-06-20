import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, SafeAreaView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Amplify } from 'aws-amplify';
import { useState } from 'react';
//import { Storage } from '@aws-amplify/storage';
//import awsExports from './aws-exports';

//Amplify.configure(awsExports);

export default function App() {
  const [imageUri, setImageUri] = useState<string | null>(null);

  const options = {
    bucket: '',
    region: '',
    accessKey: '',
    secretKey: '',
    successActionStatus: 201,

  }

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
    const key = `uploads/${Date.now()}.jpg`;
    const result = await ImagePicker.launchImageLibraryAsync();
    if (!result.canceled) {
      setImageUri(result.assets && result.assets.length > 0 ? result.assets[0].uri : null);
      //await Storage.put(key, { result.assets[0]?.uri }, { contentType: 'image.jpeg' });
      return key
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
