//npm packages
const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');


const app = express();

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









app.listen(3000);