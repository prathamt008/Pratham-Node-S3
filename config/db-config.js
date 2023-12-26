// Config for your MS SQL Server
const config = {
    user: 'username',
    password: 'password',
    server: 'server',
    database: 'db',
    options: {
      encrypt: true,
      trustServerCertificate: true
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000 
    }
  };
  
module.exports = config;