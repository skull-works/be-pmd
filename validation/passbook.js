const { body } = require('express-validator');
const { Application, Passbook } = require('../models/index');



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
        else if(currentApp[0].status === "ONGOING"){
            throw({
                subject: "application status", 
                statusCode: 422,
                location: "POST request for passbook", 
                message: 'This application already has a passbook, kindly check its passbook'
            });
        }
        else if(currentApp[0].type_loan !== "SP" && applications.some(e => e.status === "ONGOING" && e.id !== appId)){
            throw({
                subject: "application status", 
                statusCode: 422,
                location: "POST request for passbook", 
                message: 'Has still an ONGOING application, kindly finish that application first'
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