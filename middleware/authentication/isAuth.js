const jwt = require('jsonwebtoken');
const momentZone = require('moment-timezone');
const { promisify } = require('util');
const moment = require('moment');
const { authErrors } = require('../errors/errors');
const { isClientValid } = require('../../controllers/redis/authClient');
const { generateAccessToken } = require('../../controllers/operations/tokens');
const Logger = require('../../utility/logger');

require('dotenv').config();

// JWT secrets
let accessTokenSecret = process.env.JWT_ACCESS_TOKEN_SECRET;
let refreshTokenSecret = process.env.JWT_REFRESH_TOKEN_SECRET;

let verifyToken = promisify(jwt.verify).bind(jwt);

const currentTimeZone = momentZone.tz('Asia/Manila');

const regenerateAccessTokenThroughValidatingRefreshToken = async (res, next, refreshToken) => {
    Logger.info('=====[Function - regenerateAccessTokenThroughValidatingRefreshToken]=====');
    Logger.info('Creating new access token');
    try {
        // Verify JWT refreshToken
        const verifyRefreshToken = await verifyToken(refreshToken, refreshTokenSecret);

        // Verify refreshToken in redis
        const  { getValue, error } = await isClientValid(`RefreshToken#${verifyRefreshToken.name}`);
        if (error) throw error;
        else if (getValue !== refreshToken) throw { authenticated: false, message: 'Refresh Token did not match!!!!' };

        // Generate New AccessToken
        await generateAccessToken({ name: verifyRefreshToken.name }, res);

        Logger.info('User is Authenticated');
        return next();
    } catch (err) {
        if (err.toString() === 'TokenExpiredError: jwt expired') { 
            Logger.info('Unable to create new access token');
            Logger.info('Refresh Token Expired');
            return res.status(401).json({authenticated: false, message:'Session timed out, kindly login again'});
        }
        return res.status(401).json({authenticated: false, ...err });
    }
}

const validateCurrentAccessToken = async (accessToken) => {
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

exports.isAuthenticated = async (req, res, next) => {
    Logger.info('=====[Function - isAuthenticated]=====');
    Logger.info('Authenticating');
    if (req.signedCookies && req.signedCookies.accessToken) {
        const accessToken = req.signedCookies.accessToken;
        try {
            const { authenticated } = await validateCurrentAccessToken(accessToken);
            if (authenticated) {
                Logger.info('User is Authenticated');
                return next();
            }
        } catch (error) {
            if (error.toString() === 'TokenExpiredError: jwt expired') {
                const refreshToken = req.signedCookies.refresToken;
                return regenerateAccessTokenThroughValidatingRefreshToken(res, next, refreshToken);
            }
            return res.status(401).json({authenticated: false, ...error});
        }
    }
    return res.status(401).json({authenticated: false, message:'not authenticated'});
};