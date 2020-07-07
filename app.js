//npm packages
const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
//local modules
const sequelize = require('./util/database');
const associations = require('./util/associations');

require('dotenv').config();
const app = express();
let port = process.env.PORT || 9000;

//configurations for swagger
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'PMD API',
            description: "PMD API Information",
            contact: {
                name: "Marco Theo A. Butalid"
            },
            servers: ["http://localhost:9000"]
        }
    },
    // ['.routes/*.js'] api located within a folder
    apis: ["app.js"]
};


const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));






associations();

sequelize
    .sync()
    .then(() => {
        app.listen(port);
    })
    .catch(err => {
        console.log(err);
    })
