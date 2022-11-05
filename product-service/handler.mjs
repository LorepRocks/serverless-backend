"use strict";
import { validateItem, scan, getProduct, getStock, put } from './utils/index.mjs' 
import { nanoid } from 'nanoid';
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";


const REGION = "us-east-1";
const corsConfig = {
  "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
  "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
}

export const getProducts = async (event) => {
  try {
    console.log('calling getProducts...')
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
  }catch(err) {
    return {
      statusCode: 500,
      headers: corsConfig,
      body: JSON.stringify({ message: `There was an error on getProducts - ${err}`}),
    };
  }
};


export const getProductId = async (event) => {
  try {
    const productId = event.pathParameters['productId']
    console.log('calling getProductId with productId', productId)
    const product = await getProduct(productId)
    const stock = await getStock(productId)
    const { count } = stock 

    if(product) {
      product.count = count
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
      body: JSON.stringify({ message: `There was an error on getProductId - ${err}`}),
    };
  }
}

export const createProduct = async(event) => {
  try {
      const item = event.body ? JSON.parse(event.body) : {}
      console.log('calling create product with item', item)

      const { isValid, error } = validateItem(item)

      const productId = nanoid();

      const productItem = {
        id: productId,
        title: item.title,
        description: item.description,
        price: item.price
      }

      const stockItem ={
        product_id: productId,
        count: item.count
      }

      if(isValid) {
        await put(productItem, process.env.PRODUCT_TABLE_NAME)
        await put(stockItem, process.env.STOCKS_TABLE_NAME)

        return {
          statusCode: 200,
          headers: corsConfig,
          body: JSON.stringify(`product with id ${productId} created!`,null,2),
        };
      }else {
        return {
          statusCode: 400,
          headers: corsConfig,
          body: JSON.stringify({ message: error },null,2),
        };
      }
  } catch(err){
    return {
      statusCode: 500,
      headers: corsConfig,
      body: JSON.stringify(`There was an error executing createProduct - ${err}`),
    };
  }
}

export const catalogBatchProcess = async(event) => {
  const products = event.Records.map(({body}) => body)
  const ddbClient = new DynamoDBClient({ region: REGION });

  console.log('__products',products)


  const productId = nanoid();

  const params = {
    TableName: process.env.PRODUCT_TABLE_NAME,
  };

  do {
    const product = products.shift()
    const item = product.split(',')

    console.log('___item processed', item)
    params.Item = {
      id: {S: productId},
      title: { S: item[0]},
      description: { S: item[1]} ,
      price: { N: item[2]}
    }

    try{
      const data = await ddbClient.send(new PutItemCommand(params));
      console.log('___data',data)
    }catch(err){
      console.log('__err', err)
    }



  }while(products.length >= 1)


  return {
    statusCode: 400,
    headers: corsConfig,
    body: JSON.stringify({ message: "Hello catalogBatch" },null,2),
  };

}