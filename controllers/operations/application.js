const { Paybases } = require('../../models/index');


exports.CalculateLoan = (body, amount_loan, application) => {
    return Paybases.findOne({
        attributes:['interest_rate'],
        where:{
            pay_type: application.pay_type
        }
    })
    .then(paybase => {
        if(body.fieldName === 'pay_type'){
            if(body.fieldValue === 'DAILY'){
                application.mnths_to_pay = null;
                application.interest_amount = (amount_loan * paybase.interest_rate);
            }
            else if(body.fieldValue === 'WEEKLY' || body.fieldValue === 'MONTHLY'){
                application.mnths_to_pay    = body.mnths_to_pay ? body.mnths_to_pay : (application.mnths_to_pay === 0 ? 1 : application.mnths_to_pay );
                application.interest_amount = (amount_loan * paybase.interest_rate) * (application.mnths_to_pay);
            }
        }
        else if(body.fieldName === 'amount_loan'){
            if(application.pay_type === 'DAILY')
                application.interest_amount = (amount_loan * paybase.interest_rate);
            else if(application.pay_type === 'WEEKLY' || application.pay_type === 'MONTHLY')
                application.interest_amount = (amount_loan * paybase.interest_rate) * (application.mnths_to_pay);
        }
        application.interest_amount = application.interest_amount.toFixed(2);
        application.total = (+application.interest_amount + +application.amount_loan).toFixed(2);
        return application.save();
    });
};


exports.updateTypeBothUpdateApplication = async (data, req, Message) => {
    if(req.body.updateType === 'both'){
        let applications = await data.getApplications({ attributes: ['id','area_code',`${req.body.fieldName}`] })
        let num = 0;
        applications.forEach(a => {
            ++num;
            a[`${req.body.fieldName}`] = req.body.fieldValue;
            a.save();
        })
        Message = Message + ` and ${num} Applications Successfuly`;
        return Message;
    }
    Message = `${req.body.fieldName} updated successfuly`;
    return Message;
};
