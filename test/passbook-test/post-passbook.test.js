const request = require('supertest');
const { expect } = require('chai');
const app = require('../../app');

const { Application, Customer, Spouse, Passbook } = require('../../models/index');
const { createData } = require('./helper/helper');
const data = require('./data/general-data');
const passbookData = require('./data/post-passbook');

describe('Suite === Post Passbook', function(){
    before(async function(){
        await Customer.destroy({where:{}});
        await Application.destroy({where:{}});
        await Spouse.destroy({where:{}});
        await Passbook.destroy({where:{}});
        let customers = await Customer.bulkCreate(data.customers);
        createData(customers, data.application, data.spouse);
    });
    //refer to documentation
    context('Create Passbook', function(){  
        it('create passbook no previous application', async function(){
            let { body, statusCode } = await request(app)
                                            .post('/passbook')
                                            .send(passbookData.postPassbook('TEST-04', 7));
            expect(statusCode).to.eq(200);
            expect(body.success).to.true;
        })

        it('create passbook and previous application finish', async function(){
            let { body, statusCode } = await request(app)
                                            .post('/passbook')
                                            .send(passbookData.postPassbook('TEST-03', 6));
            expect(statusCode).to.eq(200);
            expect(body.success).to.true;
        })
    });

    context('Validation Cases', function(){
        it('Application not approved should not create Passbook', async function(){
            let { body, statusCode } = await request(app)
                           .post('/passbook')
                           .send(passbookData.postPassbook('TEST-02', 4));
            expect(statusCode).to.eq(422);
            expect(body).to.have.property('error');
            expect(body.error.message).to.eq('This application is not approved, kindly review the application');
        });

        it('Same passbook should not be created', async function(){ //the same passbook created is at the Create Passbook context 1st test
            let { body, statusCode } = await request(app)
                           .post('/passbook')
                           .send(passbookData.postPassbook('TEST-04', 7));
            expect(statusCode).to.eq(422);
            expect(body).to.have.property('error');
            expect(body.error.message).to.eq('This application already has a passbook, kindly double check');
        });

        it('Previous passbook not finish and type_loan !== SP should not create passbook', async function(){ 
            let { body, statusCode } = await request(app)
                           .post('/passbook')
                           .send(passbookData.postPassbook('TEST-01', 2));
            expect(statusCode).to.eq(422);
            expect(body).to.have.property('error');
            expect(body.error.message).to.eq('This application still has an ongoing passbook, kindly finish that application first');
        });

        it('Previous passbook not finish and type_loan === SP should create passbook', async function(){ 
            let { body, statusCode } = await request(app)
                           .post('/passbook')
                           .send(passbookData.postPassbook('TEST-01', 3));
            expect(statusCode).to.eq(200);
            expect(body.success).to.true;
        });
    });

})