const { body, param } = require('express-validator');
const Application = require('../models/application');
const { Op } = require('sequelize');

const message1 = "must be atleast 4 characters long";
const message2 = "must be atleast 2 characters long";
const message3 = "must be a number";
const message4 = "max characters must be 40 only";
const message5 = "max characters must be 30 only";
const message6 = "max characters must be 50 only";

exports.appPostAreaCode = [
        body('area_code', message1)
            .isString()
            .isLength({min:4})
            .trim(' ')
            .custom((value, {req}) => {
                return Application.findAll({
                        attributes: ['id','first_name','last_name','status','type_loan'],
                        where: {
                                area_code: value,
                                [Op.or]: [
                                        { status:  {[Op.or]: ["PROCESSING", "APPROVED", "ONGOING"]}},
                                        { type_loan: {[Op.eq]:  "NEW"}}
                                ]
                        }})
                .then(applications => {
                        let length = applications.length;

                        if(length === 0 && req.body.type_loan !== "NEW"){
                                throw({
                                        subject: "type_loan",
                                        location: "Post request for applications",
                                        message: "Customer is new, Type of loan should be New"
                                })
                        }
                        else if(length > 0){
                                //check if area code is already taken
                                if(applications[0].first_name !== req.body.first_name){
                                        throw({
                                                subject: "area_code & name",
                                                location: "Post request for applictions",
                                                message: "Area code already taken by another customer, please check area code at customer list to know who uses it"
                                        })
                                }

                                if(applications.some(e => e.status === "PROCESSING" || e.status === "APPROVED" || e.status === "ONGOING")){
                                        if(req.body.type_loan !== "SP"){
                                                throw({
                                                        subject: "existing", 
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
                                                 }); 
                                        }
                                        else if(req.body.type_loan === "SP"){
                                                throw({
                                                        subject: "type_loan",
                                                        location: "POST request for applications", 
                                                        message: 'SP not allowed if there are no PROCESSING/APPROVED/ONGOING application at the moment',
                                                })
                                        }
                                }
                        }
                        return true;
                });
            }),
]

exports.appNamesInput = [
        body('first_name', message2)
            .isString()
            .isLength({min:2})
            .trim()
            .optional(),
        body('last_name', message2)
            .isString()
            .isLength({min:2})
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
    body('street_address', message2+message4)
            .isString()
            .isLength({min:2, max:40})
            .trim()
            .optional(),
    body('barangay', message2+message4)
            .isString()
            .isLength({min:2, max:40})
            .trim()
            .optional(),
    body('city', message2+message4)
            .isString()
            .isLength({min:2, max:40})
            .trim()
            .optional(),
    body('province', message2+message4)
            .isString()
            .isLength({min:2, max:40})
            .trim()
            .optional(),
    body('religion', message2+message4)
            .isString()
            .isLength({min:2, max:40})
            .trim()
            .optional(),
    body('nationality', message2+message6)
            .isString()
            .isLength({min:2, max:50})
            .trim()
            .optional(),
    body('source_of_income', message2+message6)
            .isString()
            .isLength({min:2, max:50})
            .trim()
            .optional(),
    body('length_of_service', message2+message5)
            .isString()
            .isLength({min:2, max:30})
            .trim()
            .optional(),
    body('length_of_stay', message2+message5)
            .isString()
            .isLength({min:2, max:30})
            .trim()
            .optional(),
    body('occupation', message2+message4)
            .isString()
            .isLength({min:2, max:40})
            .trim()
            .optional(),
    body('civil_status')
            .isString()
            .isLength({max:1})
            .trim()
            .optional()
]


const spouseInput = (value, req) => {
        if(req.body.civil_status === 'M' && !value){
                return Promise.reject({
                        subject: "civil status", 
                        location: "POST request for applications", 
                        message: "Should input spouse information"
                });
        }
        return true;
    }

exports.appSpouseInput = [
        body('Sfirst_name')
                .isString().withMessage(message2)
                .trim()
                .optional()
                .custom(((value,{req}) =>  spouseInput(value,req))),
        body('Slast_name')
                .isString().withMessage(message2)
                .trim()
                .optional()
                .custom(((value,{req}) =>  spouseInput(value,req))),
        body('Sbirth_date')
                .isDate().withMessage('Must be a date')
                .optional()
                .custom(((value,{req}) =>  spouseInput(value,req))),
        body('Scontact_no')
                .isNumeric().withMessage(message3)
                .optional()
                .custom(((value,{req}) =>  spouseInput(value,req))),
        body('Sstreet_address')
                .isString()
                .trim()
                .optional()
                .custom(((value,{req}) =>  spouseInput(value,req))),
        body('Sbarangay')
                .isString()
                .trim()
                .optional()
                .custom(((value,{req}) =>  spouseInput(value,req))),
        body('Scity')
                .isString()
                .trim()
                .optional()
                .custom(((value,{req}) =>  spouseInput(value,req))),
        body('Sprovince')
                .isString()
                .trim()
                .optional()
                .custom(((value,{req}) =>  spouseInput(value,req))),
        body('Sreligion')
                .isString()
                .trim()
                .optional()
                .custom(((value,{req}) =>  spouseInput(value,req))),
        body('source_of_income')
                .isString()
                .trim()
                .optional()
                .custom(((value,{req}) =>  spouseInput(value,req))),
    ]

exports.appApplicationInput = [
        body('days_to_pay', message3)
                .isNumeric(),
        body('amount_loan', message3)
                .isFloat(),
        body('pay_type')
                .isString()
                .isLength({min:5, max:7}),
        body('mnths_to_pay')
                .isNumeric()
                .optional(),
        body('pay_breakdown', message3)
                .isFloat(),
        body('proc_fee', message3)
                .isFloat(),
        body('remarks', 'max characters should be 100')
                .isString()
                .isLength({max:100})
                .optional()
]



exports.jsonParse = (req, res, next) => {
        if(req.query.inputs)
                req.query.inputs = JSON.parse(req.query.inputs);
        next();
}



exports.appGetApplicationInput = [
        param('inputs.first_name', message2)
                .isString()
                .isLength({min:2})
                .trim()
                .optional(),
        param('inputs.last_name', message2)
                .isString()
                .isLength({min:2})
                .trim()
                .optional(),
        param('inputs.type_loan')
                .isString()
                .isLength({min:2, max:5})
                .optional(),
        param('inputs.status')
                .isString()
                .isLength({min:6, max:10})
                .optional(),
        param("start_date")
                .isDate().withMessage('should be date'),
        param('end_date')
                .isDate().withMessage('should be date')
                .custom((value, {req}) => {
                        console.log(req.query.inputs);
                        req.query.inputs = req.query.inputs || {};
                        req.query.inputs.type_loan  =  req.query.inputs.type_loan  || '%';
                        req.query.inputs.status     =  req.query.inputs.status     || '%';
                        req.query.inputs.first_name =  req.query.inputs.first_name || '%';
                        req.query.inputs.last_name  =  req.query.inputs.last_name  || '%';
                        return true;
                })
]


exports.getApplicationInputDetails = [
        param('area_code')
                .isString()
                .isLength({min:4}).withMessage('must be atleast 4 characters')
                .trim(),
        param('formId')
                .isNumeric().withMessage('Must be a number')
]


exports.getApplicationInputUpdate = [
        body('id')
                .isNumeric().withMessage('must be a number')
]
