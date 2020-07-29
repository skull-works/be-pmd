exports.postAddApplication = async (req,res,next) => {
    let body = req.body;
    Paybases.findAll({where:{pay_type: body.pay_type}})
    .then(paybases => {
        console.log('1');
        if(paybases.length === 0){
            Errors.standardError('Paybases', 'Paybases not Found');
        }

        body.interest_amount = (body.amount_loan * paybases[0].interest_rate) * (body.mnths_to_pay?body.mnths_to_pay:1) ;
        body.interest_amount = body.interest_amount.toFixed(2);
        body.total = (+body.interest_amount + +body.amount_loan).toFixed(2);

        if(body.type_loan === 'NEW'){
            body.no_of_applications = 1;
            return Customer.create(body)
        }
        return Customer.findAll({where: {area_code: body.area_code}})
        .then(customers => {
            let customer = customers[0];
            customer.no_of_applications += 1;
            return  customer.save();
        })
    })
    .then(customer => {
        console.log('2');
            if(body.civil_status === 'M'){
                console.log('3');
                customer.createSpouse(body)
            }
        return customer;
    })
    .then(customer => {
        console.log('4');
        return Application.cutomerAddApplication(customer,body)
    })
    .then(application => {
        console.log('5');
        return res.status(201).send(JSON.stringify({
            type: 'success', 
            subject: 'success',
            name: application.area_code,
            message: 'Application added succesfuly'}));
    })
    .catch(err => {
        next(err);
    });
};