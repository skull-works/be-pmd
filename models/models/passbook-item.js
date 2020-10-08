
module.exports = (sequelize, Sequelize) => {
    const { INTEGER, FLOAT, STRING, DATEONLY } = Sequelize;
    const PassbookItem = sequelize.define('passbookitem' , {
        id: {
            type: INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        dates_paid: {
            type: DATEONLY,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
        amount_finance: {
            type: FLOAT,
            allowNull: true,
            defaultValue: null
        },
        balance: {
            type: FLOAT,
            allowNull: false
        },
        collection: {
            type: FLOAT,
            allowNull: false
        },
        interest_penalty: {
            type: FLOAT,
            allowNull: true,
            defaultValue: null
        },
        collector_initial: {
            type: STRING,
            allowNull: true,
            defaultValue: null
        },
        remarks: {
            type: STRING,
            allowNull: true,
            defaultValue: null
        }
    });

    return PassbookItem;
}
