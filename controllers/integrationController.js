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

async function postToAutomationServer(leadInfo) {  
  try {
    
    //build the JSON to post to th automation server    
    const automationParameters = await getAutomationParametersFromConfig();

    const automationData = {leadInfo, ...automationParameters};

    //call automation service    
    const automationConfig = config.get('automationConfig');
    const automationAddress = automationConfig.serverAddress; 
    const automationPort = automationConfig.serverPort;
    const automationURL = `http://${automationAddress}:${automationPort}`;
    logger.info("Automation URL: " +  automationURL);    
    
    // Create the filename with the current date and time
    const now = new Date();
    const dateTime = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getFullYear()).slice(-2)}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const filename = `automationData-${dateTime}.json`;

    // Write the automationData object to a JSON file
    const filePath = path.join(__dirname, '../automationTriggers', filename);
    const automationDataJSON = JSON.stringify(automationData, null, 2);
    fs.writeFileSync(filePath, automationDataJSON);
    logger.info(`Automation data saved to file: ${filePath}`);

    // Perform the POST request with a timeout of 60 seconds
    const response = await axios.post(automationUrl, automationData, {
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
        isSuccess: true,
        message: response.data
      };
    } else {
      // Log and return the response
      logger.info('Error: Status ' + response.status + ' returned from server');
      return {
        status: response.status,
        isSuccess: false,
        message: `Unexpected response status: ${response.status}`
      };
    }
 
  } catch (err) {    
    logger.error('Error posting to automation server:', err);
    return {      
      isSuccess: false,
      message: err.message
    };    
  }
}

module.exports = { getAutomationParametersFromConfig, postToAutomationServer };