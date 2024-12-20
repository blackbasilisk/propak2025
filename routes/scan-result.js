var express = require('express');
var router = express.Router();
const logger = require('../logger');
const config = require('config');
const fs = require('fs');
const path = require('path');

const { getScanInfo } = require('../controllers/scanController'); 
const { getContactData } = require('../controllers/contactController'); 
const { getAutomationParametersFromConfig, postToAutomationServer } = require('../controllers/integrationController'); 

/* GET scan result page. */
router.get('/', async function(req, res, next) {        

    const rowId = req.query.rowId;
    // // Extract specific query parameters
    // const qrCode = req.query.qrCode;
    // const isPrintHR = req.query.isHRPrint === 'true';
    // const isPrintBOD = req.query.isBODPrint === 'true';
    // const isPrintSC = req.query.isSCPrint === 'true';
    // const isPrintEidos = req.query.isEidosPrint === 'true';
    // const isPrintCL = req.query.isLaserPrint === 'true';
    // const isPrintDS = req.query.isDSPrint === 'true';
    // const isPrintColorJet = req.query.isColorJetPrint === 'true';  
    // const queryParams = { qrCode, isPrintHR, isPrintBOD, isPrintSC, isPrintEidos, isPrintCL, isPrintDS, isPrintColorJet };

    logger.info('Row Id:' + rowId);

  if (!rowId) {
    return res.status(400).send('RowId is required');
  }

  try {
    //Get scan info from DB using the rowId
    const scanInfo = await getScanInfo(rowId);
    
    const scannedCode = scanInfo.ScannedCode;
    if(!scannedCode) {
      return res.status(400).send('ScannedCode is required'); 
    }
    
    const contactInfo = await getContactData(scannedCode);
    console.log('Contact info received from external service:', JSON.stringify(contactInfo));

    //build the JSON to post to th automation server    
    const automationParameters = await getAutomationParametersFromConfig();

    const automationData = { ...scanInfo, ...contactInfo, ...automationParameters };

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
     fs.writeFileSync(filePath, JSON.stringify(automationData, null, 2));
     logger.info(`Automation data saved to file: ${filePath}`);

    const automationPostResult = postToAutomationServer(automationURL, automationData);

    res.render('scan-result', { title: 'Scan Result', contactInfo, automationPostResult });

  } catch (err) {
    console.error('Error processing contact info and saving customer info:', err);
    res.status(500).send('Error fetching customer info');
  }
});

module.exports = router;