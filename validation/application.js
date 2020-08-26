const { body, param, query } = require('express-validator');
const Application = require('../models/application');
const { Op } = require('sequelize');
const helper = require('./helper/helper');
const { isValidDate } = require('iso-datestring-validator');


const message1 = "must be atleast 4 characters long";
const message2 = "must be atleast 2 characters long";
const message3 = "must be a number";
const message4 = "max characters must be 40 only";
const message5 = "max characters must be 30 only";
const message6 = "max characters must be 50 only";
const message7 = "must be character letters";


//post application -----


exports.appPostInputValidation = (req,res,next) => {
        return Application.findAll({
                attributes: ['id','first_name','last_name','status','type_loan'],
                where: {
                        area_code: req.body.area_code,
                        [Op.or]: [
                                { status:  {[Op.or]: ["PROCESSING", "APPROVED", "ONGOING"]}},
                                { type_loan: {[Op.eq]:  "NEW"}}
                        ]
                }})
        .then(applications => {
                let length = applications.length;

                if(length === 0){
                        if(req.body.type_loan !== "NEW"){
                                throw({
                                        subject: "type_loan",
                                        location: "Post request for applications",
                                        message: "Customer is new, Type of loan should be New",
                                        statusCode: 422
                                })
                        }
                }
                else if(length > 0){
                        //check if area code is already taken
                        if(applications[0].first_name !== req.body.first_name){
                                throw({
                                        subject: "area_code & name",
                                        location: "Post request for applictions",
                                        message: "Area code already taken by another customer, please check area code at customer list to know who uses it",
                                        statusCode: 422
                                })
                        }

                        if(applications.some(e => e.status === "PROCESSING" || e.status === "APPROVED" || e.status === "ONGOING")){
                                if(req.body.type_loan !== "SP"){
                                        throw ({
                                                subject: "existing", 
                                                statusCode: 409,
                                                location: "POST request for applications", 
                                                message: 'Has an PROCESSING/APPROVED/ONGOING application already, please review applications for this area code'
                                        });
                                }
                        }
                        else{
                                if(req.body.type_loan === "NEW"){
                                        throw({
                                            subject: "type_loan", 
                                            location: "POST request for applications", 
                                            message: 'Customer already has past application, Type of loan should be Renew',
                                            statusCode: 422
                                         }); 
                                }
                                else if(req.body.type_loan === "SP"){
                                        throw({
                                                subject: "type_loan",
                                                location: "POST request for applications", 
                                                message: 'SP not allowed if there are no PROCESSING/APPROVED/ONGOING application at the moment',
                                                statusCode: 422
                                        })
                                }
                        }
                }
                next();
        })
        .catch(err => {
                next(err);
        })
}


exports.appNamesCodeInput = [
        body('area_code', message1)
            .isString()
            .isLength({min:4})
            .trim(' '),
        body('first_name', message7)
            .isString()
            .trim()
            .optional(),
        body('last_name', message7)
            .isString()
            .trim()
            .optional(),
]


exports.appCustomerInput = [
    body('birth_date', 'must be a date')
            .isDate()
            .optional(),
    body('age', message3)
            .isNumeric()
            .optional(),
    body('contact_no', message3)
            .isNumeric()
            .optional(),
    body('street_address', message2 + ' ' + message4)
            .isString()
            .isLength({min:2, max:40})
            .trim()
            .optional(),
    body('barangay', message2 + ' ' + message4)
            .isString()
            .isLength({min:2, max:40})
            .trim()
            .optional(),
    body('city', message2 + ' ' + message4)
            .isString()
            .isLength({min:2, max:40})
            .trim()
            .optional(),
    body('province', message2 + ' ' + message4)
            .isString()
            .isLength({min:2, max:40})
            .trim()
            .optional(),
    body('religion', message2 + ' ' + message4)
            .isString()
            .isLength({min:2, max:40})
            .trim()
            .optional(),
    body('nationality', message2 + ' ' + message6)
            .isString()
            .isLength({min:2, max:50})
            .trim()
            .optional(),
    body('source_of_income', message2 + ' ' + message6)
            .isString()
            .isLength({min:2, max:50})
            .trim()
            .optional(),
    body('length_of_service', message2 + ' ' + message5)
            .isString()
            .isLength({min:2, max:30})
            .trim()
            .optional(),
    body('length_of_stay', message2 + ' ' + message5)
            .isString()
            .isLength({min:2, max:30})
            .trim()
            .optional(),
    body('occupation', message2 + ' ' + message4)
            .isString()
            .isLength({min:2, max:40})
            .trim()
            .optional(),
    body('civil_status')
            .isString()
            .custom((value, {req}) => helper.postApplicationCivilStatus(value, req))
            .trim()
            .optional()
]


