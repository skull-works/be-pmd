const Customer = require('../models/customer');
const Spouse = require('../models/spouse');
const Application = require('../models/application');

const association = function(){
  Spouse.belongsTo(Customer);
  Customer.hasOne(Spouse);
  Customer.hasMany(Application);
  Application.belongsTo(Customer);   
}

module.exports = association;

