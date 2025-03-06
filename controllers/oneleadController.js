const axios = require('axios');
const { poolPromise, sql } = require('../db');
var logger = require('../logger'); // Import the custom logger
const config = require('config');
const fs = require('fs');
const path = require('path');

async function auth() {  
  try {
      //get teqstra api username and password from config file
      const oneLeadApiConfig = config.get('oneleadApi');
      const username = oneLeadApiConfig.username;
      const password = oneLeadApiConfig.password;
      const apiBasePath = oneLeadApiConfig.basePath;
      //"basePath": "https://onelead.teqstra.com/api",
      const authPath = oneLeadApiConfig.authPath;
      //"authPath": "/auth/sentinel",
      const authUrl = `${apiBasePath}${authPath}`;
      const authData = {
        username: username,
        password: password
      };
      logger.info("Calling OneLead API: " + authUrl + " with data:" + JSON.stringify(authData));
      const response = await axios.post(authUrl, authData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000 // 30 seconds
      });
      // Assuming a successful response has a status code of 200
      if (response.status === 200) {
        // Log and return the response
        console.log('Response from OneLead Auth: ', response.data.accessToken);
        //logger.info('Response from OneLead Auth: ', );

        if(response.data.accessToken){
          const apiAuthToken = response.data.accessToken;

        return {
          status: response.status,
          success: true,
          token: apiAuthToken, // this is the token from the API
          message: "OK"
        };
      }
      else {
        return {
          status: response.status,
          success: false,
          message: `Request failed. Status: ${response.status}.`
        };
      }        
      } else {
        // Log and return the response
        logger.info('Error: Status ' + response.status + ' returned from server');
        return {
          status: response.status,
          success: false,
          message: `Request failed. Status: ${response.status}.`
        };
      }
  } catch (err) {
    logger.error('Error during OneLead Auth:', err);
    return {
      status: err.response ? err.response.status : 500,
      success: false,
      message: `Error getting authorization from OneLead API. Status: ${err.response ? err.response.status : 'unknown'}. Error: ${err.message}`
    };
  }
}

async function lookup(leadId){
  try{
    //get the token saved in the session
    const authResponse = await auth();

    if (authResponse) {  
        if (authResponse.success && authResponse.status === 200) {    
          apiToken = authResponse.token;
          //fetch OneLead API config     
          const oneLeadApiConfig = config.get('oneleadApi');   
          const apiBasePath = oneLeadApiConfig.basePath;
          const lookupPath = oneLeadApiConfig.lookupPath;
          const lookupUrl = `${apiBasePath}${lookupPath}/${leadId}`;
          logger.info("Calling OneLead API: " + lookupUrl);
          logger.info('Api token: ' + apiToken);

          const apiResponse = await axios.get(lookupUrl, {
            headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer "+ apiToken,
            'Accept': 'application/json'
            },
            timeout: 30000 // 30 seconds
          });
          
          //console.log("OneLeadAPI response: " + JSON.stringify(apiResponse));
          if(apiResponse.status === 200){
            console.log("apiResponse data: " + JSON.stringify(apiResponse.data));
            
            const lead = await convertOneLeadToContact(apiResponse.data.data);
            console.log("Converted lead object: " + JSON.stringify(lead));
            const response = { success: apiResponse.success, message: apiResponse.message, data: lead };
            return response;
          }
          else{
            return { success: false, message: "Error retrieving OneLead. Could not parse OneLead data." };
          }

        } else {
          return { success: false, message: "Error getting lookup response from OneLead API" };
        }
      }
      else {
        return { success: false, message: "Error getting authorization from OneLead API" };
      }
    }
    catch (err) {
      logger.error('Error during OneLead lookup:', err);
      return {
        success: false,
        message: `Error getting lookup response from OneLead API. Error: ${err.message}`
      };
    }
}

async function convertOneLeadToContact(oneLead){
  if(oneLead){
    console.log("Converting OneLead to Contact: " + JSON.stringify(oneLead));
    const contact = {
      "FirstName": oneLead.client_firstname,      
      "LastName":  oneLead.client_lastname,
      "ClientName": oneLead.client_name,
      "Email": oneLead.email,
      "JobTitle": oneLead.job_title,
      "Company": oneLead.company,
      "Phone": oneLead.contact_number,
      "Country": oneLead.country,
      "Province": oneLead.province,
    };
    return contact;
  }
  else{
    return null;
  }
}

module.exports = { lookup };