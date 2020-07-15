//npm packages
const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const bodyParser = require('body-parser');
//local modules
const sequelize = require('./util/database');
const associations = require('./util/associations');
//routes
const applicationRoutes = require('./routes/application');

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
                name: "Marco Butalid"
            },
            servers: [`http://localhost:${port}`]
        }
    },
    apis: ['./routes/*.js']
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));



//middleware setup
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));



//middleware routes
app.use(applicationRoutes);




associations();

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
