const { poolPromise, sql } = require('../db');
var logger = require('../logger'); // Import the custom logger

async function getContactData(qrCode) {
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
    const scanInfo = result.recordset[0];
    //console.log('getContactData:', scanInfo);

    return { ...scanInfo};

  } catch (err) {
    logger.error('Error fetching person data:', err);
    throw err;
  }
}



module.exports = { getContactData };