const { body, param } = require('express-validator');
const { Application, Passbook } = require('../../models/index');

//post passbook

exports.passbookCheck = ( req, res ,next ) => {
    return Application.findAll({ 
        include: [{
            model: Passbook
        }],
        where: {
            area_code: req.body.area_code
        }
    })
    .then(applications => {
        let appId = parseInt(req.body.AppId);
        let currentApp = applications.filter(e => e.id === appId);
        if(currentApp[0].get().passbook){
            throw({
                subject: "application status", 
                statusCode: 422,
                location: "POST request for passbook", 
                message: 'This application already has a passbook, kindly double check'
            });
        }
        else if(currentApp[0].status !== "APPROVED"){
            throw({
                subject: "application status", 
                statusCode: 422,
                location: "POST request for passbook", 
                message: 'This application is not approved, kindly review the application'
            });
        }
        else if(currentApp[0].type_loan !== "SP" && applications.some(e => e.status === "ONGOING" && e.id !== appId)){
            throw({
                subject: "application status", 
                statusCode: 422,
                location: "POST request for passbook", 
                message: 'This application still has an ongoing passbook, kindly finish that application first'
            });
        }
        next();
    })
    .catch(err => {
        next(err)
    })
}


exports.postBodyPassbook = [
    body('area_code')
        .isString()
        .isLength({min:4}).withMessage('must be atleast 4 characters')
        .trim(' '),
    body('AppId')
        .isNumeric().withMessage('must be a number')
]



// post passbook-items

exports.passbookItemCheckCleaning = (req, res, next) => {
    req.body.balance = req.body.balance - req.body.collection;
    next();
}


var messageNumeric = 'Should be Numerice or Decimal value';
exports.postBodyPassbookItems = [
    body('passbookId')
        .isNumeric().withMessage(messageNumeric),
    body('amount_finance')
        .isFloat().withMessage(messageNumeric)
        .optional(),
    body('balance')
        .isFloat().withMessage(messageNumeric),
    body('collection')
        .isFloat().withMessage(messageNumeric),
    body('interest_penalty')
        .isFloat().withMessage(messageNumeric)
        .optional(),
    body('collector_initial')
        .isString().withMessage('Must be letters')
        .isLength({ min:1 }).withMessage('Atleast 1 character')
        .optional(),
    body('remarks')
        .isString().withMessage('Must be letters')
        .isLength({ min:4 }).withMessage('Atleast 4 characters')
        .optional()
]




// get passbook-items

exports.getParamsPassbookItems = [
    param('formId')
        .isNumeric().withMessage('Should be a number')
]


// delete passbook-item / payment

exports.deleteParamsPassbookItems = [
    param('id')
        .isNumeric().withMessage('Should be a number'),
    param('formId')
        .isNumeric().withMessage('Should be a number'),
    param('collection')
        .isNumeric().withMessage('Should be a number'),
    param('dates_paid')
        .isDate().withMessage('should be date')
]