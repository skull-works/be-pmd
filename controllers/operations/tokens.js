const jwt = require('jsonwebtoken');
const store = require('../redis/authClient')

require('dotenv').config();

let cookieSecure = process.env.COOKIESECURE || false;

// access token
let accessTokenSecret = process.env.JWT_ACCESS_TOKEN_SECRET;
let jwtAccessTokenExpire = process.env.JWT_ACCESS_TOKEN_EXPIRE || '30s'
let accessTokenCookieAge = process.env.ACCESS_TOKEN_COOKIE_AGE || 120000
let accessTokenCookieOptions = { httpOnly: true, secure: cookieSecure, signed: true, expires:true, maxAge: accessTokenCookieAge };

// refresh token
let refreshTokenSecret = process.env.JWT_REFRESH_TOKEN_SECRET;
let jwtRefreshTokenExpire = process.env.JWT_REFRESH_TOKEN_EXPIRE || '60s'
let refreshTokenCookieAge = process.env.REFRESH_TOKEN_COOKIE_AGE || 120000
let refreshTokeCookieOptions = { httpOnly: true, secure: cookieSecure, signed: true, expires:true, maxAge: refreshTokenCookieAge };


const envVarCheck = () => {
    if(!accessTokenSecret) return({error: {error: true, message: 'JWT access token secret is not set'}});
    if(!refreshTokenSecret) return({error: {error: true, message: 'JWT refresh token secret is not set'}});
    if(!accessTokenCookieAge) return({error: {error: true, message: 'accessTokenCookieAge age is not set'}});
    if(!refreshTokenCookieAge) return({error: {error: true, message: 'refreshTokenCookieAge age is not set'}});
    if(!jwtAccessTokenExpire) return({error: {error: true, message: 'JWT access token age is not set'}});
    if(!jwtRefreshTokenExpire) return({error: {error: true, message: 'JWT refresh token age is not set'}});
    if(!accessTokenCookieOptions) return({error: {error: true, message: 'accessTokenCookieOptions option is not set'}});
    if(!refreshTokeCookieOptions) return({error: {error: true, message: 'refreshTokeCookieOptions option is not set'}});
    return false;
}

exports.generateAccessToken = async (user, res) => {
    let isEnvEmpty = envVarCheck();
    if(isEnvEmpty.error) return (isEnvEmpty);
    
    let accessToken = jwt.sign(user, accessTokenSecret, {expiresIn: jwtAccessTokenExpire});
    const setClientError = await store.setCLient(`AccessToken#${user.name}`, accessToken);
    if (setClientError.error) return setClientError;

    res.cookie('accessToken', accessToken, accessTokenCookieOptions);
    return accessToken
}

exports.generateRefreshToken = async (user, res) => {
    let isEnvEmpty = envVarCheck();
    if(isEnvEmpty.error) return (isEnvEmpty);
    
    let refreshToken = jwt.sign(user, refreshTokenSecret, {expiresIn: jwtRefreshTokenExpire});
    const setClientError = await store.setCLient(`RefreshToken#${user.name}`, refreshToken)
    if (setClientError.error) return setClientError;

    res.cookie('refresToken', refreshToken, refreshTokeCookieOptions)
    return refreshToken
}