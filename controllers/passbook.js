const { Customer, Application, Passbook, PassbookItems, Log } = require('../models/index');
const moment = require('moment');

exports.postPassbook = async (req, res ,next) => {
    let passbook = {...req.body};
    let application = await Application.findByPk(req.body.AppId);
    return application.createPassbook(passbook)
    .then(async passbook => {
        if(passbook){
            application.status = 'ONGOING';
            await application.save();
            return res.status(200).json({
                success: true, 
                message: 'Successfuly Created Passbook', 
                passbook: passbook
            });
        }
        return res.json({message: 'failed to create passbook'});
    })
    .catch(err => {
        next(err);
    });
};


exports.postPassbookItems = async (req, res, next) => {
    let passbook = await Passbook.findByPk(req.body.passbookId);
    return passbook.createPassbookitem(req.body)
    .then(async item => {
        if(item && req.body.balance === 0 ){
            let application = await Application.findByPk(req.body.applicationId);
            application.status = 'CLOSED';
            await application.save();
        }
        res.status(200).json({
            success: true,
            message: 'Payment created successfuly',
            passbookItem: item,
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


exports.delPassbookItem = async (req, res, next) => {
    try{
        let itemId = req.params.id;
        let user = req.body.user;
        let result = await PassbookItems.destroy({ where: { id: itemId } })
        if(result === 1){
            await Log.create({
                user: user,
                action: `Deleted collection ${req.params.collection}`,
                itemType: 'passbook payment',
                itemFormId: req.params.formId,
                itemCreatedAt: req.params.dates_paid,
            });
            return res.sendStatus(204);
        }
        return res.status(422).json({
            message: 'Unable to delete due to Id not existing'
        });
    }catch(err){
        next(err);
    }
};