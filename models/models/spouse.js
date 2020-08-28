
module.exports = (sequelize, Sequelize) => {
    const Spouse = sequelize.define('spouse', {
        id:{
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        Sfirst_name: Sequelize.STRING(30),
        Slast_name: Sequelize.STRING(30),
        Sbirth_date: Sequelize.DATEONLY,
        Sstreet_address: Sequelize.STRING(30),
        Sbarangay: Sequelize.STRING(30),
        Scity: Sequelize.STRING(30),
        Sprovince: Sequelize.STRING(30),
        Sreligion: Sequelize.STRING(30),
        Ssource_of_income: Sequelize.STRING(30),
        Snationality: Sequelize.STRING(30),
        Scontact_no: Sequelize.STRING(20),
    });
    return Spouse;
}

