const { poolPromise, sql } = require('../db');
var logger = require('../logger'); // Import the custom logger

async function getPersonData(qrCode) {
  if (!qrCode) {
    throw new Error('QR code is required');
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('qrCode', sql.NVarChar, qrCode)
      .query('SELECT GUID, FirstName, LastName, Email, Company, Phone FROM Person WHERE GUID = @qrCode');

    if (result.recordset.length === 0) {
      throw new Error('Person not found');
    }
    const customerInfo = result.recordset[0];
    return { ...customerInfo };
  } catch (err) {
    logger.error('Error fetching person data:', err);
    throw err;
  }
}

module.exports = { getPersonData };