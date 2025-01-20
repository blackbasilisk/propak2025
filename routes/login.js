var express = require('express');
var router = express.Router();
var db = require('../db'); // Import your database module
var logger = require('../logger'); // Import the custom logger

const { isUserAuthenticated } = require('../controllers/userController'); 

router.get('/', function(req, res, next) {
  res.render('login', { title: 'Login' });
});

router.post('/', async function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;

  if (!username || !password) {
    logger.warn('Login attempt with missing username or password');
    return res.redirect('/login');
  }

  try {
    const user = await isUserAuthenticated(username, password);
    if (user) {
      req.session.user = user;

      logger.info(`User ${req.session.user.Username} logged in`);
      res.redirect(req.session.returnTo || '/');
      delete req.session.returnTo;
    } else {
      logger.warn(`Failed login attempt for username: ${username}`);
      res.redirect('/login');
    }
  } catch (err) {
    logger.error('Error during authentication', err);
    res.redirect('/login');
  }

  // // Query the database to check credentials
  // db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function(err, results) {
  //   if (err) {
  //     logger.error(err);
  //     res.redirect('/login');
  //   } else if (results.length > 0) {
  //     req.session.user = username;
  //     res.redirect(req.session.returnTo || '/');
  //     delete req.session.returnTo;
  //   } else {
  //     res.redirect('/login');
  //   }
  // });
});

module.exports = router;