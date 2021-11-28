const momentZone = require('moment-timezone');

const Logger = require('../../utility/logger');

exports.CheckCutoff = (_req, _res, next) => {
    Logger.info('=====[Function - CheckCutoff]=====');
    Logger.info('Checking Cutoff Validity');
    const currentTimeZone = momentZone.tz('Asia/Manila');
    
    const cutOffStartPeriodHour = 22;
    const cutOffStartPeriodMinute = 00;

    const cutOffEndPeriodHour = 22;
    const cutOffEndPeriodMinute = 15;

    const currentHour = currentTimeZone.hour();
    const currentMinute = currentTimeZone.minute();

    if (currentHour < cutOffStartPeriodHour) {
        Logger.info('Access Not Allowed - current time does not meet the cut off start period - hour stage');
        throw { authenticated: false, message: 'ACCESS DENIED - WAIT FOR 8am' };
    }
    else if (currentHour === cutOffStartPeriodHour && currentMinute < cutOffStartPeriodMinute) {
        Logger.info('Access Not Allowed - current time does not meet the cut off start period - minute stage');
        throw { authenticated: false, message: 'ACCESS DENIED - WAIT FOR 8am' };
    }
        
    if (currentHour > cutOffEndPeriodHour) {
        Logger.info('Access Not Allowed - current time exceeds the cut off end period - hour stage');
        throw { authenticated: false, message: 'ACCESS DENIED - ALREADY BEYOND 7pm' };
    }
    else if (currentHour === cutOffEndPeriodHour && currentMinute >= cutOffEndPeriodMinute) {
        Logger.info('Access Not Allowed - current time exceeds the cut off end period - minute stage');
        throw { authenticated: false, message: 'ACCESS DENIED - ALREADY BEYOND 7pm' };
    }

    Logger.info('All Good!');
    return next();
}