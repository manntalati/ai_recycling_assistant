import { Credentials } from '@aws-sdk/types';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const options = {
    keyPrefix: 'uploads/',
    bucket: 'images/',
    region: 'us-east-1',
    successActionStatus: 201,
}

//s3://recycling-assistant/images/ -- s3 bucket