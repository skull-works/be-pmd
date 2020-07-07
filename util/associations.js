const Customer = require('../models/customer');
const Application = require('../models/application');

const association = function(){
  Customer.hasMany(Application);
  Application.belongsTo(Customer);   
}

module.exports = association;

