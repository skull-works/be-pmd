const formSession = require('supertest-session');
const { expect } = require('chai');
const redis = require('redis');
const { promisify } = require('util');
const bcrypt = require('bcrypt');
const app = require('../../app');
const { createLoginUser, createSession, Login } = require('../general-helper/session');
const { dateToday } = require('../general-helper/operations');

let redisPort = process.env.REDISPORT || 6379 ;

const { User } = require('../../models/index');
const client = redis.createClient(redisPort);
let del = promisify(client.del).bind(client);
let set = promisify(client.set).bind(client);
 
describe('Suite === Authentication Controller', function(){
    let csrf, session;

    context('login & logout', function(){
        let user = "testAdmin", userPassword = "testPassword";

        before(async function(){
            let hashPass = await bcrypt.hash(userPassword, 12);
            await User.create({
                username: user,
                password: hashPass,
                authority: 1
            });
        })

        beforeEach(function(done){
            session = formSession(app);
            session.get('/csrf-token')
            .end(function(err, res){
                if(err) return done(err);
                csrf = res.body.csrfToken;
                done();
            });
        });

        context('login', function(){
            it('User not existing return error', async function(){
                let res = await session.post('/login')
                                .send({ username: 'TestNameWrong', _csrf: csrf });
                expect(res.statusCode).to.eq(403);
                expect(res.body.error.message).to.eql('no user with this username');
            });

            it('User password is wrong should return error', async function(){
                let res = await session.post('/login')
                                .send({ username: user, password: 'WrongPassword', _csrf: csrf });

                expect(res.statusCode).to.eq(403);
                expect(res.body.error.message).to.eql('wrong password');
            });
            
            it('User credentials correct should return isLoggedIn true', async function(){
                let res = await session.post('/login')
                                        .send({ username: user, password: userPassword, _csrf: csrf });

                expect(res.statusCode).to.eq(200);
                expect(res.body.isLoggedIn).to.be.true;
            });
        });

        context('logout', function(){
            let res;

            it('logout successfuly should return "User is logged out"', async function(){
                res = await session.post('/login')
                                   .send({ username: user, password: userPassword, _csrf: csrf });

                let result = await session.get('/logout')
                                          .send({_csrf:csrf});

                expect(result.statusCode).to.eq(200);
                expect(result.body.logout).to.be.true;
                expect(result.body.message).to.eql("User logged out");
            });

            it('token not existing in signedCookies should return User already logged out', async function(){
                let result = await session.get('/logout')
                                          .send({_csrf:csrf});
                expect(result.body.message).to.eql("User already logged out");
            });
        });
    });

    context('middleware for every request isAuth.js', function(){
        let key = "testAdmin3", userPassword = "testPassword3";
        let dateNow = dateToday();

        before(async function(){
            //creating login user
            await createLoginUser(key, userPassword);
        })

        beforeEach(async function(){
            let { newSession, csurf } = await createSession();
            csrf = csurf;
            session = newSession;
        });

        it('user passes all authentication checking, request should be successful', async function() {
            await Login(session, key, userPassword, csrf);
            let { body, statusCode } = await session
                                            .get(`/application_form/2020-08-13/${dateNow}`)
                                            .send({_csrf:csrf});
            expect(statusCode).to.eql(200);
            expect(body.length).to.be.greaterThan(0);              // take note that these values retrieved are created at get-application.tes.js 'before Hook' or other before Hook of other test file
        });
        
        it('user no cookie token, should return not authenticated', async function() {
            let { body, statusCode } = await session
                                            .get(`/application_form/2020-08-13/${dateNow}`)
                                            .send({_csrf:csrf});
            expect(statusCode).to.eql(401);
            expect(body.message).to.eql('not authenticated');
        });

        it('JWT token does not exist in redis server return 401 status code', async function() {
            await Login(session, key, userPassword, csrf);
            let res;
            let isDel = await del(`AccessToken#${key}`); //remove token from redis server
            if(isDel === 1){
                res = await session
                            .get(`/application_form/2020-08-13/${dateNow}`)
                            .send({_csrf: csrf});
            }
            expect(res.statusCode).to.eq(401);
            expect(res.body.message).to.eql('Session timed out, kindly login again');
        });

        it('JWT does not match redis token value', async function() {
            await Login(session, key, userPassword, csrf);
            let res;
            let val = await set(`AccessToken#${key}`, 'testChangeValue', 'EX', 60);      //change redis value to force it not to be equal with jwt token
            expect(val).to.eql('OK');
            //act
            res = await session
                        .get(`/application_form/2020-08-13/${dateNow}`)
                        .send({_csrf: csrf});

            expect(res.statusCode).to.eq(401);
            expect(res.body.message).to.eql('Access Token did not match!!!!');
        });
    });

    context('IsStillAuthenticated', function(){
        let key = "testAdmin3", userPassword = "testPassword3";
        let dateNow = dateToday();

        before(async function(){
            //creating login user
            await createLoginUser(key, userPassword);
        })

        beforeEach(async function(){
            let { newSession, csurf } = await createSession();
            csrf = csurf;
            session = newSession;
        });

        it('should return authenticated is true', async function() {
            await Login(session, key, userPassword, csrf);
            let { body, statusCode } = await session
                                            .get(`/isStillAuthenticated`)
                                            .send({_csrf:csrf});
            expect(statusCode).to.eql(200);
            expect(body.authenticated).to.eql(true);
            expect(body.message).to.eql("User is still authenticated");
        });

        it('should return sessioned time out and authenticated false', async function() {
            await Login(session, key, userPassword, csrf);

            await del(`AccessToken#${key}`);
            await del(`RefreshToken#${key}`);

            let { body, statusCode } = await session
                                            .get(`/isStillAuthenticated`)
                                            .send({_csrf:csrf});

            expect(statusCode).to.eql(401);
            expect(body.authenticated).to.eql(false);
            expect(body.message).to.eql("Session timed out, kindly login again");
        });
    })
})