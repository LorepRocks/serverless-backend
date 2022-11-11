'use strict';


export const basicAuthorizer = async(event) => {
  const {headers} = event;

  const encodeAuth = Buffer.from(process.env.BASIC_AUTH_TOKEN).toString('base64');

  if(!headers.authorization){

    console.log('__no authorization header')
    return {
      statusCode:401,
      isAuthorized: false,
      body: JSON.stringify(
        {
          message: 'Authorization header not provided',
        },
        null,
        2
      ),
    };
  }

  console.log('___header ', headers.authorization)
  console.log('___ encode', `Basic ${encodeAuth}`)
   
  if(headers.authorization === `Basic ${encodeAuth}`) {
    console.log('__success')
    return {
      statusCode:200,
      isAuthorized: true
    };
  }else {
    console.log('___are not equals')
    return {
      statusCode:403,
      isAuthorized: false,
      body: JSON.stringify(
        {
          message: 'invalid authorization_token',
        },
        null,
        2
      ),

    };
  }
};
