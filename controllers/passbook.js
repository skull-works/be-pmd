const { Customer, Application, Passbook, PassbookItems } = require('../models/index');


exports.postPassbook = async (req, res ,next) => {
    let passbook = {...req.body};
    let application = await Application.findByPk(req.body.AppId);
    return application.createPassbook(passbook)
    .then(passbook => {
        return res.status(200).json({
            success: true, 
            message: 'Successfuly Created Passbook', 
            passbook: passbook
        });
    })
    .catch(err => {
        next(err);
    });
};


exports.postPassbookItems = async (req, res, next) => {
    let passbook = await Passbook.findByPk(req.body.passbookId);
    return passbook.createPassbookItem(req.body)
    .then(item => {
        res.status(200).json({
            success: true,
            message: 'Payment created successfuly',
            passbookItem: item
        });
    })
    .catch(err => {
        console.log(err);
        next(err);
    });
};


exports.getPassbookItems = (req, res, next) => {
    return Application.findOne({
        attributes: ['id', 'pay_type', 'due_date', 'total'],
        include:[
            {
                model: Customer,
                attributes: ['id', 'area_code', 'first_name', 'last_name', 'contact_no'],
            },
            {
                model: Passbook,
                attributes: ['id', 'createdAt'],
                include: [{
                    model: PassbookItems,
                    attributes: ['id', 'dates_paid', 'amount_finance', 'balance', 'collection', 'interest_penalty', 'collector_initial', 'remarks']
                }]
            }
        ],
        where: {
            id: req.params.formId
        }
    })
    .then(data => {
        if(!data) throw({message: 'There is no existing application for the Form ID you have entered', statusCode: 404})
        if(!data.passbook) throw({message: 'There is no passbook for this application', statusCode: 404});
        return res.status(200).json(data);
    })
    .catch(err => {
        next(err);
    });
};