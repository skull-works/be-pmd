const moment = require('moment');


exports.getDates = (startDate, endDate) => {
    let arrDates = [];
    while(startDate <= endDate){
        arrDates.push(startDate);
        startDate = moment(startDate).add(1, 'days').format('YYYY-MM-DD');
    }
    return arrDates;
}