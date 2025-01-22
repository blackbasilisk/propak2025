var express = require('express');
var router = express.Router();
const logger = require('../logger');
const config = require('config');
const fs = require('fs');
const path = require('path');

const { getAutomationParametersFromConfig, postToAutomationServer } = require('../controllers/integrationController'); 

/* GET scan result page. */
router.get('/', async function(req, res, next) {            
    const firstName = req.query.firstName;
    const lastName = req.query.lastName;
    const email = req.query.email;
    const company = req.query.company;
    const phone = req.query.phone;
    const isPrintHR = req.query.isPrintHR === 'false';
    const isPrintBOD = req.query.isPrintBOD === 'false';
    const isPrintSC = req.query.isPrintSC === 'false';
    const isPrintEidos = req.query.isPrintEidos === 'false';
    const isPrintDS = req.query.isPrintDS === 'false';
    const isPrintCL = req.query.isPrintLaser === 'false';
    const isPrintColorJet = req.query.isPrintColorJet === 'false';
                
    //const isPrintRequired = isPrintHR || isPrintBOD || isPrintSC || isPrintEidos || isPrintDS || isPrintCL || isPrintColorJet;

  if (!firstName || !lastName || !phone) {
    return res.status(400).send('First name, last name and phone are required.');
  }
  const leadInfo = { firstName, lastName, email, company, phone, isPrintHR, isPrintBOD, isPrintSC, isPrintEidos, isPrintDS, isPrintCL, isPrintColorJet };

  logger.info(JSON.stringify(leadInfo, null, 2));
  res.render('scan-result', { title: 'Result', leadInfo });

  //try {
    // //Get scan info from DB using the rowId
    // const scanInfo = await getScanInfo(rowId);
    
    // const scannedCode = scanInfo.ScannedCode;
    // if(!scannedCode) {
    //   return res.status(400).send('ScannedCode is required'); 
    // }
    
    // const contactInfo = await getContactData(scannedCode);
    // console.log('Contact info received from external service:', JSON.stringify(contactInfo));
    
    //NEW code . refactored by moving the parameter building to the integrationController
    // if(isPrintRequired){           
    //   const result = await postToAutomationServer(...leadInfo);
    //   const isSuccess = result.isSuccess;
    //   const message = result.message;
    // }
        
    // logger.info(JSON.stringify(result, null, 2));
    // res.render('scan-result', { title: 'Result', leadInfo });

  // } catch (err) {
  //   console.error('Error:', err);
  //   res.status(500).send('Error fetching customer info');
  // }
});

/* POST scan result page. */
router.post('/', function(req, res, next) {
  const { firstName, lastName, email, company, phone, isPrintHR, isPrintBOD, isPrintSC, isPrintEidos, isPrintDS, isPrintCL, isPrintColorJet } = req.body;
  
  if (!firstName || !lastName || !phone) {
    return res.status(400).send('First name, last name, and phone are required.');
  }

  const leadInfo = { firstName, lastName, email, company, phone, isPrintHR, isPrintBOD, isPrintSC, isPrintEidos, isPrintDS, isPrintCL, isPrintColorJet };

  logger.info(JSON.stringify(leadInfo, null, 2));
  res.render('scan-result', { title: 'Result', leadInfo });
});
module.exports = router;