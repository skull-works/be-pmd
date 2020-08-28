//testing frameworks
const { expect } = require('chai');
const request = require('supertest');
//helper
const { createData, findCustomer } = require('./helper/helper');
//application
const app = require('../../app');
//models
const { Application, Customer, Spouse } = require('../../models/index');
//mockData
const data = require('./data/general-data');
const updateData = require('./data/update-application');


describe('Suite = Update Application Controller', function(){
            
    before(async function(){
        await Customer.destroy({where:{}});
        await Application.destroy({where:{}});
        await Spouse.destroy({where:{}});
        let customers = await Customer.bulkCreate([...data.customers]);
        createData(customers);
    });


    context('Update Type', function(){
        context('Both', function(){
            it('Update area_code should update both customer and application table', async function(){
                let customer = await findCustomer('TEST-01');
                let sendData = updateData.updateApplicationDetails('both', 'area_code', 'TEST-200', customer.id);
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);
                expect(statusCode).to.eql(200);
                expect(body.type).to.eql('success');
                expect(body.message).to.eql('Updated Customer and 3 Applications Successfuly');
            });

            it('Update first_name should update both customer and application table', async function(){
                let customer = await findCustomer('TEST-200');
                let sendData = updateData.updateApplicationDetails('both', 'first_name', 'TestNewFirstName', customer.id);
                let { body, statusCode } = await request(app)
                                                                 .put('/application_form')
                                                                 .send(sendData);
                expect(statusCode).to.eql(200);
                expect(body.type).to.eql('success');
                expect(body.message).to.eql('Updated Customer and 3 Applications Successfuly');
            });

            it('Update last_name should update both customer and application table', async function(){
                let customer = await findCustomer('TEST-200');
                let sendData = updateData.updateApplicationDetails('both', 'last_name', 'TestNewLastName', customer.id);
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);
                expect(statusCode).to.eql(200);
                expect(body.type).to.eql('success');
                expect(body.message).to.eql('Updated Customer and 3 Applications Successfuly');
            });
        });

        context('Cusomter', function(){
            it('update birth_date', async function(){
                let sendData;
                let customer = await findCustomer('TEST-03');
                let data = updateData.updateApplicationDetails('customer', 'birth_date', '2018-04-04');
                data.id = customer.id;
                sendData = data;
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);
                expect(statusCode).to.eql(200);
                expect(body.message).to.eql('birth_date updated successfuly');
            });

            it('update age', async function(){
                let sendData;
                let customer = await findCustomer('TEST-03');
                let data = updateData.updateApplicationDetails('customer', 'age', '20');
                data.id = customer.id;
                sendData = data;
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);
                expect(statusCode).to.eql(200);
                expect(body.message).to.eql('age updated successfuly');
            });

            it('update contact_no', async function(){
                let sendData;
                let customer = await findCustomer('TEST-03');
                let data = updateData.updateApplicationDetails('customer', 'contact_no', '09990371222');
                data.id = customer.id;
                sendData = data;
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);
                expect(statusCode).to.eql(200);
                expect(body.message).to.eql('contact_no updated successfuly');
            });

            it('update civil_status', async function(){
                let sendData;
                let customer = await findCustomer('TEST-03');
                let data = updateData.updateApplicationDetails('customer', 'civil_status', 'M');
                data.id = customer.id;
                sendData = data;
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);
                expect(statusCode).to.eql(200);
                expect(body.message).to.eql('civil_status updated successfuly');
            });

            it('update street_address', async function(){
                let sendData;
                let customer = await findCustomer('TEST-03');
                let data = updateData.updateApplicationDetails('customer', 'street_address', 'Manila');
                data.id = customer.id;
                sendData = data;
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);
                expect(statusCode).to.eql(200);
                expect(body.message).to.eql('street_address updated successfuly');
            });

            it('update barangay', async function(){
                let sendData;
                let customer = await findCustomer('TEST-03');
                let data = updateData.updateApplicationDetails('customer', 'barangay', 'Poblacion 11');
                data.id = customer.id;
                sendData = data;
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);
                expect(statusCode).to.eql(200);
                expect(body.message).to.eql('barangay updated successfuly');
            });

            it('update city', async function(){
                let sendData;
                let customer = await findCustomer('TEST-03');
                let data = updateData.updateApplicationDetails('customer', 'city', 'Metro Manila');
                data.id = customer.id;
                sendData = data;
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);
                expect(statusCode).to.eql(200);
                expect(body.message).to.eql('city updated successfuly');
            });

            it('update province', async function(){
                let sendData;
                let customer = await findCustomer('TEST-03');
                let data = updateData.updateApplicationDetails('customer', 'province', 'Province of Manila');
                data.id = customer.id;
                sendData = data;
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);
                expect(statusCode).to.eql(200);
                expect(body.message).to.eql('province updated successfuly');
            });

            it('update religion', async function(){
                let sendData;
                let customer = await findCustomer('TEST-03');
                let data = updateData.updateApplicationDetails('customer', 'religion', 'Roman Catholic');
                data.id = customer.id;
                sendData = data;
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);
                expect(statusCode).to.eql(200);
                expect(body.message).to.eql('religion updated successfuly');
            });
            
            it('update nationality', async function(){
                let sendData;
                let customer = await findCustomer('TEST-03');
                let data = updateData.updateApplicationDetails('customer', 'nationality', 'Russian');
                data.id = customer.id;
                sendData = data;
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);
                expect(statusCode).to.eql(200);
                expect(body.message).to.eql('nationality updated successfuly');
            });

            it('update source_of_income', async function(){
                let sendData;
                let customer = await findCustomer('TEST-03');
                let data = updateData.updateApplicationDetails('customer', 'source_of_income', 'Lending');
                data.id = customer.id;
                sendData = data;
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);
                expect(statusCode).to.eql(200);
                expect(body.message).to.eql('source_of_income updated successfuly');
            });

            it('update length_of_service', async function(){
                let sendData;
                let customer = await findCustomer('TEST-03');
                let data = updateData.updateApplicationDetails('customer', 'length_of_service', '6 years');
                data.id = customer.id;
                sendData = data;
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);
                expect(statusCode).to.eql(200);
                expect(body.message).to.eql('length_of_service updated successfuly');
            });

            it('update length_of_stay', async function(){
                let sendData;
                let customer = await findCustomer('TEST-03');
                let data = updateData.updateApplicationDetails('customer', 'length_of_stay', '6 years');
                data.id = customer.id;
                sendData = data;
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);
                expect(statusCode).to.eql(200);
                expect(body.message).to.eql('length_of_stay updated successfuly');
            });

            it('update occupation', async function(){
                let sendData;
                let customer = await findCustomer('TEST-03');
                let data = updateData.updateApplicationDetails('customer', 'occupation', 'BusinessPerson');
                data.id = customer.id;
                sendData = data;
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);
                expect(statusCode).to.eql(200);
                expect(body.message).to.eql('occupation updated successfuly');
            });
        });

        context('Application', function(){
            it('update amount loan and will also change interest_amount and total base on amount loan', async function(){
                let sendData = updateData.updateApplicationDetails('application', 'amount_loan', 4000, 4);     // 4th argument is form ID of appliation from general-data
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);
                let application = await Application.findByPk(4);     // pay_type is daily

                expect(statusCode).to.eql(200);
                expect(body.type).to.eql('success');
                expect(body.message).to.eql('amount_loan updated successfuly');
                expect(application.pay_type).to.eql('DAILY');
                expect(application.amount_loan).to.eql(4000);
                expect(application.interest_amount).to.eql(560);
                expect(application.total).to.eql(4560);
            });

            it('update pay_type to daily should change (interest_amount and total) base on interest rate 0.14', async function(){
                let sendData = updateData.updateApplicationDetails('application', 'pay_type', 'DAILY', 5);      // 4th argument is form ID of appliation from general-data
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);
                let application = await Application.findByPk(5);     // pay_type is WEEKLY change to DAILY and amount loan is already 3000

                expect(statusCode).to.eql(200);
                expect(body.type).to.eql('success');
                expect(body.message).to.eql('pay_type updated successfuly');
                expect(application.pay_type).to.eql('DAILY');
                expect(application.amount_loan).to.eql(3000);
                expect(application.interest_amount).to.eql(420);
                expect(application.total).to.eql(3420);
            });

            //no need to test WEEKLY since it is the same with MONTHLY
            it('update pay_type to MONTHLY should change (interest_amount and total) base on interest rate 0.1 & mnths_to_pay', async function(){
                let sendData = updateData.updateApplicationDetails('application', 'pay_type', 'MONTHLY', 6);      // 4th argument is form ID of appliation from general-data
                sendData.mnths_to_pay = 2;
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);
                let application = await Application.findByPk(6);                  //pay_type is DAILY change to MONTHLY and amount loan is already 3000

                expect(statusCode).to.eql(200);
                expect(body.type).to.eql('success');
                expect(body.message).to.eql('pay_type updated successfuly');
                expect(application.pay_type).to.eql('MONTHLY');
                expect(application.amount_loan).to.eql(3000);
                expect(application.interest_amount).to.eql(600);                //interest_amount = (interest_rate * amount_loan) * mnths_to_pay
                expect(application.total).to.eql(3600);                         //total = amount_loan + interest_amount
            });

            it('update days_to_pay', async function(){
                let sendData = updateData.updateApplicationDetails('application', 'days_to_pay', 58, 6);      // 4th argument is form ID of appliation from general-data
                sendData.mnths_to_pay = 2;
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);

                expect(statusCode).to.eql(200);
                expect(body.type).to.eql('success');
                expect(body.message).to.eql('days_to_pay updated successfuly');                      
            });

            it('update pay_breakdown', async function(){
                let sendData = updateData.updateApplicationDetails('application', 'pay_breakdown', 70, 6);      // 4th argument is form ID of appliation from general-data
                sendData.mnths_to_pay = 2;
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);

                expect(statusCode).to.eql(200);
                expect(body.type).to.eql('success');
                expect(body.message).to.eql('pay_breakdown updated successfuly');                      
            });

            it('update proc_fee', async function(){
                let sendData = updateData.updateApplicationDetails('application', 'proc_fee', 120, 6);      // 4th argument is form ID of appliation from general-data
                sendData.mnths_to_pay = 2;
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);

                expect(statusCode).to.eql(200);
                expect(body.type).to.eql('success');
                expect(body.message).to.eql('proc_fee updated successfuly');                      
            });

            it('update remarks', async function(){
                let sendData = updateData.updateApplicationDetails('application', 'remarks', 'new sample remarks message', 6);      // 4th argument is form ID of appliation from general-data
                sendData.mnths_to_pay = 2;
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);

                expect(statusCode).to.eql(200);
                expect(body.type).to.eql('success');
                expect(body.message).to.eql('remarks updated successfuly');                      
            });

            it('update status to approved', async function(){
                let sendData = updateData.updateApplicationDetails('application', 'status', 'APPROVED', 6);      // 4th argument is form ID of appliation from general-data
                sendData.mnths_to_pay = 2;
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);

                expect(statusCode).to.eql(200);
                expect(body.type).to.eql('success');
                expect(body.message).to.eql('status updated successfuly');                      
            });

            it('update status to rejected', async function(){
                let sendData = updateData.updateApplicationDetails('application', 'status', 'REJECTED', 6);      // 4th argument is form ID of appliation from general-data
                sendData.mnths_to_pay = 2;
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);

                expect(statusCode).to.eql(200);
                expect(body.type).to.eql('success');
                expect(body.message).to.eql('status updated successfuly');                      
            });
        });

        context('Spouse', function(){
            it('update Sfirst_name', async function(){
                let spouse = await Spouse.findOne({ where: { Sfirst_name: 'TestSpouseFname2' }});
                let sendData = updateData.updateApplicationDetails('spouse', 'Sfirst_name', 'NewTestSpouseFname2', spouse.id );      // 4th argument is form ID of appliation from general-data
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);

                expect(statusCode).to.eql(200);
                expect(body.type).to.eql('success');
                expect(body.message).to.eql('Sfirst_name updated successfuly');                      
            });

            //then next remaining test the Sfirst_name will be NewTestSpouseFname2 in finding spouse due to changes from previous test above
            it('update Slast_name', async function(){
                let spouse = await Spouse.findOne({ where: { Sfirst_name: 'NewTestSpouseFname2' }});
                let sendData = updateData.updateApplicationDetails('spouse', 'Slast_name', 'NewTestSpouseLname2', spouse.id );      // 4th argument is form ID of appliation from general-data
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);

                expect(statusCode).to.eql(200);
                expect(body.type).to.eql('success');
                expect(body.message).to.eql('Slast_name updated successfuly');                      
            });

            it('update Sbirth_date', async function(){
                let spouse = await Spouse.findOne({ where: { Sfirst_name: 'NewTestSpouseFname2' }});
                let sendData = updateData.updateApplicationDetails('spouse', 'Sbirth_date', '2018-04-04', spouse.id );      // 4th argument is form ID of appliation from general-data
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);

                expect(statusCode).to.eql(200);
                expect(body.type).to.eql('success');
                expect(body.message).to.eql('Sbirth_date updated successfuly');                      
            });

            it('update Scontact_no', async function(){
                let spouse = await Spouse.findOne({ where: { Sfirst_name: 'NewTestSpouseFname2' }});
                let sendData = updateData.updateApplicationDetails('spouse', 'Scontact_no', '09990371921', spouse.id );      // 4th argument is form ID of appliation from general-data
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);

                expect(statusCode).to.eql(200);
                expect(body.type).to.eql('success');
                expect(body.message).to.eql('Scontact_no updated successfuly');                      
            });

            it('update Sstreet_address', async function(){
                let spouse = await Spouse.findOne({ where: { Sfirst_name: 'NewTestSpouseFname2' }});
                let sendData = updateData.updateApplicationDetails('spouse', 'Sstreet_address', 'Cavite street', spouse.id );      // 4th argument is form ID of appliation from general-data
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);

                expect(statusCode).to.eql(200);
                expect(body.type).to.eql('success');
                expect(body.message).to.eql('Sstreet_address updated successfuly');                      
            });

            it('update Sbarangay', async function(){
                let spouse = await Spouse.findOne({ where: { Sfirst_name: 'NewTestSpouseFname2' }});
                let sendData = updateData.updateApplicationDetails('spouse', 'Sbarangay', 'Cavite barangay', spouse.id );      // 4th argument is form ID of appliation from general-data
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);

                expect(statusCode).to.eql(200);
                expect(body.type).to.eql('success');
                expect(body.message).to.eql('Sbarangay updated successfuly');                      
            });

            it('update Scity', async function(){
                let spouse = await Spouse.findOne({ where: { Sfirst_name: 'NewTestSpouseFname2' }});
                let sendData = updateData.updateApplicationDetails('spouse', 'Scity', 'Cavite city', spouse.id );      // 4th argument is form ID of appliation from general-data
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);

                expect(statusCode).to.eql(200);
                expect(body.type).to.eql('success');
                expect(body.message).to.eql('Scity updated successfuly');                      
            });

            it('update Sprovince', async function(){
                let spouse = await Spouse.findOne({ where: { Sfirst_name: 'NewTestSpouseFname2' }});
                let sendData = updateData.updateApplicationDetails('spouse', 'Sprovince', 'Cavite province', spouse.id );      // 4th argument is form ID of appliation from general-data
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);

                expect(statusCode).to.eql(200);
                expect(body.type).to.eql('success');
                expect(body.message).to.eql('Sprovince updated successfuly');                      
            });

            it('update Sreligion', async function(){
                let spouse = await Spouse.findOne({ where: { Sfirst_name: 'NewTestSpouseFname2' }});
                let sendData = updateData.updateApplicationDetails('spouse', 'Sreligion', 'Roman Catholic', spouse.id );      // 4th argument is form ID of appliation from general-data
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);

                expect(statusCode).to.eql(200);
                expect(body.type).to.eql('success');
                expect(body.message).to.eql('Sreligion updated successfuly');                      
            });

            it('update Ssource_of_income', async function(){
                let spouse = await Spouse.findOne({ where: { Sfirst_name: 'NewTestSpouseFname2' }});
                let sendData = updateData.updateApplicationDetails('spouse', 'Ssource_of_income', 'Sales market manager', spouse.id );      // 4th argument is form ID of appliation from general-data
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);

                expect(statusCode).to.eql(200);
                expect(body.type).to.eql('success');
                expect(body.message).to.eql('Ssource_of_income updated successfuly');                      
            });

            it('update Snationality', async function(){
                let spouse = await Spouse.findOne({ where: { Sfirst_name: 'NewTestSpouseFname2' }});
                let sendData = updateData.updateApplicationDetails('spouse', 'Snationality', 'Filipina', spouse.id );      // 4th argument is form ID of appliation from general-data
                let { body, statusCode } = await request(app)
                                                 .put('/application_form')
                                                 .send(sendData);

                expect(statusCode).to.eql(200);
                expect(body.type).to.eql('success');
                expect(body.message).to.eql('Snationality updated successfuly');                      
            });
        });
    });
});