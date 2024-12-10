var express = require('express');
var router = express.Router();

/* GET scan result page. */
router.get('/', function(req, res, next) {
  const qrCode = req.query.qrCode;
  // Fetch customer info based on the QR code
  // Simulate fetching customer info
  const customerInfo = {
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '123-456-7890',
    email: 'john.doe@example.com',
    companyName: 'Example Corp'
  };
  res.render('scan-result', { title: 'Scan Result', customerInfo });
});

module.exports = router;