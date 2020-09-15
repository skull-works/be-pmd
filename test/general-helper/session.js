const formSession = require('supertest-session');
const app = require('../../app');
const { expect } = require('chai');
const { User } = require('../../models/index');
const bcrypt = require('bcrypt');


//creating login user
const createLoginUser = async (user, userPassword) => {
    let hashPass = await bcrypt.hash(userPassword, 12);
    await User.create({
        username: user,
        password: hashPass,
        authority: 1
    });
}



const createSession = async () => {
    let newSession = formSession(app);
    let res = await newSession.get('/csrf-token');
    let csurf = res.body.csrfToken;
    return {
        newSession,
        csurf
    };
}


const Login = async (session, user, userPassword, csrf) => {
    let res = await session.post('/login')
                           .send({ username: user, password: userPassword, _csrf: csrf });
    expect(res.statusCode).to.eq(200);
    expect(res.body.isLoggedIn).to.be.true;
}


module.exports = {
    createLoginUser,
    createSession,
    Login
}