const { validationResult } = require('express-validator');



exports.standardError = (subject, message, next) => {
        try{
            throw {
                errorType: "Logic Error",
                subject: subject, 
                location: "POST request for applications", 
                message: message,
                statusCode: 422
            };
        }catch(err){
            return next(err);
        }
    }


exports.errorValidation = (req,res,next) => {
    const errors = validationResult(req);
    
    if(!errors.isEmpty()){
        try{
            throw{
                errorType: "input validation",
                subject: errors.array()[0].msg.subject || "input validation",
                location: errors.array()[0].location || errors.array()[0].msg.location,
                field: errors.array()[0].param,
                message: errors.array()[0].msg.message || errors.array()[0].msg,
                statusCode:  errors.array()[0].msg.statusCode || 422
            }
        }catch(err){
            next(err);
        }
    }

    next();
}