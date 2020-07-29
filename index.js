const app = require('./app');
const associations = require('./util/associations');

require('dotenv').config();
let port = process.env.PORT || 9000;

associations();

app.listen(port, () => {
    console.log(`server listen to port ${port}`);
});