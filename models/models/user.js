module.exports = (sequelize, Sequelize) => {
    const { INTEGER, STRING } =  Sequelize;

    const User = sequelize.define('user', {
        id: {
            type: INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        username: STRING,
        password: STRING,
        authority: INTEGER
    });

    return User;
}