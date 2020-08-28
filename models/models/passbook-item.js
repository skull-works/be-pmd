const { INTEGER, STRING, DATEONLY } = require('sequelize');
const sequelize = require('../../util/database');

const PassbookItem =sequelize.define('passbookItem' , {
    id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    dates_paid: DATEONLY,
    balance: INTEGER,
    collection: INTEGER,
    remarks: STRING
})

module.exports = PassbookItem;