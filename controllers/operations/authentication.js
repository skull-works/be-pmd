const momentZone = require('moment-timezone');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { isClientValid } = require('../redis/authClient');
const { generateAccessToken } = require('./tokens');
const Logger = require('../../utility/logger');

require('dotenv').config();

// JWT secrets
const accessTokenSecret = process.env.JWT_ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.JWT_REFRESH_TOKEN_SECRET;

// Cutoff periods
const cutOffStartPeriodHour = parseInt(process.env.START_HOUR, 10);
const cutOffStartPeriodMinute = parseInt(process.env.START_MINUTE, 10);
const cutOffEndPeriodHour = parseInt(process.env.END_HOUR, 10);
const cutOffEndPeriodMinute = parseInt(process.env.END_MINUTE, 10);

const verifyToken = promisify(jwt.verify).bind(jwt);

exports.regenerateAccessTokenThroughValidatingRefreshToken = async (res, refreshToken) => {
    Logger.info('=====[Function - regenerateAccessTokenThroughValidatingRefreshToken]=====');
    Logger.info('Creating new access token');
    try {
        // Verify JWT refreshToken
        const verifyRefreshToken = await verifyToken(refreshToken, refreshTokenSecret);

        // Verify refreshToken in redis
        const  { getValue, error } = await isClientValid(`RefreshToken#${verifyRefreshToken.name}`);
        if (error) {
            Logger.info('Refresh Token not anymore in REDIS');
            Logger.info('Unable to create new access token');
            throw error;
        }
        else if (getValue !== refreshToken) throw { authenticated: false, message: 'Refresh Token did not match!!!!' };

        // Generate New AccessToken
        await generateAccessToken({ name: verifyRefreshToken.name }, res);

        return res.status(200).json({ authenticated: true, message: 'User is still authenticated' });
    } catch (err) {
        if (err.toString() === 'TokenExpiredError: jwt expired') { 
            Logger.info('Unable to create new access token');
            Logger.info('Refresh Token Expired');
            return res.status(401).json({ authenticated: false, message:'Session timed out, kindly login again'});
        }
        return res.status(401).json({ authenticated: false, ...err });
    }
}

exports.validateCurrentAccessToken = async (accessToken) => {
    Logger.info('=====[Function - validateCurrentAccessToken]=====');
    Logger.info('Validating current access token')
    // Verify JWT AccessToken
    const verificationResult = await verifyToken(accessToken, accessTokenSecret);
    
    // Verify AccessToken in redis
    const  { getValue, error } = await isClientValid(`AccessToken#${verificationResult.name}`);
    if (error) throw error;
    else if (getValue !== accessToken) throw { authenticated: false, message: 'Access Token did not match!!!!' };

    Logger.info('Current access token valid');
    return { authenticated: true };
}

exports.CheckCutoffOperation = (authority, res) => {
    Logger.info('=====[Function - CheckCutoffOperation]=====');
    Logger.info('Checking Cutoff Validity');
    const currentTimeZone = momentZone.tz('Asia/Manila');

    const currentHour = currentTimeZone.hour();
    const currentMinute = currentTimeZone.minute();

    if (authority !== 1) {
        if (currentHour < cutOffStartPeriodHour) {
            Logger.info('Access Denied - current time does not meet the cut off start period - hour stage');
            res.status(403).json({ error: { authenticated: false, message: 'ACCESS DENIED - WAIT FOR 8am' } });
            return false
        }
        else if (currentHour === cutOffStartPeriodHour && currentMinute < cutOffStartPeriodMinute) {
            Logger.info('Access Denied - current time does not meet the cut off start period - minute stage');
            res.status(403).json({ error: { authenticated: false, message: 'ACCESS DENIED - WAIT FOR 8am' } });
            return false
        }
            
        if (currentHour > cutOffEndPeriodHour) {
            Logger.info('Access Denied - current time exceeds the cut off end period - hour stage');
            res.status(403).json({ error: { authenticated: false, message: 'ACCESS DENIED - ALREADY BEYOND 7pm' } });
            return false
        }
        else if (currentHour === cutOffEndPeriodHour && currentMinute >= cutOffEndPeriodMinute) {
            Logger.info('Access Denied - current time exceeds the cut off end period - minute stage');
            res.status(403).json({ error: { authenticated: false, message: 'ACCESS DENIED - ALREADY BEYOND 7pm' } });
            return false
        }
    }

    Logger.info('Access Allowed - Current Time valid for Cutoff Period');
    return true;
}