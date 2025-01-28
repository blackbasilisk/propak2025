const express = require('express');
const router = express.Router();

/* GET error page. */
router.get('/', function(req, res, next) {
  const message = req.query.message || 'An unknown error occurred.';
  res.render('error', { title: 'Error', message });
});

module.exports = router;