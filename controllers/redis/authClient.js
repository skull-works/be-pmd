const redis = require('redis');
const { promisify } = require('util');
require('dotenv').config();

let redisHost = process.env.REDISHOST || process.env.HOST || 'localhost';
let redisPort = process.env.REDISPORT || 6379;

let redisOptions = {
    host: redisHost,
    port: redisPort
}

const client = redis.createClient(redisOptions);
let get = promisify(client.get).bind(client);
let del = promisify(client.del).bind(client);

const setCLient = async (key, value) => {
    let getVal = await get(key);
    if(getVal){
        let nil = await del(key);
        if(nil === 1){
            return client.set(key, value, 'EX', 300, (err, value) => {
                if(err || value !== 'OK') {
                    return {error: {message: 'unable to set client and value', statusCode: 500}};
                }
                return true;
            });
        }
        return {error: {message: 'was not able to delete current token to replace it', statusCode: 500}};
    }

    return client.set(key, value, 'EX', 60, (err, value) => {
        if(err || value !== 'OK') {
            return {error: {message: 'unable to set client and value', statusCode: 500}};
        }
        return true;
    });
};

const isClientValid = async (key, Cookietoken) => {
    try{
        let value = await get(key);
        if(!value) {
            throw({
                message: 'Session timed out, kindly login again',
                statusCode: 403
            });
        }
        if(value !== Cookietoken){ // if token already used
            throw({
                message: 'Login seems to be used already, kindly login ASAP and contact system administrator',
                statusCode: 403
            });
        }
        return true
    }catch(err){
        return {error:err};
    }
}

const removeClient = async (key) => {
    try{
        let getVal = await get(key);
        if(getVal){
            let nil = await del(key);
            if( nil === 1 ){
                return { logout: true, message: "User is logged out" };
            }
            return { logout: false, message: "Something went wrong, User was unable be logged out, contact administrator" };
        }
        return { message: "User already logged out" };
    }catch(err){
        return {error: err}
    }
}


module.exports = {
    setCLient,
    isClientValid,
    removeClient
};