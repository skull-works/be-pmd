const moment = require('moment');

const dateToday = () => {
    let dateNow = moment().add(1, 'days').format('YYYY-MM-DD');
    return dateNow;
}

module.exports = {
    dateToday
}