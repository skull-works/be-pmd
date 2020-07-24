const { validationResult } = require('express-validator');



exports.standardError = (subject, message) => {
        throw {
            errorType: "Logic Error",
            subject: subject, 
            location: "POST request for applications", 
            message: message
        };
    }


exports.errorValidation = (req,res,next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        throw{
            errorType: "input validation",
            subject: errors.array()[0].msg.subject || "input validation",
            location: errors.array()[0].location,
            field: errors.array()[0].param,
            message: errors.array()[0].msg.message || errors.array()[0].msg
        }
    }

    next();
}