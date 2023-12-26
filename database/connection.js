const sql = require('mssql');
const config = require('../config/db-config')

// Create a connection pool
const pool = new sql.ConnectionPool(config);



async function executeQuery(query) {
    console.log('execute query',query)
    try {
      await pool.connect();
      console.log('query',query)
      const result = await pool.request().query(query);
      console.log('result',result)
      if (result.recordset) {
        return result.recordset;
      } else {
        console.log('No records found.');
        return null; 
      }
    } catch (err) {
      throw new Error('Error executing query:', err);
    }
  }
  
  module.exports = {
    executeQuery
  };

