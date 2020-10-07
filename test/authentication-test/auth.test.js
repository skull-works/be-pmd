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
                // expect(res.statusCode).to.eq(200);
                // expect(res.body.accessToken).not.to.be.empty;
            });

            it('User password is wrong should return error', async function(){
                let res = await session.post('/login')
                                .send({ username: user, password: 'WrongPassword', _csrf: csrf });
                expect(res.statusCode).to.eq(403);
                expect(res.body.error.message).to.eql('wrong password');
                // expect(res.statusCode).to.eq(200);
                // expect(res.body.accessToken).not.to.be.empty;
            });
            
            it('User credentials correct should generate JWT token', async function(){
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
                expect(result.body.message).to.eql("User is logged out");
            });

            it('key not existing in redis should return User already logged out', async function(){
                res = await session.post('/login')
                                   .send({ username: user, password: userPassword, _csrf: csrf });
                let result;
                let isDel = await del(user);
                if(isDel === 1){
                    result = await session.get('/logout')
                                          .send({_csrf:csrf});
                }else
                    console.log('error in test');
                expect(result.body.message).to.eql("User already logged out");
            });

            it('token not existing in signedCookies should return User already logged out', async function(){
                let result = await session.get('/logout')
                                          .send({_csrf:csrf});
                expect(result.body.message).to.eql("User already logged out");
            });
        });
    });

    
    context('isLoggedIn', function(){
        
        context('Cases', function(){

            let key = "testAdmin2", userPassword = "testPassword2";

            before(async function(){
                //creating login user
                await createLoginUser(key, userPassword);
            })

            beforeEach(async function(){
                let { newSession, csurf } = await createSession();
                csrf = csurf;
                session = newSession;
            });

            it('No Cookie return message Not Logged In', async function(){
                let res = await session.get('/isLoggedIn')
                                       .send({ _csrf: csrf });
                expect(res.body.message).to.eql('not logged in');
            });

            it('JWT token does not exist in redis server return 403 status code', async function(){
                await Login(session, key, userPassword, csrf);
                let res;
                let isDel = await del(key); //remove token from redis server
                if(isDel === 1){
                    res = await session.get('/isLoggedIn')  //make request
                                       .send({ _csrf: csrf });
                }else
                    console.log('error in test');
                expect(res.statusCode).to.eq(403);
                expect(res.body.error.message).to.eql('Session timed out, kindly login again');
            });

            it('JWT does not match redis token value', async function(){
                await Login(session, key, userPassword, csrf);
                let val = await set(key, 'testChangeValue', 'EX', 60);      //change redis value to force it not to be equal with jwt token
                expect(val).to.eql('OK');

                let res = await session.get('/isLoggedIn')     //make request
                                       .send({ _csrf: csrf });
                expect(res.statusCode).to.eq(403);
                expect(res.body.error.message).to.eql('Login seems to be used already, kindly login ASAP and contact system administrator');
            });

            it('Passed all checking should generate new accessToken', async function(){
                await Login(session, key, userPassword, csrf);
                let res = await session.get('/isLoggedIn')
                                        .send({_csrf: csrf});
                expect(res.statusCode).to.eq(200);
                expect(res.body.isLoggedIn).to.be.true;
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
            expect(statusCode).to.eql(403);
            expect(body.error.message).to.eql('not authenticated');
        });

        it('JWT csrf token does not match browser csrf token, should return invalid message', async function() {
            await Login(session, key, userPassword, csrf);
            const {  csurf } = await createSession();
            let  diffCSRF = csurf;

            let { body, statusCode } = await session
                                            .get(`/application_form/2020-08-13/${dateNow}`)
                                            .send({_csrf: diffCSRF});
            expect(statusCode).to.eql(403);
            expect(body.error.message).to.eql('Invalid browser token');
        });

        it('JWT token does not exist in redis server return 500 status code', async function() {
            await Login(session, key, userPassword, csrf);
            let res;
            let isDel = await del(key); //remove token from redis server
            if(isDel === 1){
                res = await session
                            .get(`/application_form/2020-08-13/${dateNow}`)
                            .send({_csrf: csrf});
            }
            expect(res.statusCode).to.eq(403);
            expect(res.body.error.message).to.eql('Session timed out, kindly login again');
        });

        it('JWT does not match redis token value', async function() {
            await Login(session, key, userPassword, csrf);
            let res;
            let val = await set(key, 'testChangeValue', 'EX', 60);      //change redis value to force it not to be equal with jwt token
            expect(val).to.eql('OK');
            //act
            res = await session
                        .get(`/application_form/2020-08-13/${dateNow}`)
                        .send({_csrf: csrf});

            expect(res.statusCode).to.eq(403);
            expect(res.body.error.message).to.eql('Login seems to be used already, kindly login ASAP and contact system administrator');
        });
    });


})