const { poolPromise, sql } = require('../db');
var logger = require('../logger'); // Import the custom logger

async function isUserAuthenticated(username, password) {
  if (!username || !password) {
    throw new Error('Username and password are required');
  }

  try {
    const pool = await poolPromise;

    const query = 'SELECT * FROM [User] WHERE [Username] = @username AND [Password] = @password';
    
    // Log the query with parameters (excluding sensitive information)
    logger.info(`Executing query: ${query} with parameters: username=${username}`);

    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .input('password', sql.NVarChar, password)
      .query(query);
     
    if (result.recordset.length === 0) {
      throw new Error('Invalid username or password!');
    }
    
    const user = result.recordset[0];
    console.log('user:', user);

    return { ...user};

  } catch (err) {
    logger.error('Error fetching checking username and password. Details:', err);
    throw err;
  }
}



module.exports = { isUserAuthenticated };