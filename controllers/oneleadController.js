const axios = require('axios');
const { poolPromise, sql } = require('../db');
var logger = require('../logger'); // Import the custom logger
const config = require('config');
const fs = require('fs');
const path = require('path');

async function auth() {  
  try {
    console.log('One Lead API Auth Init...');

    // Fetch the label names and printer names from the config file
    const oneleadApi = config.get('leadApi');
    console.log("OneLead API: " + JSON.stringify(oneleadApi));
    
    const authPath = oneleadApi.basePath + "/" + oneleadApi.authPath;
    const username = oneleadApi.username;
    const password = oneleadApi.password;
    const authData = { username, password };
    
    // Make a POST request to the API to get the token
    const response = await axios.post(authPath, authData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Extract the token from the response
    const token = response.data.token;
    console.log("Received token: " + token);

    return token;

  } catch (err) {
    logger.error('OneLead API authentication error: ', err);
    throw err;
  }
}

async function lookup(leadId){

    
}

module.exports = { auth, lookup };