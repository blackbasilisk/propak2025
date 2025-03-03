const axios = require('axios');
const { poolPromise, sql } = require('../db');
var logger = require('../logger'); // Import the custom logger
const config = require('config');
const fs = require('fs');
const path = require('path');

async function getAutomationParametersFromConfig() {  
  try {
    console.log('getAutomationParametersFromConfig');

    //fetch the label names and printer names from the config file
    const labelNames = config.get('labelNames');
    const printerNames = config.get('printerNames');
    const generalConfig = config.get('generalConfig');

    //build the JSON object to post to the automation server
    const automationPostParameters = { ...labelNames, ...printerNames, ...generalConfig};

    logger.info('Automation post parameters:', JSON.stringify(automationPostParameters));
    
    return automationPostParameters;
  } catch (err) {
    logger.error('Error building automation post parameters:', err);
    throw err;
  }
}

// Helper function to merge objects
function mergeObjects(target, source) {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      target[key] = source[key];
    }
  }
  return target;
}

async function writeTriggerDataToFile(automationDataJSON) {
    
  // Create the filename with the current date and time
  const now = new Date();
  const dateTime = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getFullYear()).slice(-2)}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
  const filename = `automationData-${dateTime}.json`;

  // Write the automationData object to a JSON file
  const filePath = path.join(__dirname, '../automationTriggers', filename);
  //const automationDataJSON = JSON.stringify(automationData, null, 2);
  fs.writeFileSync(filePath, automationDataJSON);
  logger.info(`Automation data saved to file: ${filePath}`);
}

async function getAutomationUrl() {  
    //build automation service values before posting
    const automationConfig = config.get('automationConfig');
    const automationAddress = automationConfig.serverAddress; 
    const automationPort = automationConfig.serverPort;
    const automationURL = `http://${automationAddress}:${automationPort}`;
   
    return automationURL; 
}

async function postToAutomationServer(leadInfo) {  
  try {
    console.log('Calling getAutomationParametersFromConfig');
    
    logger.info('LeadInfo data: ' + JSON.stringify(leadInfo));
    //build the JSON to post to the automation server    
    const automationParameters = await getAutomationParametersFromConfig();

    // Use the helper function to merge objects
   // var automationData = mergeObjects({ ...automationParameters }, leadInfo);      
    var automationData =  { ...automationParameters };
    var automationData = mergeObjects(automationData, leadInfo);
    const automationDataJSON =  JSON.stringify(automationData);
    logger.info('Automation data:  ' + automationDataJSON);

    writeTriggerDataToFile(automationDataJSON);

    const automationURL = await getAutomationUrl();
    logger.info("Automation URL: " +  automationURL); 

    // Perform the POST request with a timeout of 60 seconds
    const response = await axios.post(automationURL,  automationData  , {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 60000 // 60 seconds
    });
    
    // Assuming a successful response has a status code of 200
    if (response.status === 200) {
      // Log and return the response
      logger.info('Response from automation server:', response.data);
      return {
        status: response.status,
        success: true,
        message: response.data
      };
    } else {
      // Log and return the response
      logger.info('Error: Status ' + response.status + ' returned from server');
      return {
        status: response.status,
        success: false,
        message: `Unexpected response status: ${response.status}`
      };
    }
 
  } catch (err) {    
    logger.error('Error posting to automation server:', err);
    return {      
      success: false,
      message: err.message
    };    
  }
}

module.exports = { getAutomationParametersFromConfig, postToAutomationServer };