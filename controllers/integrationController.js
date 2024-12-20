const axios = require('axios');
const { poolPromise, sql } = require('../db');
var logger = require('../logger'); // Import the custom logger
const config = require('config');

async function getAutomationParametersFromConfig() {  
  try {
    

    //fetch the label names and printer names from the config file
    const labelNames = config.get('labelNames');
    const printerNames = config.get('printerNames');

    //build the JSON object to post to the automation server
    const automationPostParameters = { ...labelNames, ...printerNames};

    logger.info('Automation post parameters:', JSON.stringify(automationPostParameters));
    
    return automationPostParameters;
  } catch (err) {
    logger.error('Error building automation post parameters:', err);
    throw err;
  }
}

async function postToAutomationServer(automationUrl, automationData) {  
  try {
      
    logger.info('Automation post parameters:', automationData);
    
    // Perform the POST request with a timeout of 60 seconds
    const response = await axios.post(automationUrl, automationData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 60000 // 60 seconds
    });
    
    // Log and return the response
    logger.info('Response from automation server:', response.data);

    return response.data;
  } catch (err) {
    logger.error('Error posting to automation server:', err);
    throw err;
  }
}

module.exports = { getAutomationParametersFromConfig, postToAutomationServer };