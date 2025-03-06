const { poolPromise, sql } = require('../db');
var logger = require('../logger'); // Import the custom logger

async function saveLeadInfo(lead) {
  console.log("LeadController.saveLeadInfo (lead): " + JSON.stringify(lead));
  if (!lead) {
    throw new Error('Lead information is required');
  }

  // if (!lead.firstName  || !lead.lastName || !lead.phone) {
  //   throw new Error('First name, last name, and phone number are required fields');
  // }

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('firstName', sql.NVarChar, lead.firstName)
      .input('lastName', sql.NVarChar, lead.lastName)
      .input('clientName', sql.NVarChar, lead.clientName)
      .input('email', sql.NVarChar, lead.email)
      .input('company', sql.NVarChar, lead.company)
      .input('province', sql.NVarChar, lead.province)
      .input('country', sql.NVarChar, lead.country)
      .input('jobTitle', sql.NVarChar, lead.jobTitle)
      .input('phone', sql.NVarChar, lead.phone)
      .input('barcode', sql.NVarChar, lead.barcode)
      .input('userId', sql.Int, lead.userId)
      .input('isPrintBOD', sql.Bit, lead.isPrintBOD)
      .input('isPrintHR', sql.Bit, lead.isPrintHR)      
      .input('isPrintSC', sql.Bit, lead.isPrintSC)
      .input('isPrintEidos', sql.Bit, lead.isPrintEidos)
      .input('isPrintDS', sql.Bit, lead.isPrintDS)
      .input('isPrintCL', sql.Bit, lead.isPrintCL)
      .input('isPrintColorJet', sql.Bit, lead.isPrintColorJet)
      .input('isPrintDOD', sql.Bit, lead.isPrintDOD)
      .query('INSERT INTO Lead (FirstName, LastName, ClientName, Barcode, Company, Province, Country, JobTitle, Email, Phone, UserId, BOD, HR, SC, Eidos, DS, CL, ColorJet, DOD) VALUES (@firstName, @lastName, @clientName, @barcode, @company, @province, @country, @jobTitle, @email, @phone, @userId, @isPrintBOD, @isPrintHR, @isPrintSC, @isPrintEidos, @isPrintDS, @isPrintCL, @isPrintColorJet, @isPrintDOD)');      
      
    // Log the successful insertion
    logger.info('Lead information successfully saved.');

    // Return a success message or status
    return { success: true, message: 'Lead information successfully saved.' };

  } catch (err) {
    logger.error('Error saving lead information:', err);
    throw err;
  }
}

module.exports = { saveLeadInfo };