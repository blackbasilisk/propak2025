const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;

// Define the custom format for log messages
const customFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

// Create the logger
const logger = createLogger({
  level: 'info', // Default log level
  format: combine(
    timestamp(), // Add a timestamp
    customFormat // Use the custom format
  ),
  transports: [
    new transports.Console({
      format: combine(
        colorize(), // Colorize the output
        timestamp(), // Add a timestamp
        customFormat // Use the custom format
      )
    }),
    new transports.File({ filename: 'combined.log' }) // Log to a file
  ]
});

// // If we're not in production then log to the `console` with the format:
// // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
// if (process.env.NODE_ENV !== 'production') {
//   logger.add(new transports.Console({
//     format: combine(
//       colorize(),
//       timestamp(),
//       customFormat
//     )
//   }));
//}

module.exports = logger;