'use strict';

import { S3Client } from "@aws-sdk/client-s3";
const REGION = "us-east-1";
const s3Client = new S3Client({ region: REGION });
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fetch from "node-fetch";

const corsConfig = {
  "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
  "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
};

const BUCKET = 'import-service-bucket-l3';

export const importFile = async (event) => {
  const fileName = event.queryStringParameters.fileName
  const bucketParams = {
    Bucket: BUCKET,
    Key: `uploaded/${fileName}`,
    Body: "BODY",
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