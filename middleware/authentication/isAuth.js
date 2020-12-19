const jwt = require('jsonwebtoken');
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
        });
    }
    return res.status(403).json({ error: {authenticated: false, message:'not authenticated'}});
};