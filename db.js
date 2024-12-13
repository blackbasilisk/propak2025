const sql = require('mssql');
const config = require('config');

console.log('Loading database configuration...');
const dbConfig = config.get('dbConfig');
console.log('Database configuration loaded:', dbConfig);

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log('Connected to MSSQL');
    return pool;
  })
  .catch(err => {
    console.error('Database Connection Failed! Bad Config: ', err);
    throw err;
  });

module.exports = {
  sql, poolPromise
};