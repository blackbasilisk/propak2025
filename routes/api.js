var express = require('express');
var router = express.Router();
const { getPersonData } = require('../controllers/contactController'); // Import the controller function
const { saveScanResult } = require('../controllers/scanController'); // Import the controller function

var logger = require('../logger'); // Import the custom logger
const { poolPromise, sql } = require('../db');

/* POST scanned result */
router.post('/save-scan-info', async function(req, res, next) {
  const { ScannedCode, isPrintHR, isPrintBOD, isPrintSC, isPrintEidos, isPrintCL, isPrintDS, isPrintColorJet } = req.body;

  if (!ScannedCode) {
    return res.status(400).json({ success: false, message: 'QR code is required' });
  }

  try {
     // Create an object containing the scanned data
     const scanInfo = {
      ScannedCode,
      isPrintHR: isPrintHR ? 1 : 0,
      isPrintBOD : isPrintBOD  ? 1 : 0,
      isPrintSC: isPrintSC ? 1 : 0,
      isPrintEidos:isPrintEidos ? 1 : 0,
      isPrintCL : isPrintCL ? 1 : 0,
      isPrintDS: isPrintDS ? 1 : 0,
      isPrintColorJet : isPrintColorJet ? 1 : 0,
    };


    const rowId = await saveScanResult(scanInfo);

    res.json({ success: true, message: 'QR code and checkbox values saved successfully', rowId: rowId});
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

/* GET person data using the QR Code that was scanned */
router.get('/get-person-data', async function(req, res, next) {
  const qrCode = req.query.qrCode;

  try {
    const person = await getPersonData(qrCode);
    res.json({ success: true, person });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;