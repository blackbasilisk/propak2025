var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {    
  res.render('index', { title: 'Select a technology', user: req.session.user });
});

module.exports = router;
