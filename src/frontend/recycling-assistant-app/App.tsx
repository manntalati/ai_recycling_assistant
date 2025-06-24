import { Amplify, Storage } from 'aws-amplify';
import 'react-native-get-random-values';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, SafeAreaView, Image, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
//import { S3Client, CreateBucketCommand, DeleteBucketCommand } from '@aws-sdk/client-s3';
//import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { useCallback } from 'react';


Amplify.configure({
  Auth: {
    identityPoolId: 'us-east-1:5c380182-fc89-45e2-b943-1f7a84c291b4',
    region: 'us-east-1',
  },
  Storage: {
    bucket: 's3://recycling-assistant/images/',   
    region: 'us-east-1',
    level: 'public',              
  }
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
  const [bucketName, setBucketName] = useState("");
  const [msg, setMsg] = useState<{ message: string; type: MessageType }>({
    message: "",
    type: MessageType.EMPTY,
  });
  const [imageUri, setImageUri] = useState<string | null>(null);

  const options = {
    bucket: '',
    region: '',
    accessKey: '',
    secretKey: '',
    successActionStatus: 201,

  }

  const createBucket = useCallback(async () => {
    setMsg({ message: "", type: MessageType.EMPTY });

    try {
      //await client.send(new CreateBucketCommand({ Bucket: bucketName }));
      setMsg({
        message: `Bucket "${bucketName}" created.`,
        type: MessageType.SUCCESS,
      });
    } catch (e) {
      console.error(e);
      setMsg({
        message: e instanceof Error ? e.message : "Unknown error",
        type: MessageType.FAILURE,
      });
    }
  }, [bucketName]);

  const deleteBucket = useCallback(async () => {
    setMsg({ message: "", type: MessageType.EMPTY });

    try {
      //await client.send(new DeleteBucketCommand({ Bucket: bucketName }));
      setMsg({
        message: `Bucket "${bucketName}" deleted.`,
        type: MessageType.SUCCESS,
      });
    } catch (e) {
      setMsg({
        message: e instanceof Error ? e.message : "Unknown error",
        type: MessageType.FAILURE,
      });
    }
  }, [bucketName]);

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
      const uri = result.assets && result.assets.length > 0 ? result.assets[0].uri : null;
      setImageUri(uri);
      if (uri) {
        const response = await fetch(uri);
        const blob = await response.blob();
        const key = `uploads/${Date.now()}.jpg`;
        try {
          const stored = await Storage.put(key, blob, {
            level: 'public',
            contentType: 'image/jpeg',
          });
          console.log('Stored Object: ', stored);
          setMsg({message: `Uploaded as ${stored.key}`, type: MessageType.SUCCESS});
          return stored.key
        } catch (err) {
          console.error(err);
          setMsg({message: err instanceof Error ? err.message : "Unknown error", type: MessageType.FAILURE});
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
        <View style={styles.image2}>
          <Text style={styles.text}>Prediction: </Text>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
          <Text style={styles.placeholder}>No image selected</Text>
        )}
        </View>

        <View style={styles.container}>
      {msg.type !== MessageType.EMPTY && (
        <Text
          style={
            msg.type === MessageType.SUCCESS
              ? styles.successText
              : styles.failureText
          }
        >
          {msg.message}
        </Text>
      )}
      <View>
        <TextInput
          onChangeText={(text) => setBucketName(text)}
          autoCapitalize={"none"}
          value={bucketName}
          placeholder={"Enter Bucket Name"}
        />
        <Button color="#68a0cf" title="Create Bucket" onPress={createBucket} />
        <Button color="#68a0cf" title="Delete Bucket" onPress={deleteBucket} />
      </View>
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
