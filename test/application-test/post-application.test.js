//testing frameworks
const { expect } = require('chai');
//session and authentication
const { createLoginUser, createSession, Login } = require('../general-helper/session');
//models
const { Application, Customer, Spouse } = require('../../models/index');
//data
const data = require('./data/post-application-data');




describe('Suite = Post Application controller', function(){
      let user = 'TestAdmin4', userPassword = 'TestPassword4';
      let csrf;
      let session;

      before(async function() {
            //removing data
            await Application.destroy({where:{}});
            await Spouse.destroy({where:{}});
            await Customer.destroy({where:{}});

            //create login user
            await createLoginUser(user, userPassword)
            let { newSession, csurf } = await createSession();
            session = newSession;
            csrf = csurf;
            await Login(session, user, userPassword, csrf);
        });


      //legends
      // // ==== means 'should have' and refer to TDD documentation backend for applications -> post_application
      let dianeFormId, bamFormId;
      context('Posting applications Cases', function(){
         it('New applicaiton without spouse === customer/application', function(done) {
            session.post('/application_form')
                  .send({...data.postApplicationWithoutSpouse, _csrf: csrf})
                  .expect(201)
                  .end(function(err, res) {
                        if(err) return done(err);
                        expect(res.body.data).to.have.property('customer');
                        expect(res.body.data).to.have.property('application');
                        expect(res.body.data).not.to.have.property('spouse');
                        done();
                  });
         });

         it('New application with spouse === customer/application/spouse', async function(){
               let res = await session.post('/application_form')
                                      .send({...data.postApplicationWithSpouse, _csrf: csrf});
               bamFormId = res.body.data.application.id;
               expect(res.statusCode).to.eql(201);
               expect(res.body.data).to.have.property('customer');
               expect(res.body.data).to.have.property('application');
               expect(res.body.data).to.have.property('spouse');
         });

         it('Renew application assuming past application is closed === application', async function() {
               let application = await Application.findOne({where: {area_code: "AC-011",first_name: 'Diane'}});
               application.status = 'CLOSED';
               application.save();
               let res = await session.post('/application_form')
                                      .send({...data.postApplicationRenew, _csrf: csrf});
               let customer = await Customer.findOne({where: {area_code: "AC-011",first_name: 'Diane'}});
               dianeFormId = res.body.data.application.id;
               expect(res.statusCode).to.eql(201);
               expect(res.body.data).to.have.property('application');
               expect(res.body.data).not.to.have.property('spouse');
               expect(res.body.data).not.to.have.property('customer');
               expect(customer.no_of_applications).to.eql(2);   // refer to TDD -> backend -> post_application -> table(setting variables/values)
         });

         it('SP application with existing ongoing application should create application === application', async function() {
               let res = await session.post('/application_form')
                                      .send({...data.postApplicationSP, _csrf: csrf});
               let customer = await Customer.findOne({where: {area_code: "AC-011",first_name: 'Diane'}});
               let applicationRenew = await Application.findByPk(dianeFormId);
               expect(applicationRenew.status).to.eql('PROCESSING');
               expect(res.statusCode).to.eql(201);
               expect(res.body.data).to.have.property('application');
               expect(res.body.data).not.to.have.property('spouse');
               expect(res.body.data).not.to.have.property('customer');
               expect(customer.no_of_applications).to.eql(3);
         });

         it('Renew application with existing SP ongoing application should create application', async function() {
            let application = await Application.findByPk(dianeFormId);
            application.status = 'CLOSED';
            await application.save();
            let res = await session.post('/application_form')
                                   .send({...data.postApplicationRenew, _csrf: csrf});
            let customer = await Customer.findOne({where: {area_code: "AC-011",first_name: 'Diane'}});

            expect(application.status).to.eql('CLOSED');
            expect(res.statusCode).to.eql(201);
            expect(res.body.data).to.have.property('application');
            expect(res.body.data).not.to.have.property('spouse');
            expect(res.body.data).not.to.have.property('customer');
            expect(customer.no_of_applications).to.eql(4);
         });
      });
      

     context('Validation Cases', function(){
            context('appPostInputValidation', function(){
                  it('Renew application with existing ongoing application should not create application', async function() {
                        let application = await Application.findByPk(dianeFormId);
                        application.status = 'PROCESSING';
                        application.save();
                        let res = await session.post('/application_form')
                                               .send({...data.postApplicationRenew, _csrf: csrf});
                        expect(application.status).to.eql('PROCESSING');
                        expect(res.statusCode).to.eql(409);
                        expect(res.body).to.eql(data.postErrorExistingApplication);
                  });
            
                  it('New application but already has a past application === not create application', async function() {
                        let application = await Application.findByPk(bamFormId);
                        application.status = 'CLOSED';
                        await application.save();
                        let res = await session.post('/application_form')
                                               .send({...data.postApplicationWithSpouse, _csrf: csrf});
                        expect(application.status).to.eql('CLOSED');
                        expect(res.statusCode).to.eql(422);
                        expect(res.body).to.eql(data.postErrorHasPastApplicationButNew);
                  });

                  it('New application but loan type is not new === not create application', async function() {
                              let res = await session.post('/application_form')
                                                     .send({...data.postApplicationNewButTypeLoanNotNew, _csrf:csrf});
                        expect(res.statusCode).to.eql(422);
                        expect(res.body).to.eql(data.postErrorNewApplicationButTypeLoanNotNew);
                  });

                  it('New application customer existing but using new area_code should not create application', async function() {
                        let res = await session.post('/application_form')
                                               .send({area_code: 'AX5-01', first_name: 'Diane', last_name: 'Butalid',  type_loan: 'NEW', _csrf: csrf});
                        expect(res.statusCode).to.eq(422);
                        expect(res.body.error.message).to.eql('Customer already exist and has a area code, please Check at review application for its area code')
                  });

                  it('SP application but has no existing ongoing application === not create application', async function() {
                        let res = await session.post('/application_form')
                                               .send({...data.postApplicationSPbutCurrentlyNoOngoingApplication, _csrf:csrf});
                        let application = await Application.findByPk(bamFormId);
                        expect(application.status).to.eql('CLOSED');
                        expect(res.statusCode).to.eql(422);
                        expect(res.body).to.eql(data.postErrorSPbutCurrentlyNoOngoingApplication);
                  });

                  it('SP application with existing ongoing application and SP application should still create === application', async function() {
                        let res = await session.post('/application_form')
                                               .send({...data.postApplicationSP, _csrf: csrf});
                        let customer = await Customer.findOne({where: {area_code: "AC-011",first_name: 'Diane'}});
                        let applicationRenew = await Application.findByPk(dianeFormId);
                        let applicationSP = await Application.findOne({where:{ area_code: "AC-011", type_loan: "SP"}});
                        expect(applicationSP.status).to.eql('PROCESSING');
                        expect(applicationRenew.status).to.eql('PROCESSING');
                        expect(res.statusCode).to.eql(201);
                        expect(res.body.data).to.have.property('application');
                        expect(res.body.data).not.to.have.property('spouse');
                        expect(res.body.data).not.to.have.property('customer');
                        expect(customer.no_of_applications).to.eql(5);
                  });

                  it('Regular application but using another customer area code === not create application', async function() {
                        let res = await session.post('/application_form')
                                               .send({...data.postApplicationInputTakenAreaCode, _csrf: csrf});
                        expect(res.statusCode).to.eql(422);
                        expect(res.body).to.eql(data.postErrorAreaCodeTakenByAnotherCustomer);
                  });
            });



            context('appNamesCodeInput', function(){
                  it('invalid area_code input should return error', async function(){
                        let sendData = data.postApplicationForceInvalidSpouseData('area_code', 'xx');
                        let { body, statusCode } = await session.post('/application_form')
                                                                .send({...sendData, _csrf: csrf});
                        expect(statusCode).to.eql(422);
                        expect(body.error.message).to.eql('must be atleast 4 characters long');
                        expect(body.error.field).to.eql('area_code')
                  });

                  it('invalid first_name input should return error', async function(){
                        let sendData = data.postApplicationForceInvalidSpouseData('first_name', 1);
                        let { body, statusCode } = await session.post('/application_form')
                                                                .send({...sendData, _csrf: csrf});
                        expect(statusCode).to.eql(422);
                        expect(body.error.message).to.eql('must be character letters');
                        expect(body.error.field).to.eql('first_name')
                  });

                  it('invalid last_name input should return error', async function(){
                        let sendData = data.postApplicationForceInvalidSpouseData('last_name', 1);
                        let { body, statusCode } = await session.post('/application_form')
                                                                .send({...sendData, _csrf: csrf});
                        expect(statusCode).to.eql(422);
                        expect(body.error.message).to.eql('must be character letters');
                        expect(body.error.field).to.eql('last_name')
                  });
            });
            


            context('appCustomerInput', function(){ // will only test 3 for date string numeric cases // civil status special case
                  //date
                  it('invalid birth_date input should return error', async function(){
                        let sendData = data.postApplicationForceInvalidApplicationData('birth_date', 'error');
                        let { body, statusCode } = await session.post('/application_form')
                                                                .send({...sendData, _csrf: csrf});
                        expect(statusCode).to.eql(422);
                        expect(body.error.message).to.eql('must be a date');
                        expect(body.error.field).to.eql('birth_date')
                  });
                  //numeric
                  it('invalid age input should return error', async function(){
                        let sendData = data.postApplicationForceInvalidApplicationData('age', 'error');
                        let { body, statusCode } = await session.post('/application_form')
                                                                .send({...sendData, _csrf: csrf});
                        expect(statusCode).to.eql(422);
                        expect(body.error.message).to.eql('must be a number');
                        expect(body.error.field).to.eql('age')
                  });
                  //string
                  it('invalid city input should return error', async function(){
                        let sendData = data.postApplicationForceInvalidApplicationData('city', 'x');
                        let { body, statusCode } = await session.post('/application_form')
                                                                .send({...sendData, _csrf: csrf});
                        expect(statusCode).to.eql(422);
                        expect(body.error.message).to.eql('must be atleast 2 characters long max characters must be 40 only');
                        expect(body.error.field).to.eql('city')
                  });
                  //special case
                  it('New application civil status is M but no input in Spouse === not create application', async function() { //changes here
                        let { body, statusCode } = await session.post('/application_form')
                                                                .send({...data.postApplicationMarriedNoSpouseInput, _csrf: csrf});
                        expect(statusCode).to.eql(422);
                        expect(body.error.message).to.eql('Should input spouse information');
                  });
         
                  it('New Application civil status neither M or S === not create application', async function() {
                        let { body, statusCode } = await session.post('/application_form')
                                                                .send({...data.postApplicationCivilStatusNeitherMorS, _csrf: csrf});
                        expect(statusCode).to.eql(422);
                        expect(body).to.eql(data.postErrorCivilStatusNeitherMorS);
                  });
            });



            context('appApplicationInput', function(){  //will only test 2 to represent all numerice,string //paytype is special case
                  it('invalid days_to_pay input should return error', async function(){
                        let sendData = data.postApplicationForceInvalidApplicationData('days_to_pay', 'error');
                        let { body, statusCode } = await session.post('/application_form')
                                                                .send({...sendData, _csrf: csrf});
                        expect(statusCode).to.eql(422);
                        expect(body.error.message).to.eql('must be a number');
                        expect(body.error.field).to.eql('days_to_pay');
                  });

                  it('invalid remarks input should return error', async function(){
                        let sendData = data.postApplicationForceInvalidApplicationData('remarks', 1234);
                        let { body, statusCode } = await session.post('/application_form')
                                                                .send({...sendData, _csrf: csrf});
                        expect(statusCode).to.eql(422);
                        expect(body.error.message).to.eql('must be character letters');
                        expect(body.error.field).to.eql('remarks');
                  });
                  //special case
                  it('invalid pay_type input should return error', async function(){
                        let sendData = data.postApplicationForceInvalidApplicationData('pay_type', 'error');
                        let { body, statusCode } = await session.post('/application_form')
                                                                .send({...sendData, _csrf: csrf});
                        expect(statusCode).to.eql(422);
                        expect(body.error.message).to.eql('Invalid Paytype value');
                        expect(body.error.field).to.eql('pay_type');
                  });
            });



            context('appSpouseInput', function(){     //will only test 4 to represent all numerice, string, date
                  it('invalid Sfirst_name and Slast_name input should return error', async function(){
                        let fields = ['Sfirst_name','Slast_name'];
                        for(let i=0; i<fields.length;i++){
                              let sendData = data.postApplicationForceInvalidSpouseData(fields[i], 1);
                              let {body, statusCode} = await session.post('/application_form')
                                                                    .send({...sendData, _csrf: csrf});
                              expect(statusCode).to.eql(422);
                              expect(body.error.message).to.eql('must be character letters');
                              expect(body.error.field).to.eql(fields[i]);
                        }
                        
                  });

                  it('invalid Sbirth_date input should return error', async function(){
                        let sendData = data.postApplicationForceInvalidSpouseData('Sbirth_date', 'error');
                        let {body, statusCode} = await session.post('/application_form')
                                                              .send({...sendData, _csrf: csrf});
                        expect(statusCode).to.eql(422);
                        expect(body.error.message).to.eql('Must be a date');
                        expect(body.error.field).to.eql('Sbirth_date');
                  });

                  it('invalid Scontact_no input should return error', async function(){
                        let sendData = data.postApplicationForceInvalidSpouseData('Scontact_no', 'error1');
                        let {body, statusCode} = await session.post('/application_form')
                                                              .send({...sendData, _csrf: csrf});
                        expect(statusCode).to.eql(422);
                        expect(body.error.message).to.eql('must be a string digit');
                        expect(body.error.field).to.eql('Scontact_no');
                  });

                  it('invalid string inputs must be characters letters', async function(){
                        let fields = [ ['Sstreet_address',1], ['Sbarangay',1], ['Scity',1], ['Sprovince',1], ['Sreligion',1], ['Ssource_of_income',1]];
                        for(let i=0;i<fields.length;i++){
                              let sendData = data.postApplicationForceInvalidSpouseData(fields[i][0], fields[i][1]);
                              let {body, statusCode} = await session.post('/application_form')
                                                                    .send({...sendData, _csrf: csrf});
                              expect(statusCode).to.eql(422);
                              expect(body.error.message).to.eql('must be character letters');
                              expect(body.error.field).to.eql(fields[i][0]);
                        }
                  });

                  it('invalid string maximum length input', async function(){
                        let invalidStrLength = 'worddd'.repeat([6]);
                        let fields = [ ['Sfirst_name',invalidStrLength, 20], ['Slast_name', invalidStrLength, 20], ['Sstreet_address',invalidStrLength, 30], ['Sbarangay',invalidStrLength, 30], ['Scity',invalidStrLength, 30], ['Sprovince',invalidStrLength, 30], ['Sreligion',invalidStrLength, 30], ['Ssource_of_income',invalidStrLength, 30]];
                        for(let i=0;i<fields.length;i++){
                              let sendData = data.postApplicationForceInvalidSpouseData(fields[i][0], fields[i][1]);
                              let {body, statusCode} = await session.post('/application_form')
                                                                    .send({...sendData, _csrf: csrf});
                              expect(statusCode).to.eql(422);
                              expect(body.error.message).to.eql(`max length of value should be ${fields[i][2]}`);
                              expect(body.error.field).to.eql(fields[i][0]);
                        }
                  });
            })
     })


     
     context('Side effects like setting variables/values Cases', function(){
         //calculation is interestAmount = interest_rate * amountLoan then total = interestAmount + amountLoan  
         it('New application pay type is monthly interest_rate = 0.1 mnthsToPay = 2 amountLoan = 3000 so interestAmount = 600 total = 3600', async function() {
               let res = await session.post('/application_form')
                                      .send({...data.postApplicationPayTypeMonthly, _csrf: csrf});
               expect(res.statusCode).to.eql(201);
               expect(res.body.data).to.have.property('customer');
               expect(res.body.data).to.have.property('application');
               expect(res.body.data).not.to.have.property('spouse');
               expect(res.body.data.application.interest_amount).to.eql('600.00');
               expect(res.body.data.application.total).to.eql('3600.00');
         });
     })
     
})






