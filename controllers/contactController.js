const { poolPromise, sql } = require('../db');
const config = require('config');
var logger = require('../logger'); // Import the custom logger

async function getContactData(barcode) {
  if (!barcode) {
    throw new Error('Scan is required');
  }

  try {  
    console.log("barcode: " + barcode);

    // Fetch the person data from the database
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT Barcode, FirstName, LastName, Email, Company, Phone FROM Person');
    
    // Log the retrieved records for debugging
    console.log("Retrieved records: ", result.recordset);

    // Sample lead records exist, check if the barcode is in the sample database and return it, else call the OneLead API
    if (result.recordset.length > 0) {
      const sampleLead = result.recordset.find(lead => lead.Barcode.trim().toLowerCase() === barcode.trim().toLowerCase());
      if (sampleLead) {
        console.log("Found lead using sample code: " + JSON.stringify(sampleLead));
        return { ...sampleLead };
      } else {
        console.log("Lead not found in sample data, calling OneLead API...");
        // Call OneLead API here
      }
    } else {
      console.log("No records found in the database.");
    }
  } catch (err) {
    logger.error('Error fetching contact data: ', err);
    throw err;
  }
}

module.exports = { getContactData };