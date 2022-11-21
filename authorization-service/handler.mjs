'use strict';


export const basicAuthorizer = async(event) => {
  const {headers} = event;

  const encodeAuth = Buffer.from(process.env.BASIC_AUTH_TOKEN).toString('base64');

  if(!headers.authorization){
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
   
  if(headers.authorization === `Basic ${encodeAuth}`) {
    return {
      statusCode:200,
      isAuthorized: true
    };
  }else {
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
