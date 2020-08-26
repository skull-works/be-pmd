//testing frameworks
const { expect } = require('chai');
//mockData
const data = require('../data/general-data');
//models
const Customer = require('../../../models/customer');
exports.assertArray = (body, field, nameExpected) => {
    for(let i=0; i < body.length ;i++){
        expect(body[i].first_name).to.eql(nameExpected[i]);
        expect(body[i][`${field.fieldName}`]).to.eql(field.fieldValue);
    }
}

exports.createData = async (customers) => {
    for(let i=0; i < customers.length ;i++){
        for(let x=0; x < data.application[i].length ;x++){
            customers[i].createApplication(data.application[i][x]);
            if(customers[i].civil_status === 'M')
                customers[i].createSpouse(data.spouse[0]);
        }
    }
}

exports.dateTodayPlus1 = () => {
    let dateNow = (new Date()).toISOString().split('T')[0];
    let t = new Date();
    dateNow = (dateNow.substring(0, dateNow.length-2) + (t.getDate() +1));
    return dateNow;
}

exports.findCustomer = async (area_code) => {
    let customer;
    customer = await Customer.findOne({ where:{ area_code: area_code }});
    return customer;
}