exports.appSpouseInput = [ 
        body('Sfirst_name')
                .custom(((value,{req}) =>  helper.spouseInput(value, req, message7, 20))),
        body('Slast_name')
                .custom(((value,{req}) =>  helper.spouseInput(value, req, message7, 20))),
        body('Sbirth_date')
                .custom(((value,{req}) =>  helper.spouseDate(value,req))),
        body('Scontact_no')
                .custom(((value,{req}) =>  helper.spouseNumOnlyInString(value, req))),
        body('Sstreet_address')
                .custom(((value,{req}) =>  helper.spouseInput(value ,req, message7, 30))),
        body('Sbarangay')
                .custom(((value,{req}) =>  helper.spouseInput(value ,req, message7, 30))),
        body('Scity')
                .custom(((value,{req}) =>  helper.spouseInput(value ,req, message7, 30))),
        body('Sprovince')
                .custom(((value,{req}) =>  helper.spouseInput(value ,req, message7, 30))),
        body('Sreligion')
                .custom(((value,{req}) =>  helper.spouseInput(value ,req, message7, 30))),
        body('Ssource_of_income')
                .custom(((value,{req}) =>  helper.spouseInput(value ,req, message7, 30))),
]


exports.appApplicationInput = [
        body('days_to_pay', message3)
                .isNumeric(),
        body('amount_loan', message3)
                .isFloat(),
        body('pay_type')
                .custom( value => helper.postApplicationPayType(value)),
        body('mnths_to_pay')
                .isNumeric()
                .optional(),
        body('pay_breakdown', message3)
                .isFloat(),
        body('proc_fee', message3)
                .isFloat(),
        body('remarks')
                .isString().withMessage(message7)
                .isLength({max:100}).withMessage('max characters should be 100')
                .optional()
]


//get application -----


exports.jsonParse = (req, res, next) => {
        if(req.query.inputs)
                req.query.inputs = JSON.parse(req.query.inputs);
        next();
}


exports.appGetApplicationInput = [
        query('inputs.first_name', message7)
                .isString()
                .trim()
                .optional(),
        query('inputs.last_name', message7)
                .isString()
                .trim()
                .optional(),
        query('inputs.type_loan')
                .isString()
                .custom( value =>  helper.getApplicationTypeLoanHelper(value))
                .optional(),
        query('inputs.status')
                .isString()
                .custom( value =>  helper.getApplicationStatusHelper(value))
                .optional(),
        param("start_date")
                .isDate().withMessage('should be date'),
        param('end_date')
                .isDate().withMessage('should be date')
                .custom((value, {req}) => {
                        req.query.inputs = req.query.inputs || {};
                        req.query.inputs.type_loan  =  req.query.inputs.type_loan ? req.query.inputs.type_loan  + '%' : '%';
                        req.query.inputs.status     =  req.query.inputs.status    ? req.query.inputs.status     + '%' : '%';
                        req.query.inputs.first_name =  req.query.inputs.first_name? req.query.inputs.first_name + '%' : '%';
                        req.query.inputs.last_name  =  req.query.inputs.last_name ? req.query.inputs.last_name  + '%' : '%';
                        return true;
                })
]


//get application-details -----


exports.getApplicationInputDetails = [
        param('area_code')
                .isString()
                .isLength({min:4}).withMessage('must be atleast 4 characters')
                .trim(),
        param('formId')
                .isNumeric().withMessage('Must be a number')
]


//update application -----


exports.getApplicationInputUpdate = [
        body('id')
            .isNumeric().withMessage('must be a number')
]
