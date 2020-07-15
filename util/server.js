const sequelize = require('./database');
const express = require('express');
const app = express();


const runServer = (port) => {
    sequelize
    .sync()
    .then(() => {
        app.listen(port, () => {
            console.log(`server listen to port ${port}`);
        });
    })
    .catch(err => {
        console.log(err);
    })
}


module.exports = runServer;