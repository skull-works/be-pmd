const Sequelize =  require('sequelize');

require('dotenv').config();

var dbName = process.env.DBNAME;
var dbUser = process.env.USER;
var dbHost = process.env.HOST;
var dbPass = process.env.PASS;

const sequelize = new Sequelize(dbName, dbUser, dbPass, {
  dialect: 'mysql',
  host: dbHost,
  logging: false
});

module.exports = sequelize;