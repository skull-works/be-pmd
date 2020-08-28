module.exports = (sequelize, Sequelize) => {
    const { INTEGER, STRING, DATEONLY } =  Sequelize;

    const Passbook = sequelize.define('passbook', {
        id: {
            type: INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        area_code: STRING,
        createdAt: DATEONLY
    });

    return Passbook;
}



