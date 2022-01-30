const momentZone = require('moment-timezone');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const Logger = require('../../utility/logger');

require('dotenv').config();

const verifyToken = promisify(jwt.verify).bind(jwt);

// JWT secret
const accessTokenSecret = process.env.JWT_ACCESS_TOKEN_SECRET;

const cutOffStartPeriodHour = parseInt(process.env.START_HOUR, 10);
const cutOffStartPeriodMinute = parseInt(process.env.START_MINUTE, 10);
const cutOffEndPeriodHour = parseInt(process.env.END_HOUR, 10);
const cutOffEndPeriodMinute = parseInt(process.env.END_MINUTE, 10);

exports.CheckCutoff = async (req, res, next) => {
    Logger.info('=====[Function - CheckCutoff]=====');
    Logger.info('Checking Cutoff Validity');
    const currentTimeZone = momentZone.tz('Asia/Manila');

    const currentHour = currentTimeZone.hour();
    const currentMinute = currentTimeZone.minute();

    if (!req.signedCookies || !req.signedCookies.accessToken) {
        Logger.info('Access Denied - User not authenticated');
        return res.status(403).json({ error: { authenticated: false, message: 'ACCESS DENIED - User not authenticated' } });
    }

    const accessToken = req.signedCookies.accessToken;

    const verificationResult = await verifyToken(accessToken, accessTokenSecret, { ignoreExpiration: true });

    if (verificationResult.authority !== 1) {
        if (currentHour < cutOffStartPeriodHour) {
            Logger.info('Access Denied - current time does not meet the cut off start period - hour stage');
            return res.status(403).json({ error: { authenticated: false, message: 'ACCESS DENIED - WAIT FOR 8am' } });
        }
        else if (currentHour === cutOffStartPeriodHour && currentMinute < cutOffStartPeriodMinute) {
            Logger.info('Access Denied - current time does not meet the cut off start period - minute stage');
            return res.status(403).json({ error: { authenticated: false, message: 'ACCESS DENIED - WAIT FOR 8am' } });
        }
            
        if (currentHour > cutOffEndPeriodHour) {
            Logger.info('Access Denied - current time exceeds the cut off end period - hour stage');
            return res.status(403).json({ error: { authenticated: false, message: 'ACCESS DENIED - ALREADY BEYOND 7pm' } });
        }
        else if (currentHour === cutOffEndPeriodHour && currentMinute >= cutOffEndPeriodMinute) {
            Logger.info('Access Denied - current time exceeds the cut off end period - minute stage');
            return res.status(403).json({ error: { authenticated: false, message: 'ACCESS DENIED - ALREADY BEYOND 7pm' } });
        }
    }

    Logger.info('Access Allowed - Current Time valid for Cutoff Period');
    return next();
}