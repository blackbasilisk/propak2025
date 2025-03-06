var express = require('express');
var router = express.Router();
const { getContactData } = require('../controllers/contactController'); // Import the controller function
const { saveScanInfo } = require('../controllers/scanController'); // Import the controller function
const {saveLeadInfo } = require('../controllers/leadController'); // Import the controller function
const { postToAutomationServer } = require('../controllers/integrationController'); // Import the controller function
var logger = require('../logger'); // Import the custom logger

const { poolPromise, sql } = require('../db');

/* POST scanned result */
router.post('/save-scan-info', async function(req, res, next) {
  const { barcode, isPrintHR, isPrintBOD, isPrintSC, isPrintEidos, isPrintCL, isPrintDS, isPrintColorJet, userId } = req.body;

  if (!barcode) {
    return res.status(400).json({ success: false, message: 'Barcode is required' });
  }

  try {
     // Create an object containing the scanned data
     const scanInfo = {
      barcode: barcode,
      isPrintHR: isPrintHR ? 1 : 0,
      isPrintBOD : isPrintBOD  ? 1 : 0,
      isPrintSC: isPrintSC ? 1 : 0,
      isPrintEidos:isPrintEidos ? 1 : 0,
      isPrintCL : isPrintCL ? 1 : 0,
      isPrintDS: isPrintDS ? 1 : 0,
      isPrintColorJet : isPrintColorJet ? 1 : 0,
      userId: userId
    };

    const r = await saveScanInfo(scanInfo);

    logger.info('API save-scan-info:', r);
    if (r.success) {      
      res.status(200).json( { success: r.success, rowId: r.rowId });
    }
    else{
      logger.error("Failed to save scan result. Result: " + JSON.stringify(r));
      res.status(500).json({ success: false, message: 'Error saving QR code and checkbox values' });
      //throw new Error('Failed to save scan result');
    }
    
  } catch (err) {
    logger.error('Error saving scan result:', err);
    res.status(500).json({ success: false, message: 'Error saving QR code and checkbox values', error: err.message });
  }
});

/* POST log error */
router.post('/log-error', function(req, res, next) {
  const { message } = req.body;
  logger.error(message);
  res.status(200).json({ success: true });
});

/* POST log info */
router.post('/log-info', function(req, res, next) {
  const { message } = req.body;
  logger.info(message);
  res.status(200).json({ success: true });
});

/* GET contact data using the QR Code that was scanned */
router.get('/get-contact-info', async function(req, res, next) {
  const barcode = req.query.barcode;

  try {
    const response = await getContactData(barcode);
    res.json(response);


    // if (response.success){
    //   res.json({ success: true, data: response.data });
    // }
    // else{
    //   res.json({ success: false, data: response.data });
    // }
    
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


/* POST log info */
router.post('/save-lead-info', async function(req, res, next) {

  try {
    const lead = req.body;

    console.log('API save-lead-info:', lead);

    if (lead) {
      // const firstName = req.body.FirstName;
      // const lastName = req.body.LastName;
      // const email = req.body.Email;
      // const company = req.body.Company;
      // const phone = req.body.Phone;
      // const scannedCode = req.body.scannedCode;
      // const userId = req.body.Id;    
      // const isPrintHR = req.body.isPrintHR === 'false';
      // const isPrintBOD = req.body.isPrintBOD === 'false';
      // const isPrintSC = req.body.isPrintSC === 'false';
      // const isPrintEidos = req.body.isPrintEidos === 'false';
      // const isPrintDS = req.body.isPrintDS === 'false';
      // const isPrintCL = req.body.isPrintCL === 'false';
      // const isPrintColorJet = req.body.isPrintColorJet === 'false';
      
      //const lead = { FirstName, LastName, Email, Company, Phone, scannedCode, userId, isPrintHR, isPrintBOD, isPrintSC, isPrintEidos, isPrintDS, isPrintCL, isPrintColorJet };
      const result = await saveLeadInfo(lead);
      if(result.success){
        res.json({ success: true, message: 'Lead saved successfully', lead: lead});
      }
      else{
        throw new Error('Failed to save Lead Info: ' + result.message);
      }
    } 
  } catch (err) {
    logger.error('(1) Error saving lead info:', err);
    res.status(500).json({ success: false, message: 'Error saving lead info', err});
  }      
});



/* GET contact data using the QR Code that was scanned */
router.post('/print', async function(req, res, next) {
  
  const printInfo = req.body;
  
  // Add a key-value pair to the printInfo object
  printInfo.newKey = 'newValue';

  console.log('API: API print:', printInfo);

  try {
    //call the postToAutomationServer method in the IntegrationController
    //send the result back to the client

    //If the print option is BOD, execute the automation trigger twice
    //once for UP and once for GK
    var finalResult = { success: false, message: 'Failed to print' };

    if(printInfo.isPrintBOD && printInfo.isPrintBOD === 'true'){      
      printInfo.isPrintUP = 'false';
      printInfo.isPrintGK = 'true';

      const result1 = await postToAutomationServer(printInfo);
      console.log('API print:', result1);    
      
      if(!result1.success){
        res.status(500).json({ success: false, message: 'Failed to print BOD: GK failed' });
      }

      printInfo.isPrintUP = 'true';
      printInfo.isPrintGK = 'false';
      
      const result2 = await postToAutomationServer(printInfo);
      console.log('API print:', result2);   

      if (!result2.success) {
        res.status(500).json({ success: false, message: 'Failed to print BOD: UP failed' });
      } 

      if (!result1.success && !result2.success) {
        res.status(500).json({ success: false, message: 'Failed to print BOD: Both UP and GK failed' });
      } else if (!result1.success) {
        res.status(500).json({ success: false, message: 'Failed to print BOD: UP failed' });
      } else if (!result2.success) {
        res.status(500).json({ success: false, message: 'Failed to print BOD: GK failed' });
      } else {
        res.json(result1);
      }            
    } else {
      const result = await postToAutomationServer(printInfo);
      console.log('API print:', result);    
      res.json(result);
    }
    
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;