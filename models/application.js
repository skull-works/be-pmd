const Sequelize =  require('sequelize');
const sequelize =  require('../util/database');


const Application = sequelize.define('application', {
    id:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    area_code: {
        type: Sequelize.STRING(30),
        allowNull: false
    },
    first_name: {
        type: Sequelize.STRING(30),
        allowNull: false
    },
    last_name: {
        type: Sequelize.STRING(30),
        allowNull: false
    },
    type_loan: Sequelize.ENUM('NEW','RENEW','SP'),
    days_to_pay: Sequelize.INTEGER,
    amount_loan: Sequelize.FLOAT,
    pay_type: Sequelize.ENUM('DAILY', "WEEKLY", "MONTHLY"),
    pay_breakdown: Sequelize.FLOAT,
    mnths_to_pay: Sequelize.INTEGER,
    interest_amount: Sequelize.FLOAT,
    total: Sequelize.FLOAT,
    date_issued: Sequelize.DATEONLY,
    due_date: Sequelize.DATEONLY,
    status: Sequelize.ENUM('PROCESSING', 'APPROVED', 'REJECTED', 'ONGOING', 'CLOSED'),
    created_by: Sequelize.STRING(30),
    proc_fee: Sequelize.FLOAT,
    remarks: Sequelize.STRING
});

Application.cutomerAddApplication = (customer,body) => {
    return customer.createApplication({
        area_code: body.area_code,
        first_name: body.first_name,    
        last_name: body.last_name,
        type_loan: body.type_loan,
        days_to_pay: body.days_to_pay,
        amount_loan: body.amount_loan,
        pay_type: body.pay_type,
        pay_breakdown: body.pay_breakdown,
        mnths_top_pay: body.mnths_to_pay?body.mnths_to_pay:1,
        interest_amount: body.interest_amount,
        total: body.total,   
        date_issued: Date.now(),
        status: 'PROCESSING',
        created_by: 'user',
        proc_fee: body.proc_fee,
        remarks: body.remarks
    })
}

module.exports = Application;