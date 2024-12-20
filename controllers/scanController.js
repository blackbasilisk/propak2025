const { poolPromise, sql } = require('../db');
var logger = require('../logger'); // Import the custom logger

async function saveScanResult(scanInfo) {    
  const { ScannedCode, isPrintHR, isPrintBOD, isPrintSC, isPrintEidos, isPrintCL, isPrintDS, isPrintColorJet } = scanInfo;

  if (!ScannedCode) {
    throw new Error('QR code is required');
  }


  try {
    //save scanned code to DB
    var query = 'INSERT INTO ScanResults (ScannedCode, IsPrintHR, IsPrintBOD, IsPrintSC, IsPrintEidos, IsPrintCL, IsPrintDS, IsPrintColorJet) VALUES (@ScannedCode, @isPrintHR, @isPrintBOD, @isPrintSC, @isPrintEidos, @isPrintCL, @isPrintDS, @isPrintColorJet)';
    query += ' SELECT SCOPE_IDENTITY() AS rowId';
    const pool = await poolPromise;
    const result = await pool.request()
      .input('ScannedCode', sql.NVarChar, ScannedCode)
      .input('isPrintHR', sql.Bit, isPrintHR ? 1 : 0)
      .input('isPrintBOD', sql.Bit, isPrintBOD ? 1 : 0)
      .input('isPrintSC', sql.Bit, isPrintSC ? 1 : 0)
      .input('isPrintEidos', sql.Bit, isPrintEidos ? 1 : 0)
      .input('isPrintCL', sql.Bit, isPrintCL ? 1 : 0)
      .input('isPrintDS', sql.Bit, isPrintDS ? 1 : 0)
      .input('isPrintColorJet', sql.Bit, isPrintColorJet ? 1 : 0)      
      .query(query);

      logger.info('QR code and checkbox selection saved successfully. RowId: ' + result.recordset[0].rowId);   
      
      return result.recordset[0].rowId;
    }    
    catch (err) {
    logger.error('Error saving scan result:', err);
    throw err;
  }
}

async function getScanInfo(rowId) {
  if (!rowId) {
    throw new Error('rowId is required');
  }

  try {
    const query = 'SELECT ScannedCode, IsPrintHR, IsPrintBOD, IsPrintSC, IsPrintEidos, IsPrintCL, IsPrintDS, IsPrintColorJet FROM ScanResults WHERE Id = @rowId';
    
    const pool = await poolPromise;
    const result = await pool.request()
      .input('rowId', sql.Int, rowId)
      .query(query);

    if (result.recordset.length === 0) {
      throw new Error('Scan info not found using RowId ' + rowId);
    }
    
    const scanInfo = result.recordset[0];
    
    // Convert boolean values to strings
    for (const key in scanInfo) {
      if (typeof scanInfo[key] === 'boolean') {
        scanInfo[key] = scanInfo[key].toString();
      }
    }
   
    return { ...scanInfo };
  } catch (err) {
    logger.error('Error fetching scan info:', err);
    throw err;
  }
}

module.exports = { saveScanResult, getScanInfo };