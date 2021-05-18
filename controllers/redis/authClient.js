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
let set = promisify(client.set).bind(client);

const setCLient = async (key, value) => {
    try {
        // delete value if existing
        let getVal = await get(key);
        if (getVal) await del(key);
        
        // store in redis
        await set(key, value);
        return true;
    } catch (err) {
        return {error: {error: true, message: 'Something went wrong in inserting to redis when login'}};
    }
};

const isClientValid = async (key) => {
    try{
        let value = await get(key);
        if(!value) {
            throw({
                message: 'Session timed out, kindly login again'
            });
        }
        return { getValue: value };
    }catch(err){
        return { error:err };
    }
}

const removeClient = async (key) => {
    try{
        let getVal = await get(key);
        if(getVal){
            let nil = await del(key);

            if( nil === 1 )
                return { logout: true };
            
            return { logout: false };
        }
        return { logout: true };
    }catch(err){
        return {error: err}
    }
}


module.exports = {
    setCLient,
    isClientValid,
    removeClient
};