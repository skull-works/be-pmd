const app = require('./app');
const Logger = require('./utility/logger');

require('dotenv').config();
let port = process.env.PORT || 9000;

app.listen(port, () => {
    Logger.info(`server listening to port ${port}`);
});