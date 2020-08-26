const Sequelize =  require('sequelize');

require('dotenv').config();

var dbName = process.env.DBNAME || 'pmdDev';
var dbUser = process.env.USER || 'marcoadmin1';
var dbHost = process.env.DB_HOST || 'mysql';
var dbPass = process.env.PASS || 'marcopass1';

console.log('hostaddress:' + dbHost);

const sequelize = new Sequelize('pmd-dev', 'marcoadmin1', 'marcopass1', {
  dialect: 'mysql',
  host: '192.168.1.24',
  logging: false
});

// const sequelize = new Sequelize(dbName, dbUser, dbPass, {
//   dialect: 'mysql',
//   host: dbHost,
//   logging: false
// });

module.exports = sequelize;