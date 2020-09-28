const { expect } = require('chai');
const { createLoginUser, createSession, Login } = require('../general-helper/session');

const { Application, Customer, Spouse, Passbook, PassbookItems } = require('../../models/index');
const { createData } = require('./helper/helper');
const { dateToday } = require('../general-helper/operations');
const data = require('./data/general-data');
const passbookData = require('./data/post-passbook');

describe('Suite === Passbook', function(){
    let user = 'TestAdmin8', userPassword = 'TestPassword8';
    let csrf, session;
    before(async function(){
        await Customer.destroy({where:{}});
        await Application.destroy({where:{}});
        await Spouse.destroy({where:{}});
        await Passbook.destroy({where:{}});
        await PassbookItems.destroy({where:{}});
        let customers = await Customer.bulkCreate(data.customers);
        customerId = customers[2].id;
        createData(customers, data.application, data.spouse);
        
        await createLoginUser(user, userPassword);
        let { newSession, csurf } = await createSession();
        session = newSession;
        csrf = csurf;
        await Login(session, user, userPassword, csrf);
    });

    context('Passbook', function(){
        context('Post operations', function(){

            let passbookId, applicationId;  //this passbook id will be used for the creation of passbookItems
            
            context('Passbook model/ Create Passbook', function(){
                it('create passbook no previous application should create', async function(){
                    let { body, statusCode } = await session
                                                    .post('/passbook')
                                                    .send({...passbookData.postPassbook('TEST-04', 7), _csrf:csrf});    
                    expect(statusCode).to.eq(200);
                    expect(body.success).to.true;
                });

                it('create passbook and previous application finish should create', async function(){
                    let { body, statusCode } = await session
                                                    .post('/passbook')
                                                    .send({...passbookData.postPassbook('TEST-03', 6), _csrf: csrf});
                    passbookId = body.passbook.id;                  //for the PassbookItems tests
                    applicationId = body.passbook.applicationId;    //for the PassbookItems tests
                    expect(statusCode).to.eq(200);
                    expect(body.success).to.true;
                });

                context('Validation Cases', function(){
                    it('Application not approved should not create Passbook', async function(){
                        let { body, statusCode } = await session
                                                        .post('/passbook')
                                                        .send({...passbookData.postPassbook('TEST-02', 4), _csrf: csrf});
                        expect(statusCode).to.eq(422);
                        expect(body).to.have.property('error');
                        expect(body.error.message).to.eq('This application is not approved, kindly review the application');
                    });
            
                    it('Same passbook should not be created', async function(){ //the same passbook created is at the Create Passbook context 1st test
                        let { body, statusCode } = await session
                                                        .post('/passbook')
                                                        .send({...passbookData.postPassbook('TEST-04', 7), _csrf: csrf});
                        expect(statusCode).to.eq(422);
                        expect(body).to.have.property('error');
                        expect(body.error.message).to.eq('This application already has a passbook, kindly double check');
                    });
            
                    it('Previous passbook not finish and type_loan !== SP should not create passbook', async function(){ 
                        let { body, statusCode } = await session
                                                        .post('/passbook')
                                                        .send({...passbookData.postPassbook('TEST-01', 2), _csrf: csrf});
                        expect(statusCode).to.eq(422);
                        expect(body).to.have.property('error');
                        expect(body.error.message).to.eq('This application still has an ongoing passbook, kindly finish that application first');
                    });
            
                    it('Previous passbook not finish and type_loan === SP should create passbook', async function(){ 
                        let { body, statusCode } = await session
                                                        .post('/passbook')
                                                        .send({...passbookData.postPassbook('TEST-01', 3), _csrf: csrf});
                        expect(statusCode).to.eq(200);
                        expect(body.success).to.true;
                    });
                });
            });

            context('PassbookItems model/ Create Passbook Items', function(){ // passbook will be based on the test above so this is like an integration testing
                    it('Create item should minus the balance recieved to the collection recieved', async function(){
                        let { body, statusCode } = await session
                                                        .post('/passbook-item')
                                                        .send({...passbookData.postPassbookItems(passbookId, 3000, 200), _csrf: csrf});
                        expect(statusCode).to.eq(200);
                        expect(body.success).to.true;
                        expect(body.passbookItem.balance).to.eql(2800);
                        expect(body.passbookItem.passbookId).to.eql(passbookId);
                    });

                    it('Create item and when balance turns to 0 application status should change to CLOSED', async function(){
                        let { body, statusCode } = await session
                                                        .post('/passbook-item')
                                                        .send({...passbookData.postPassbookItems(passbookId, 200, 200, 'applicationId', applicationId), _csrf: csrf});
                        let applicationCurrent = await Application.findByPk(applicationId);
                        
                        expect(statusCode).to.eq(200);
                        expect(body.success).to.true;
                        expect(body.passbookItem.balance).to.eql(0);
                        expect(body.passbookItem.passbookId).to.eql(passbookId);
                        expect(applicationCurrent.status).to.eql('CLOSED');
                    });

                    context('Validation Cases', function(){
                        it('passbookId not numeric should return error', async function(){
                            let { body, statusCode } = await session
                                                            .post('/passbook-item')
                                                            .send({...passbookData.postPassbookItems('testwrong', 3000, 200), _csrf: csrf});
                            expect(statusCode).to.eq(422);
                            expect(body.error.field).to.eql('passbookId');
                        });

                        it('amount_finance not numeric/float should return error', async function(){
                            let { body, statusCode } = await session
                                                            .post('/passbook-item')
                                                            .send({...passbookData.postPassbookItems(passbookId, 3000, 200, 'amount_finance', 'errorValue'), _csrf: csrf});
                            expect(statusCode).to.eq(422);
                            expect(body.error.field).to.eql('amount_finance');
                        });

                        it('balance not numeric/float should return error', async function(){
                            let { body, statusCode } = await session
                                                            .post('/passbook-item')
                                                            .send({...passbookData.postPassbookItems(passbookId, 'errorValue', 200), _csrf: csrf});
                            expect(statusCode).to.eq(422);
                            expect(body.error.field).to.eql('balance');
                        });

                        it('collection not numeric/float should return error', async function(){
                            let { body, statusCode } = await session
                                                            .post('/passbook-item')
                                                            .send({...passbookData.postPassbookItems(passbookId, 3000, 'errorValue'), _csrf: csrf});
                            expect(statusCode).to.eq(422);
                            expect(body.error.field).to.eql('collection');
                        });

                        it('interest_penalty not numeric/float should return error', async function(){
                            let { body, statusCode } = await session
                                                            .post('/passbook-item')
                                                            .send({...passbookData.postPassbookItems(passbookId, 3000, 200, 'interest_penalty', 'errorValue'), _csrf: csrf});
                            expect(statusCode).to.eq(422);
                            expect(body.error.field).to.eql('interest_penalty');
                        });
                        
                        it('collector_initial not string should return error', async function(){
                            let { body, statusCode } = await session
                                                            .post('/passbook-item')
                                                            .send({...passbookData.postPassbookItems(passbookId, 3000, 200, 'collector_initial', 123456), _csrf: csrf});
                            expect(statusCode).to.eq(422);
                            expect(body.error.field).to.eql('collector_initial');
                        });

                        it('remarks not string should return error', async function(){
                            let { body, statusCode } = await session
                                                            .post('/passbook-item')
                                                            .send({...passbookData.postPassbookItems(passbookId, 3000, 200, 'remarks', 123456), _csrf:csrf});
                            expect(statusCode).to.eq(422);
                            expect(body.error.field).to.eql('remarks');
                        });
                    });
            });

        });

        context('Get operations', function(){
            context('Fetch Data', function(){
                it('get PassbookItems successfuly', async function(){
                    let { body, statusCode } = await session
                                                    .get('/passbook-item/6')                    //6 is an application form id based in the general data can refer there
                                                    .send({_csrf: csrf}); 
                    expect(statusCode).to.eq(200);
                    expect(body).to.have.property('pay_type');
                    expect(body).to.have.property('customer');
                    expect(body.passbook).to.have.property('passbookitems');
                });

                it('get PassbookItems but no passbook should return error', async function(){
                    let { body, statusCode } = await session
                                                    .get('/passbook-item/1')                     //1 is an application form id based in the general data can refer there
                                                    .send({_csrf: csrf});
                    expect(statusCode).to.eq(404);
                    expect(body.error.message).to.eql('There is no passbook for this application');
                });

                it('No application existing with this Form ID entered', async function(){
                    let { body, statusCode } = await session
                                                    .get('/passbook-item/9')                     //9 is not an exisiting application form ID
                                                    .send({_csrf: csrf});                  
                    expect(statusCode).to.eq(404);
                    expect(body.error.message).to.eql('There is no existing application for the Form ID you have entered');
                });
            });

            context('Validation Cases', function(){
                it('param formId is not numberic should return error', async function(){
                    let { body, statusCode } = await session
                                                    .get('/passbook-item/errorparam')            //6 is an application form id based in the general data can refer there
                                                    .send({_csrf: csrf});                  
                    expect(statusCode).to.eq(422);
                    expect(body.error.field).to.eql('formId');
                    expect(body.error.message).to.eql('Should be a number');
                });
            });
        });
    });
});