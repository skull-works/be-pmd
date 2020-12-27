const jwt = require('jsonwebtoken');
// const moment = require('moment');
const { authErrors } = require('../errors/errors');
const { isClientValid } = require('../../controllers/redis/authClient');
const { generateAccessToken } = require('../../controllers/operations/tokens');

require('dotenv').config();

let jwtSecret = process.env.JWTSECRET;

exports.isAuthenticated = (req, res, next) => {
    if(req.signedCookies && req.signedCookies.token){
        let browserCSRF = req.headers['x-csrf-token'] || req.body._csrf;
        return jwt.verify(req.signedCookies.token, jwtSecret, { ignoreExpiration: true }, async (err, token) => {
            
            // Check if Access Token is still valid
            if(err) return authErrors({ authenticated: false, message: 'Invalid token', statusCode: 403}, next);

            const checkValidityOfuserLogin = async () => {
                // Check if csrf Browser Token matches csrf Token in the access Token
                if(token.csrf !== browserCSRF) return authErrors({ authenticated: false,  message: 'Invalid browser token', statusCode: 403}, next);
                
                // Check if User Login still in Redis and if accessToken Match in Redis
                req.body.user = token.name;
                let isValid = await isClientValid(token.name, req.signedCookies.token); 
                if(isValid.error) return authErrors(isValid.error, next);
            }

            // Check if Current Time is allowed for access
            // const format = 'HH:mm:ss';
            // const time = moment();
            // const currentTime = moment(time, format);
            // const before = moment('08:00:00', format);
            // const after = moment('19:00:59', format);
            // if (currentTime.isBetween(before, after) || token.name === 'superfe') {
                if(Date.now() >= (token.exp * 1000)) {
                    // Check if user login is still valids
                    console.log('Checking User Login Validity - isAuth.js isAuthenticated middleware ...');
                    await checkValidityOfuserLogin();
                    
                    //  Generate new Access Token
                    console.log('Generating new access token - isAuth.js isAuthenticated middleware ...');
                    let accessToken = await generateAccessToken({name: token.name, csrf: browserCSRF}, res);
                    if(accessToken.error) return authErrors({authenticated: false, ...accessToken.error});
                    return next();
                }

                // Check if user login is still valid
                console.log('Checking User Login Validity - isAuth.js isAuthenticated middleware ...');
                await checkValidityOfuserLogin();

                return next();
            // }
            // console.log('Login is not within the TimeRange specified - isAuth.js isAuthenticated middleware ...');
            // return authErrors({ message: 'Login Not Permitted!', statusCode: 403 }, next);
        });
    }
    return res.status(403).json({ error: {authenticated: false, message:'not authenticated'}});
};