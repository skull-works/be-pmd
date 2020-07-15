const Application = require('../models/application');

exports.postAddApplication = (req,res) => {
    let body = req.body;
    console.log(body);
    Application.create({
        area_code: body.area_code,
        first_name: body.first_name,
        last_name: body.last_name,
        type_loan: body.type_loan,
        days_to_pay: body.days_to_pay,
        amount_loan: body.amount_loan,
        pay_type: body.pay_type,
        pay_breakdown: body.pay_breakdown,
        interest_rate: body.interest_rate,
        interest_due_rate: body.interest_due_rate,
        interest_amount: body. interest_amount,
        total: body.total,
        date_issued: Date.now(),
        due_date: body.due_date,
        status: 'PROCESSING',
        created_by: 'user',   // will change to req.user when login is available
        proc_fee: body.proc_fee,
        remarks: body.remarks
    })
    .then(customer => {
        return res.send(customer);
    })
    .catch(err => {
        return res.send(err);
    });
};