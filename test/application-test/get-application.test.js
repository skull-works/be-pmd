//testing frameworks
const { expect } = require('chai');
//helper functions
const { assertArray, createData, dateToday } = require('./helper/helper');
//models
const { Application, Customer, Spouse } = require('../../models/index');
//mockData
const data = require('./data/general-data');


const { createLoginUser, createSession, Login } = require('../general-helper/session');


describe('Suite = Get Applications controller', function() {
    let dateNow = dateToday();
    let user = "testAdmin", userPassword = "testPassword";
    let csrf, session;

    before(async function(){
        //removing data then create data for customer, applications and spouse
        await Application.destroy({where:{}});
        await Spouse.destroy({where:{}});
        await Customer.destroy({where:{}});
        let customers = await Customer.bulkCreate(data.customers);
        createData(customers);

        //create Login user and sessions
        await createLoginUser(user, userPassword);
        let { newSession, csurf } = await createSession();
        csrf = csurf;
        session = newSession;
        await Login(session, user, userPassword, csrf);
    });


    context('Fetching data', function(){
        it('Fetch applications according to date', async function() {
            let { body, statusCode } = await session
                                            .get(`/application_form/2020-08-13/${dateNow}`)
                                            .send({_csrf:csrf});
            expect(statusCode).to.eql(200);
            expect(body.length).to.eql(6);      //all records according to date only
        });

        it('Fetch applications according to date and area_code', async function() {
            let query = JSON.stringify({area_code: 'TEST-03'});
            let { body, statusCode } = await session
                                             .get(`/application_form/2020-08-13/${dateNow}?inputs=${query}`)
                                             .send({_csrf:csrf});
            expect(statusCode).to.eql(200);
            expect(body.length).to.eql(2);
            expect(body[0].first_name).to.eql('TestFname3');
        });

        it('Fetch applications according to date and first_name', async function() {
            let query = JSON.stringify({first_name: 'TestFname1'});
            let { body, statusCode } = await session
                                             .get(`/application_form/2020-08-13/${dateNow}?inputs=${query}`)
                                             .send({_csrf:csrf});
            expect(statusCode).to.eql(200);
            expect(body.length).to.eql(3);
            expect(body[0].first_name).to.eql('TestFname1');
        });

        it('Fetch applications according to date and last_name', async function() {
            let query = JSON.stringify({ last_name: 'TestLname2'});
            let { body, statusCode }   = await session
                                               .get(`/application_form/2020-08-13/${dateNow}?inputs=${query}`)
                                               .send({_csrf:csrf});
            expect(statusCode).to.eql(200);
            expect(body.length).to.eql(1);
            expect(body[0].first_name).to.eql('TestFname2');
            expect(body[0].last_name).to.eql('TestLname2');
        });

        it('Fetch applications according to date and type_loan', async function() {
            let nameExpected = ['TestFname1', 'TestFname2', 'TestFname3', 'TestFname3'];
            let query = JSON.stringify({ type_loan: 'NEW'});
            let { body, statusCode }   = await session
                                               .get(`/application_form/2020-08-13/${dateNow}?inputs=${query}`)
                                               .send({_csrf:csrf});
            expect(statusCode).to.eql(200);
            expect(body.length).to.eql(4);
            assertArray(body, {fieldName:'type_loan', fieldValue:'NEW'}, nameExpected);
        });

        it('Fetch applications according to date and status', async function() {
            let nameExpected = ['TestFname1'];
            let query = JSON.stringify({ status: 'CLOSED'});
            let { body, statusCode }   = await session
                                               .get(`/application_form/2020-08-13/${dateNow}?inputs=${query}`)
                                               .send({_csrf:csrf});
            expect(statusCode).to.eql(200);
            expect(body.length).to.eql(1);
            assertArray(body, {fieldName:'status',fieldValue:'CLOSED'}, nameExpected);
        });

        it('Fetch applications according to date, status, and type_loan', async function() {
            let query = JSON.stringify({ type_loan: 'RENEW', status: 'PROCESSING'});
            let { body, statusCode }   = await session
                                               .get(`/application_form/2020-08-13/${dateNow}?inputs=${query}`)
                                               .send({_csrf:csrf});
            expect(statusCode).to.eql(200);
            expect(body.length).to.eql(1);
            expect(body[0].first_name).to.eql('TestFname1');
            expect(body[0].type_loan).to.eql('RENEW');
            expect(body[0].status).to.eql('PROCESSING');
        });

        it('Fetch applications but should return no data found', async function() {
            let query = JSON.stringify({ first_name:'NONE', type_loan: 'NEW', status: 'CLOSED'});
            let { body, statusCode }   = await session
                                               .get(`/application_form/2020-08-13/2020-08-15?inputs=${query}`)
                                               .send({_csrf:csrf});
            expect(statusCode).to.eql(404);
            expect(body.error.message).to.eql('no data found');
        });
    });

    context('Validation Cases', function(){
        it('invalid area_code should return error', async function(){
            let query = JSON.stringify({area_code: 1});
            let { body, statusCode } = await session
                                             .get(`/application_form/2020-08-13/${dateNow}?inputs=${query}`)
                                             .send({_csrf:csrf});
            expect(statusCode).to.eql(422);
            expect(body.error.message).to.eql('Format should be XX1-');
        });

        it('invalid first_name should return error', async function(){
            let query = JSON.stringify({first_name: 1});
            let { body, statusCode } = await session
                                             .get(`/application_form/2020-08-13/${dateNow}?inputs=${query}`)
                                             .send({_csrf:csrf});
            expect(statusCode).to.eql(422);
            expect(body.error.message).to.eql('must be character letters');
        });

        it('invalid last_name should return error', async function(){
            let query = JSON.stringify({last_name: 1});
            let { body, statusCode } = await session
                                             .get(`/application_form/2020-08-13/${dateNow}?inputs=${query}`)
                                             .send({_csrf:csrf});
            expect(statusCode).to.eql(422);
            expect(body.error.message).to.eql('must be character letters');
        });

        it('invalid type_loan should return error', async function(){
            let query = JSON.stringify({type_loan: 'INVALID TYPE LOAN'});
            let { body, statusCode } = await session
                                             .get(`/application_form/2020-08-13/${dateNow}?inputs=${query}`)
                                             .send({_csrf:csrf});
            expect(statusCode).to.eql(422);
            expect(body.error.message).to.eql('invalid loan type');
        });

        it('invalid status should return error', async function(){
            let query = JSON.stringify({status: 'INVALID status'});
            let { body, statusCode } = await session
                                             .get(`/application_form/2020-08-13/${dateNow}?inputs=${query}`)
                                             .send({_csrf:csrf});
            expect(statusCode).to.eql(422);
            expect(body.error.message).to.eql('invalid status');
        });

        it('invalid start_date should return error', async function(){
            let { body, statusCode } = await session
                                             .get(`/application_form/invalid_date/${dateNow}`)
                                             .send({_csrf:csrf});
            expect(statusCode).to.eql(422);
            expect(body.error.message).to.eql('should be date');
        });

        it('invalid end_date should return error', async function(){
            let { body, statusCode } = await session
                                             .get(`/application_form/2020-08-13/invalid_date`)
                                             .send({_csrf:csrf});
            expect(statusCode).to.eql(422);
            expect(body.error.message).to.eql('should be date');
        });
    });
});