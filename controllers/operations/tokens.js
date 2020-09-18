const jwt = require('jsonwebtoken');
const store = require('../redis/authClient')

require('dotenv').config();

let secret = process.env.JWTSECRET;
let cookeAge = process.env.COOKIEAGE || 300000
let jwtExpire = process.env.JWTEXPIRE || '5m'
let cookiesOption = { httpOnly: true, signed: true, expires:true, maxAge: cookeAge }


const envVarCheck = () => {
    if(!secret) return({error: {error: true, message: 'JWT secret is not set'}});
    if(!cookeAge) return({error: {error: true, message: 'Cookie age is not set'}});
    if(!jwtExpire) return({error: {error: true, message: 'JWT age is not set'}});
    if(!cookiesOption) return({error: {error: true, message: 'Cookie option is not set'}});
    return false;
}



exports.generateAccessToken = async (user, res) => {
    let isEnvEmpty = envVarCheck();
    if(isEnvEmpty.error) return (isEnvEmpty);
    
    let accessToken = jwt.sign(user, secret, {expiresIn: jwtExpire});
    let isSet = await store.setCLient(user.name, accessToken);

    if(isSet.error)
        return({error:isSet.error});

    res.cookie('token', accessToken, cookiesOption);

    return accessToken
}