const momentZone = require('moment-timezone');

const Logger = require('../../utility/logger');

require('dotenv').config();
const cutOffStartPeriodHour = parseInt(process.env.START_HOUR, 10);
const cutOffStartPeriodMinute = parseInt(process.env.START_MINUTE, 10);
const cutOffEndPeriodHour = parseInt(process.env.END_HOUR, 10);
const cutOffEndPeriodMinute = parseInt(process.env.END_MINUTE, 10);

exports.CheckCutoff = (_req, _res, next) => {
    Logger.info('=====[Function - CheckCutoff]=====');
    Logger.info('Checking Cutoff Validity');
    const currentTimeZone = momentZone.tz('Asia/Manila');

    const currentHour = currentTimeZone.hour();
    const currentMinute = currentTimeZone.minute();

    if (currentHour < cutOffStartPeriodHour) {
        Logger.info('Access Denied - current time does not meet the cut off start period - hour stage');
        throw { authenticated: false, message: 'ACCESS DENIED - WAIT FOR 8am' };
    }
    else if (currentHour === cutOffStartPeriodHour && currentMinute < cutOffStartPeriodMinute) {
        Logger.info('Access Denied - current time does not meet the cut off start period - minute stage');
        throw { authenticated: false, message: 'ACCESS DENIED - WAIT FOR 8am' };
    }
        
    if (currentHour > cutOffEndPeriodHour) {
        Logger.info('Access Denied - current time exceeds the cut off end period - hour stage');
        throw { authenticated: false, message: 'ACCESS DENIED - ALREADY BEYOND 7pm' };
    }
    else if (currentHour === cutOffEndPeriodHour && currentMinute >= cutOffEndPeriodMinute) {
        Logger.info('Access Denied - current time exceeds the cut off end period - minute stage');
        throw { authenticated: false, message: 'ACCESS DENIED - ALREADY BEYOND 7pm' };
    }

    Logger.info('Access Allowed - Current Time valid for Cutoff Period');
    return next();
}