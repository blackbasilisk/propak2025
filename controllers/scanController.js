const { poolPromise, sql } = require('../db');
var logger = require('../logger'); // Import the custom logger

async function saveScanResult(scanInfo) {    
  const { ScannedCode, isHRPrint, isBODPrint, isSCPrint, isEidosPrint } = scanInfo;

  if (!ScannedCode) {
    throw new Error('QR code is required');
  }


  try {
    //save scanned code to DB

    const pool = await poolPromise;
    const result = await pool.request()
      .input('ScannedCode', sql.NVarChar, ScannedCode)
      .input('isHRPrint', sql.Bit, isHRPrint ? 1 : 0)
      .input('isBODPrint', sql.Bit, isBODPrint ? 1 : 0)
      .input('isSCPrint', sql.Bit, isSCPrint ? 1 : 0)
      .input('isEidosPrint', sql.Bit, isEidosPrint ? 1 : 0)
      .query('INSERT INTO ScanResults (ScannedCode, IsHRPrint, IsBODPrint, IsSCPrint, IsEidosPrint) VALUES (@ScannedCode, @isHRPrint, @isBODPrint, @isSCPrint, @isEidosPrint)');

    logger.info('QR code and checkbox selection saved successfully');   
    }    
    catch (err) {
    logger.error('Error saving scan result:', err);
    throw err;
  }
}

module.exports = { saveScanResult };