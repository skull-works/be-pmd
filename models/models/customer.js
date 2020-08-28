
module.exports = (sequelize, Sequelize) => {
    const Customer = sequelize.define('customer', {
        id:{
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        area_code: {
            type: Sequelize.STRING,
            allowNull: false
        },
        first_name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        last_name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        birth_date: {
            type: Sequelize.DATEONLY,
            allowNull: false
        },
        age: Sequelize.INTEGER,
        contact_no: Sequelize.STRING(20),
        street_address: Sequelize.STRING(30),
        barangay: Sequelize.STRING(30),
        city: Sequelize.STRING(30),
        province: Sequelize.STRING(30),
        religion: Sequelize.STRING(30),
        nationality: Sequelize.STRING(30),
        source_of_income: Sequelize.STRING(30),
        length_of_service: Sequelize.STRING(30),
        length_of_stay: Sequelize.STRING(30),
        occupation: Sequelize.STRING(30),
        civil_status: Sequelize.CHAR,
        no_of_applications: Sequelize.INTEGER
    });

    return Customer;
}
