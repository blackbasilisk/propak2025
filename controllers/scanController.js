const { poolPromise, sql } = require('../db');
var logger = require('../logger'); // Import the custom logger

async function saveScanInfo(scanInfo) {    
  const { barcode, isPrintHR, isPrintBOD, isPrintSC, isPrintEidos, isPrintCL, isPrintDS, isPrintColorJet, userId } = scanInfo;
  logger.info('(scanController.saveScanResult) scanInfo: ' + JSON.stringify(scanInfo)); 
  if (!barcode) {
    throw new Error('Barcode is required');
  }

  if (!userId) {
    throw new Error('UserId is required');
  }

  try {
    //save scanned code to DB
    var query = 'INSERT INTO ScanResults (Barcode, IsPrintHR, IsPrintBOD, IsPrintSC, IsPrintEidos, IsPrintCL, IsPrintDS, IsPrintColorJet, UserId) VALUES (@barcode, @isPrintHR, @isPrintBOD, @isPrintSC, @isPrintEidos, @isPrintCL, @isPrintDS, @isPrintColorJet, @userId)';
    query += ' SELECT SCOPE_IDENTITY() AS rowId';
    const pool = await poolPromise;
    const result = await pool.request()
      .input('barcode', sql.NVarChar, barcode)
      .input('isPrintHR', sql.Bit, isPrintHR ? 1 : 0)
      .input('isPrintBOD', sql.Bit, isPrintBOD ? 1 : 0)
      .input('isPrintSC', sql.Bit, isPrintSC ? 1 : 0)
      .input('isPrintEidos', sql.Bit, isPrintEidos ? 1 : 0)
      .input('isPrintCL', sql.Bit, isPrintCL ? 1 : 0)
      .input('isPrintDS', sql.Bit, isPrintDS ? 1 : 0)
      .input('isPrintColorJet', sql.Bit, isPrintColorJet ? 1 : 0)      
      .input('userId', sql.Int, userId)      
      .query(query);
      
      if (result.recordset.length > 0) {
        logger.info('Barcode and checkbox selection saved successfully. Result:  ' + JSON.stringify(result.recordset[0]));   
        return { success: true, rowId: result.recordset[0].rowId };
      } else {
        return { success: false };
      }
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
    const query = 'SELECT Barcode, IsPrintHR, IsPrintBOD, IsPrintSC, IsPrintEidos, IsPrintCL, IsPrintDS, IsPrintColorJet FROM ScanResults WHERE Id = @rowId';
    
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

module.exports = { saveScanInfo, getScanInfo };