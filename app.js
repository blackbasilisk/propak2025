var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var logger = require('./logger'); // Import the custom logger
var fs = require('fs');
var https = require('https');
var config = require('config'); // Import the config module

var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api'); // Import the api router
var scanResultRouter = require('./routes/scan-result'); // Import the scan result router

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Configure morgan to use a custom format for HTTP log entries
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', {
  stream: {
    write: (message) => logger.info(`HTTP: ${message.trim()}`)
  }
}));

// Log application start
logger.info('Application starting...');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', apiRouter); // Use the router for API routes
app.use('/scan-result', scanResultRouter); // Use the scan result router

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