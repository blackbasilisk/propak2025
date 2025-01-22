const { poolPromise, sql } = require('../db');
var logger = require('../logger'); // Import the custom logger

async function getContactData(barcode) {
  if (!barcode) {
    throw new Error('Scan is required');
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('barcode', sql.NVarChar, barcode)
      .query('SELECT Barcode, FirstName, LastName, Email, Company, Phone FROM Person WHERE Barcode = @barcode');

    if (result.recordset.length === 0) {
      throw new Error('Person not found');
    }
    const scanInfo = result.recordset[0];
    console.log('getContactData:', scanInfo);

    return { ...scanInfo};

  } catch (err) {
    logger.error('Error fetching person data:', err);
    throw err;
  }
}



module.exports = { getContactData };