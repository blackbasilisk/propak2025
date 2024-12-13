var express = require('express');
var router = express.Router();
const { getPersonData } = require('../controllers/personController'); // Import the controller function
const { saveScanResult } = require('../controllers/scanController'); // Import the controller function

var logger = require('../logger'); // Import the custom logger
const { poolPromise, sql } = require('../db');

/* POST scanned result */
router.post('/save-scan-info', async function(req, res, next) {
  const { ScannedCode, isHRPrint, isBODPrint, isSCPrint, isEidosPrint } = req.body;

  if (!ScannedCode) {
    return res.status(400).json({ success: false, message: 'QR code is required' });
  }

  try {

     // Create an object containing the scanned data
     const scanInfo = {
      ScannedCode,
      isHRPrint: isHRPrint ? 1 : 0,
      isBODPrint: isBODPrint ? 1 : 0,
      isSCPrint: isSCPrint ? 1 : 0,
      isEidosPrint: isEidosPrint ? 1 : 0
    };


    const result = await saveScanResult(scanInfo);
    res.json({ success: true, message: 'QR code and checkbox values saved successfully' });
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