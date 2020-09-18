const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { generateAccessToken } = require('./operations/tokens');
const { isClientValid, removeClient } = require('./redis/authClient');
const { authErrors } = require('../middleware/errors/errors');
const { User } = require('../models/index');


require('dotenv').config();
let jwtSecret = process.env.JWTSECRET;




exports.generateCSRF = (req, res) => {
    res.status(200).json({csrfToken: req.csrfToken()});
};




exports.signUp = async (req, res, next) => {
    try{
        let signUpInfo = req.body;
        let hashPass = await bcrypt.hash(signUpInfo.password, 12);
        let user = await User.create({
            username: signUpInfo.username,
            password: hashPass,
            authority: signUpInfo.authority
        });
        if(!user) throw({message: "unable to create user"});
        return res.status(200).json({success:true, message: "User created Successfuly"});
    }catch(err){
        console.log(err);
        next(err);
    }
};




exports.Login = async (req, res, next) => {
    let username = req.body.username;
    let password = req.body.password;
    let jwtCSRF = req.headers['x-csrf-token'] || req.body._csrf;
    //step 1 authentication
    try{
        let user = await User.findOne({ where:{ username: username }});
        if(!user) throw({message: 'no user with this username', statusCode: 403});

        let doMatch = await bcrypt.compare(password, user.password);
        if(!doMatch) throw ({message: 'wrong password', statusCode: 403});

        //step 3 create jwt token
        let token = { name: username, csrf: jwtCSRF};
        let accessToken = await generateAccessToken(token, res);
 
        if(accessToken.error) return authErrors(accessToken.error, next);
        else res.status(200).json({isLoggedIn: true, message: 'Login successful'});
    }catch(err){
        next(err);
    }
};




exports.isLoggedIn = (req, res, next) => {
    if( req.signedCookies && req.signedCookies.token ){
        return jwt.verify(req.signedCookies.token, jwtSecret, async (err, token) => {
            if(err) return authErrors({ message: "Invalis Token", statusCode: 403}, next);
            let username = token.name;

            let isValid = await isClientValid(username, req.signedCookies.token); 
            if(isValid.error) return authErrors(isValid.error, next);

            // console.log('generating new csrf and jwt token ...');
            let accessToken = await generateAccessToken({name: username, csrf: req.csrfToken()}, res);

            if(accessToken.error) return authErrors(accessToken.error, next);
            return res.status(200).json({csrfToken: req.csrfToken(), isLoggedIn: true});
        });
    }
    return res.json({message: 'not logged in'}); 
}




exports.willLogout = (req, res, next) => {
    if( req.signedCookies || req.cookies ){
        if( req.signedCookies.token ){
            return jwt.verify(req.signedCookies.token, jwtSecret, async (err , token) => {
                let key = token.name;
                let isLoggedOut = await removeClient(key);  
                return res.status(200).json(isLoggedOut);
            });
        }
        else if( req.signedCookies.token !== undefined || req.cookies.token !== undefined ){
            return res.status(422).json({ warning: true, 
                message: 'Your account session has been tampered!, kindly login in another browser then log out from there' 
            });
        }
        else{
            return res.status(200).json({ message: "User already logged out" });
        }
    }
    return res.status(422).json({ message: "User already logged out and possibly an invalid user" });
};