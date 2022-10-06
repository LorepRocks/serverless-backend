"use strict";
import { getAllProducts, getProductById } from './src/services/index.mjs'

export const getProducts = async (event) => {

  const data = await getAllProducts();
  return {
    statusCode: 200,
    body: JSON.stringify(data,null,2),
  };
};


export const getProductId = async (event) => {
  const productId = event.pathParameters['productId']
  const product = await getProductById(Number(productId));
  if(product) {
    return {
      statusCode: 200,
      body: JSON.stringify(product,null,2),
    };
  }else {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Opps! Product not found verify if id exists."}),
    };
  }
  
}