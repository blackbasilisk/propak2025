var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var logger = require('./logger'); // Import the custom logger
var fs = require('fs');
var https = require('https');
var config = require('config'); // Import the config module
var session = require('express-session');
var bodyParser = require('body-parser');

var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api'); // Import the api router
var scanResultRouter = require('./routes/scan-result'); // Import the scan result router
var loginRouter = require('./routes/login'); // Import the login router
var logoutRouter = require('./routes/logout'); // Import the login router

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Configure morgan to use a custom format for HTTP log entries
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', {
  stream: {
    write: (message) => logger.info(`${message.trim()}`)
  }
}));

// Log application start
logger.info('Application starting...');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session setup
app.use(session({
  secret: '6acb141c-d44c-4483-b674-ccc8ad030ea7',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: true,
    maxAge: 60 * 60 * 12 * 1000 // Session expiry time set to 12 hours
   } // Set to true if using HTTPS
}));

app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to check if user is logged in
app.use((req, res, next) => {
  if (req.session.user || req.path === '/login' || req.path.startsWith('/public')) {
    next();
  } else {
    req.session.returnTo = req.originalUrl;
    res.redirect('/login');
  }
});

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  res.locals.currentPath = req.path;
  next();
});

app.use('/', indexRouter);
app.use('/api', apiRouter); // Use the router for API routes
app.use('/scan-result', scanResultRouter); // Use the scan result router
app.use('/login', loginRouter); // Use the login router
app.use('/logout', logoutRouter); // Use the login router


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // Log the error
  logger.error(err.message);

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;