// Config for your MS SQL Server
const config = {
    user: 'kondesk',
    password: 'K0nd3sk@3!4',
    server: '192.168.3.253',
    database: 'CommCRM',
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