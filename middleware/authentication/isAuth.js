const jwt = require('jsonwebtoken');
const { authErrors } = require('../errors/errors');
const { isClientValid } = require('../../controllers/redis/authClient');
const { generateAccessToken } = require('../../controllers/operations/tokens');

require('dotenv').config();

let jwtSecret = process.env.JWTSECRET;

exports.isAuthenticated = (req, res, next) => {
    if(req.signedCookies && req.signedCookies.token){
        let browserCSRF = req.headers['x-csrf-token'] || req.body._csrf;
        return jwt.verify(req.signedCookies.token, jwtSecret, async (err, token) => {
            if(err) return authErrors({ message: 'Invalid token', statusCode: 403}, next);
            else if(token.csrf !== browserCSRF) return authErrors({ message: 'Invalid browser token', statusCode: 403}, next);

            let isValid = await isClientValid(token.name, req.signedCookies.token); 
            if(isValid.error) return authErrors(isValid.error, next);

            let accessToken = await generateAccessToken({name: token.name, csrf: browserCSRF}, res);
            if(accessToken.error) return authErrors(accessToken.error);
            return next();
        });
    }
    return res.status(403).json({message:'not authenticated'});
};