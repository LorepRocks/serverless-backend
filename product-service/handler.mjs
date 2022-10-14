"use strict";
import AWS from '/var/runtime/node_modules/aws-sdk/lib/aws.js';

const corsConfig = {
  "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
  "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
}

const dynamo = new AWS.DynamoDB.DocumentClient();


const scan = async (table) => {
  const scanResults = await dynamo.scan({
    TableName: table
  }).promise()
  return scanResults.Items;
}

const query = async (id) => {
  const params = {
    TableName: process.env.PRODUCT_TABLE_NAME,
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ":id": id,
    }
  }

  try {
    const data = await dynamo.query(params).promise()
    return data.Items
  } catch (err) {
    return err
  }
}

const put = async (item, table) => {
  const putResults = await dynamo.put({
    TableName: table,
    Item: item
  }).promise()

  return putResults;
}


export const getProducts = async (event) => {
  try {
    const products = await scan(process.env.PRODUCT_TABLE_NAME);
    const stocks = await scan(process.env.STOCKS_TABLE_NAME)
    const data = products?.map((product) => {
      const  result   = stocks?.filter((stock) => stock.product_id === product.id)
      const count = result[0].count
      return { count, ...product}
    })
    return {
      statusCode: 200,
      headers: corsConfig,
      body: JSON.stringify(data,null,2),
    };
  }catch(e) {
    return {
      statusCode: 500,
      headers: corsConfig,
      body: JSON.stringify({ message: `There was an error trying to get data - ${e}`}),
    };
  }
};


export const getProductId = async (event) => {
  try {
    const productId = event.pathParameters['productId']
    const product = await query(Number(productId));
    if(product.length) {
      return {
        statusCode: 200,
        headers: corsConfig,
        body: JSON.stringify(product,null,2),
      };
    }else {
      return {
        statusCode: 404,
        headers: corsConfig,
        body: JSON.stringify({ message: `Opps! Product with id ${productId} not found.`}),
      };
    }
  }catch(err) {
    return {
      statusCode: 500,
      headers: corsConfig,
      body: JSON.stringify({ message: `There was an error trying to get data - ${e}`}),
    };
  }
}

export const createProduct = async(event) => {
  const { item } = event
  const putResult = await put(item, process.env.PRODUCT_TABLE_NAME)

  return {
    statusCode: 200,
    headers: corsConfig,
    body: JSON.stringify(putResult,null,2),
  };
}