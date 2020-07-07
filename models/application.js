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
    type_loan: Sequelize.STRING(10),
    days_to_pay: Sequelize.INTEGER,
    amount_loan: Sequelize.FLOAT,
    pay_type: Sequelize.ENUM('DAILY', "WEEKLY", "MONTHLY"),
    pay_breakdown: Sequelize.FLOAT,
    interest_rate: Sequelize.FLOAT,
    interest_due_rate: Sequelize.FLOAT,
    interest_amount: Sequelize.FLOAT,
    total: Sequelize.FLOAT,
    date_issued: Sequelize.DATE,
    due_date: Sequelize.DATE,
    status: Sequelize.ENUM('PROCESSING', 'APPROVED', 'REJECTED', 'ONGOING', 'CLOSED'),
    created_by: Sequelize.STRING(30),
    proc_fee: Sequelize.INTEGER,
    remarks: Sequelize.STRING
});

module.exports = Application;