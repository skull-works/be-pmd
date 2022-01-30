const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// const momentZone = require('moment-timezone');
// const moment = require('moment');
const { generateAccessToken, generateRefreshToken } = require('./operations/tokens');
const { removeClient } = require('./redis/authClient');
const { authErrors } = require('../middleware/errors/errors');
const { User } = require('../models/index');
const { promisify } = require('util');
const { validateCurrentAccessToken, regenerateAccessTokenThroughValidatingRefreshToken, CheckCutoffOperation } = require('./operations/authentication');
const Logger = require('../utility/logger');

require('dotenv').config();
let accessTokenSecret = process.env.JWT_ACCESS_TOKEN_SECRET;
let refreshTokenSecret = process.env.JWT_REFRESH_TOKEN_SECRET;

// const currentTimeZone = momentZone.tz('Asia/Manila');
let verifyToken = promisify(jwt.verify).bind(jwt);

exports.generateCSRF = (req, res) => {
    res.status(200).json({csrfToken: req.csrfToken()});
};

exports.signUp = async (req, res, next) => {
    try{
        let signUpInfo = req.body;
        let hashPass = await bcrypt.hash(signUpInfo.password, 12);
        let isUserExist = await User.findOne({ where: { username: signUpInfo.username }});
        if (isUserExist) return res.json({success:false, message: "User already existing"});

        let user = await User.create({
            username: signUpInfo.username,
            password: hashPass,
            authority: signUpInfo.authority
        });
        if(!user) throw({message: "unable to create user"});
        return res.status(200).json({success:true, message: "User created Successfuly"});
    }catch(err){
        Logger.info(err);
        next(err);
    }
};

exports.Login = async (req, res, next) => {
    Logger.info('====[Function - Login]====');
    Logger.info('User Requesting to login');
    let username = req.body.username;
    let password = req.body.password;
    try{
        // Step 1 Extract user from database
        let user = await User.findOne({ where:{ username: username }});
        if(!user) throw({message: 'no user with this username', statusCode: 403});

        if (!CheckCutoffOperation(user.authority, res)) return;

        // Step 2 compare input password to password from database
        let doMatch = await bcrypt.compare(password, user.password);
        if(!doMatch) throw ({message: 'wrong password', statusCode: 403});
        // Step 3 create jwt token
        let token = { name: username, authority: user.authority };
        let accessToken = await generateAccessToken(token, res);
        let refreshToken = await generateRefreshToken(token, res);
 
        if(accessToken.error) return authErrors(accessToken.error, next);
        if(refreshToken.error) return authErrors(refreshToken.error, next);

        Logger.info('Login Successful!');
        res.status(200).json({isLoggedIn: true, message: 'Login successful'});
    }catch(err){
        next(err);
    }
};

exports.willLogout = async (req, res, next) => {
    Logger.info('=====[Function - willLogout]=====');
    if( req.signedCookies || req.cookies ){

        if ( req.signedCookies.accessToken && req.signedCookies.refresToken){
            const accessToken = req.signedCookies.accessToken;
            const refreshToken = req.signedCookies.refresToken;

            Logger.info('Removing access token from redis');
            const verifiedAccessToken = await verifyToken(accessToken, accessTokenSecret, { ignoreExpiration: true });
            let logoutAccessTokenResult = await removeClient(`AccessToken#${verifiedAccessToken.name}`);

            Logger.info('Removing refresh token from redis');
            const verifiedRefreshToken = await verifyToken(refreshToken, refreshTokenSecret, { ignoreExpiration: true });
            let logoutRefreshTokenResult = await removeClient(`RefreshToken#${verifiedRefreshToken.name}`);

            if (!logoutAccessTokenResult.logout || !logoutRefreshTokenResult.logout)
                return res.status(200).json({ logout: false, message: 'unable to logout' });
            
            return res.status(200).json({ logout: true, message: 'User logged out' });
        }
        else {
            Logger.info('user already logged out.')
            return res.status(200).json({ message: "User already logged out" });
        }
    }
    return res.status(422).json({ message: "Invalid user - accessing without the cookies for the tokens" });
};


exports.isStillAuthenticated = async (req, res, next) => {
    Logger.info('=====[Function - isStillAuthenticated]=====');
    Logger.info('Authenticating');
    if (req.signedCookies && req.signedCookies.accessToken) {
        const accessToken = req.signedCookies.accessToken;
        try {
            const { authenticated } = await validateCurrentAccessToken(accessToken);
            if (authenticated) return res.status(200).json({ authenticated: true, message: 'User is still authenticated' });
        } catch (error) {
            if (error.toString() === 'TokenExpiredError: jwt expired') {
                const refreshToken = req.signedCookies.refresToken;
                return regenerateAccessTokenThroughValidatingRefreshToken(res, refreshToken);
            }
            return res.status(401).json({ authenticated: false, ...error });
        }
    }
    return res.status(401).json({ authenticated: false, message:'not authenticated' });
};