const { isValidDate } = require('iso-datestring-validator');
//post applications

const isSpouseEmpty = () => {
        return Promise.reject({
                subject: "civil status", 
                location: "POST request for applications", 
                message: "Should input spouse information"
        });
}


exports.spouseDate = (value, req) => {
    if(!value){
        if(req.body.civil_status === 'M')
            return isSpouseEmpty();
        return true;
    }
    if(!isValidDate(value)){
        return Promise.reject({
            message: 'Must be a date'
        });
    }
    return true;
};


exports.spouseNumOnlyInString = (value, req) => {
    if(!value){
        if(req.body.civil_status === 'M')
            return isSpouseEmpty();
        return true;
    }
    else if(!(/^\d+$/.test(value)) || typeof value !== 'string'){
        return Promise.reject({
            message: 'must be a string digit'
        });
    }
    return true;
}


exports.spouseInput = (value, req, message, max) => {
    if(!value){
        if(req.body.civil_status === 'M')
            return isSpouseEmpty();
        return true;
    }
    else if(typeof value !== 'string'){
        return Promise.reject({
            message: message
        });
    }
    else if(value.length > max){
        return Promise.reject({
            message: `max length of value should be ${max}`
        });
    }
    return true;
};


exports.postApplicationCivilStatus = (value ,req) => {
    if(value !== 'M' && value !== 'S'){
        return Promise.reject({
                subject: "civil status",
                location: "Post request for applications",
                message: "Civil status should be either S or M",
                statusCode: 422
        });
    }
    else{
        return true;
    }
};


exports.postApplicationPayType = (value) => {
    if(value === 'DAILY' || value === 'WEEKLY' || value === 'MONTHLY'){
        return true;
    }
    return Promise.reject({
            subject: "pay type",
            location: "Post request for applications",
            message: "Invalid Paytype value",
            statusCode: 422
    });
}



// getApplications



exports.getApplicationTypeLoanHelper = (value) => {
    if(value === 'NEW' || value === 'RENEW' || value === 'SP' ){
        return true;
    }
    return Promise.reject({
            subject: "type_loan", 
            location: "POST request for applications", 
            message: "invalid loan type"
    });
}


exports.getApplicationStatusHelper = (value) => {
    if(value === 'PROCESSING' || value === 'APPROVED' || value === 'ONGOING' || value === 'CLOSED' || value === 'REJECTED' ){
        return true;
    }
    return Promise.reject({
            subject: "status", 
            location: "POST request for applications", 
            message: "invalid status"
    });
}
