import AWS from 'aws-sdk';
const dynamo = new AWS.DynamoDB.DocumentClient();


export const scan = async (table) => {
  const scanResults = await dynamo.scan({
    TableName: table
  }).promise()
  return scanResults.Items;
}

export const getProduct = async (id) => {
  const params = {
    TableName: process.env.PRODUCT_TABLE_NAME,
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ":id":  id,
    }
  }
  try {
    const data = await dynamo.query(params).promise()
    return data.Items.length > 0 ? data.Items[0] : null
  } catch (err) {
    return err
  }
}

export const put = async (item, table) => {
  const putResults = await dynamo.put({
    TableName: table,
    Item: item
  }).promise()

  return putResults;
}

export const getStock = async (productId) => {
  const params = {
    TableName: process.env.STOCKS_TABLE_NAME,
    KeyConditionExpression: "product_id = :product_id",
    ExpressionAttributeValues: {
      ":product_id":  productId ,
    }
  }
  try {
    const data = await dynamo.query(params).promise()
    return data.Items.length > 0 ? data.Items[0] : { count: 0 }
  } catch (err) {
    return err
  }
}

export const validateItem = (item) => {
    let error = ''

    if(!item.title){
        error = 'property title is missing and is required!'
    }
    if(!item.description) {
        error = 'property description is missing and is required!'
    }
    if(!item.price) {
        error = 'property price is missing and is required!'
    }
    if(!item.count) {
        error = 'property count is missing and is required!'
    }

    return {
        isValid: error ? false: true,
        error
    }
}

