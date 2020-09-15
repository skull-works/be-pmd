const jwt = require('jsonwebtoken');
const store = require('../redis/authClient')

require('dotenv').config();

let secret = process.env.JWTSECRET;
let cookeAge = process.env.COOKIEAGE || 300000
let jwtExpire = process.env.JWTEXPIRE || '5m'
let cookiesOption = { httpOnly: true, signed: true, expires:true, maxAge: cookeAge }

exports.generateAccessToken = async (user, res) => {
    let accessToken = jwt.sign(user, secret, {expiresIn: jwtExpire});
    let isSet = await store.setCLient(user.name, accessToken);
    if(isSet.error)
        return({error:isSet.error});
    res.cookie('token', accessToken, cookiesOption);
    return accessToken
}