const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { isClientValid } = require('../redis/authClient');
const { generateAccessToken } = require('./tokens');
const Logger = require('../../utility/logger');

require('dotenv').config();

// JWT secrets
let accessTokenSecret = process.env.JWT_ACCESS_TOKEN_SECRET;
let refreshTokenSecret = process.env.JWT_REFRESH_TOKEN_SECRET;

let verifyToken = promisify(jwt.verify).bind(jwt);

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