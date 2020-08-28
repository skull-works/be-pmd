const { sequelize, Paybases } = require('./index');


sequelize
.sync()
// .sync({force:true})
.then(() => {
    Paybases.bulkCreate([
        {
            pay_type:'DAILY',
            interest_rate:0.14,
            due_interest_rate: 0.7
        },
        {
            pay_type:'WEEKLY',
            interest_rate:0.1,
            due_interest_rate: 0.7
        },
        {
            pay_type:'MONTHLY',
            interest_rate:0.1,
            due_interest_rate: 0.7
        }
    ])
})
.then(() => {
    throw "Successfuly synced";
})
.catch(err => {
    console.log(err);
})