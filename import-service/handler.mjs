'use strict';

import { S3Client } from "@aws-sdk/client-s3";
const REGION = "us-east-1";
const s3Client = new S3Client({ region: REGION });
import { PutObjectCommand , GetObjectCommand} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const corsConfig = {
  "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
  "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
};

const BUCKET = 'import-service-bucket-l3';

export const importFile = async (event) => {
  const fileName = event.queryStringParameters.name
  const bucketParams = {
    Bucket: BUCKET,
    Key: `uploaded/${fileName}`,
    ContentType: 'text/csv',
  }
  try{
    const command = new PutObjectCommand(bucketParams);
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });
    
    return {
      statusCode: 200,
      headers:corsConfig,
      body: JSON.stringify(signedUrl, null, 2)
    }
  }catch(err){
    return {
      statusCode: 500,
      headers:corsConfig,
      body: JSON.stringify({ message: `There was an error creating signed url - ${err}`})
    }
  }
}

export const fileParser = async (event) => {
  console.log('___records', event);
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
  console.log('__bucket', bucket)
  console.log('___key', key)

  const params = {
    Bucket: bucket,
    Key: key
  }

  try {
    // Get the object from the Amazon S3 bucket. It is returned as a ReadableStream.
    const data = await s3Client.send(new GetObjectCommand(params));
    // Convert the ReadableStream to a string.
    const dataString = await data.Body.transformToString();
    console.log('___dataString',dataString)
  } catch (err) {
    console.log("Error", err);
  }


  return {
    statusCode: 200,
    headers:corsConfig,
    body: JSON.stringify({message: "FileParser"}, null, 2)
  }
}