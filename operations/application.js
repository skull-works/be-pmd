exports.CalculateLoan = (body, amount_loan,application) => {
    Paybases.findOne({
        attributes:['interest_rate'],
        where:{
            pay_type: application.pay_type
        }
    })
    .then(paybase => {
        if(body.fieldValue === 'DAILY')
            application.mnths_to_pay = 1;
        else
            application.mnths_to_pay = body.mnths_to_pay?body.mnths_to_pay:application.mnths_to_pay;
        application.interest_amount = (amount_loan * paybase.interest_rate) * (application.mnths_to_pay);
        application.interest_amount = application.interest_amount.toFixed(2);
        application.total = (+application.interest_amount + +application.amount_loan).toFixed(2);
        return application.save()
    })
}