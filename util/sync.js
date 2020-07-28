const sequelize = require('./database');
const associations = require('./associations');

associations();


sequelize
.sync()
// .sync({force:true})
.then(() => {
    throw "Successfuly synced";
})
.catch(err => {
    console.log(err);
})