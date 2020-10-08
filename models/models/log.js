
module.exports = (sequelize, Sequelize) => {
    const { INTEGER, STRING, DATE, DATEONLY } = Sequelize;
    
    const Log = sequelize.define('log', {
        id: {
            type: INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        user: STRING,
        action: STRING,
        itemType: STRING,
        itemFormId: INTEGER,
        itemCreatedAt: DATEONLY,
        createdAt: DATE,
    });
    return Log;
}