import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Amplify } from 'aws-amplify';
//import { Storage } from '@aws-amplify/storage';
//import awsExports from './aws-exports';

//Amplify.configure(awsExports);

export default function App() {

  async function classify() {
    let result = ImagePicker.launchCameraAsync();
    if (!(await result).canceled) {
      console.log('error');
    }
    //upload the image to s3 bucket and do the prediction
  }

  async function upload() {
    const key = `uploads/${Date.now()}.jpg`;
    let result = await ImagePicker.launchImageLibraryAsync();
    if (!result.canceled) {
      //await Storage.put(key, { result.assets[0]?.uri }, { contentType: 'image.jpeg' });
      return key
    }
    //upload the image to s3 bucket and do the prediction
  }

  return (
    <View style={styles.container}>
      <View style={styles.button}>
      <Button onPress={classify} title='Take Image'></Button>
      </View>
      <Button onPress={upload} title='Upload Image'></Button>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#fff',
    margin: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
