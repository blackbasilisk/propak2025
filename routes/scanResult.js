var express = require('express');
var router = express.Router();
const { getPersonData } = require('../controllers/personController'); // Import the controller function
const logger = require('../logger');

/* GET scan result page. */
router.get('/', async function(req, res, next) {
  const qrCode = req.query.qrCode;
  
  logger.info('QR code:', qrCode);

  if (!qrCode) {
    return res.status(400).send('QR code is required');
  }

  try {
    const customerInfo = await getPersonData(qrCode);
    
    console.log('Customer info:', customerInfo);
    res.render('scan-result', { title: 'Scan Result', customerInfo });

    //TODO: send data to automation http server


  } catch (err) {
    console.error('Error fetching customer info:', err);
    res.status(500).send('Error fetching customer info');
  }
});

module.exports = router;