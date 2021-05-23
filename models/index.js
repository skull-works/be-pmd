
require('dotenv').config();
var dbName = process.env.DBNAME;
var dbUser = process.env.USER;
var dbHost = process.env.HOST;
var dbPass = process.env.PASS;


//db connect
const Sequelize = require('sequelize');
const sequelize = new Sequelize(dbName, dbUser, dbPass, {
    dialect: 'mysql',
    host: dbHost,
    logging: false,
  });


//return object
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

//models
db.Application = require('./models/application')(sequelize, Sequelize);
db.Passbook = require('./models/passbook')(sequelize, Sequelize);
db.PassbookItems = require('./models/passbook-item')(sequelize, Sequelize);
db.Customer = require('./models/customer')(sequelize, Sequelize);
db.Spouse = require('./models/spouse')(sequelize, Sequelize);
db.Paybases = require('./models/payment_classifications')(sequelize, Sequelize);
db.User = require('./models/user')(sequelize, Sequelize);
db.Log = require('./models/log')(sequelize, Sequelize);

//associations
db.Spouse.belongsTo(db.Customer);
db.Customer.hasOne(db.Spouse);

db.Customer.hasMany(db.Application);
db.Application.belongsTo(db.Customer);   

db.Application.hasOne(db.Passbook);
db.Passbook.hasMany(db.PassbookItems);



module.exports = db;