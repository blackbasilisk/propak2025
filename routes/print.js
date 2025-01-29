var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {    
// Retrieve query parameters
// const {
//   leadId,
//   firstName,
//   lastName,
//   company,
//   email,
//   phone,
//   isPrintHR,
//   isPrintBOD,
//   isPrintSC,
//   isPrintEidos,
//   isPrintCL,
//   isPrintDS,
//   isPrintColorJet,
//   isPrintDOD
// } = req.query;
  const printInfo = req.query;

  // build the values needed for the automation

  console.log('print.js GET printInfo: ' + JSON.stringify(printInfo));

  res.render('print', { title: 'Print', user: req.session.user, printInfo });
});

module.exports = router;
