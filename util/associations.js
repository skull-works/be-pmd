const Customer = require('../models/customer');
const Spouse = require('../models/spouse');
const Application = require('../models/application');
const Paybases = require('../models/payment_classifications');

const association = function(){
  Paybases;
  Spouse.belongsTo(Customer);
  Customer.hasOne(Spouse);
  Customer.hasMany(Application);
  Application.belongsTo(Customer);   
}

module.exports = association;

