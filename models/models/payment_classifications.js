
module.exports = (sequelize, Sequelize) => {
    const Paybase = sequelize.define('paybase', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNUll: false
        },
        pay_type: Sequelize.ENUM('DAILY','WEEKLY','MONTHLY'),
        interest_rate: Sequelize.FLOAT,
        due_interest_rate: Sequelize.FLOAT
    })
    return Paybase;
}