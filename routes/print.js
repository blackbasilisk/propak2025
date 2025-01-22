var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/', function(req, res, next) {    
  res.render('print', { title: 'Print', user: req.session.user });
});

module.exports = router;
