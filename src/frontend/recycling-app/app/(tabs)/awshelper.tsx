// import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
// import { Credentials } from "@aws-sdk/types";
// import "react-native-get-random-values";
// import "react-native-url-polyfill/auto";
// import "react-native-fs";

// const options = {
//   keyPrefix: "uploads/",
//   bucket: "fileUploadExample",
//   region: "eu-central-1",
//   successActionStatus: 201
// }

// let credentials: Credentials = {
//   accessKeyId: "ACCESS_KEY",
//   secretAccessKey: "SECRET_ACCESS_KEY",
// }
// const client = new S3Client({
//   region: options.region,
//   credentials: credentials
// })
  
// interface FileObject {
//     uri: string;
    
    
// }

// interface AWSHelperType {
//     uploadFile: (path: string) => Promise<boolean | undefined>;
// }

// const AWSHelper: AWSHelperType = {
//     uploadFile: async function(path: string): Promise<boolean | undefined> {
//         try {
//             // Import 'react-native-fs' at the top of your file: import RNFS from 'react-native-fs';
//             // Read the file as a binary buffer
//             // Make sure to install 'react-native-fs' and link it if needed
//             const RNFS = require('react-native-fs');
//             const filePath = path.startsWith('file://') ? path : `file://${path}`;
//             const fileBuffer = await RNFS.readFile(filePath, 'base64');
//             const buffer = Buffer.from(fileBuffer, 'base64');

//             await client.send(new PutObjectCommand({ Bucket: "camera-sec", Key: 'images/' + 'test', Body: buffer }) ).then((response: any) => {
//              console.log(response)
//             }).catch((error: any) => { console.log(error)})
//             return true
//         } catch (error: any) {
//             console.log(error);
//         }
//     }, 
// }

// export default AWSHelper; 