//testing frameworks
const { expect } = require('chai');
const request = require('supertest');
//helper
const { createData } = require('./helper/helper');
//associations
const associations = require('../../util/associations');
const app = require('../../app');
//models
const Application = require('../../models/application');
const Customer = require('../../models/customer');
const Spouse = require('../../models/spouse');
//mockData
const data = require('./data/general-data');



describe('Suite === Get Application details controller', function(){
    before(async function(){
        associations();
        await Customer.destroy({where:{}});
        await Application.destroy({where:{}});
        await Spouse.destroy({where:{}});
        let customers = await Customer.bulkCreate([...data.customers]);
        createData(customers);
    });

    
    context('Data returned', function(){
        it('Should Retrieve application details with no spouse', async function(){
            let area_code = 'TEST-01';
            let form_id = 1;
            let {body, statusCode} = await request(app)
                                           .get(`/application_form-details/${area_code}/${form_id}`);
            expect(statusCode).to.eql(200);
            expect(body).to.have.property('customer');
            expect(body).to.have.property('application');
            expect(body).not.to.have.property('spouse');
            expect(body.customer.area_code).to.eql('TEST-01');
            expect(body.customer.first_name).to.eql('TestFname1');
            expect(body.application.id).to.eql(1);
        });

        it('Should Retrieve application details with spouse', async function(){
            let area_code = 'TEST-02';
            let form_id = 4;
            let {body, statusCode} = await request(app)
                            .get(`/application_form-details/${area_code}/${form_id}`);
            expect(statusCode).to.eql(200);
            expect(body).to.have.property('customer');
            expect(body).to.have.property('application');
            expect(body).to.have.property('spouse');
            expect(body.customer.area_code).to.eql('TEST-02');
            expect(body.customer.first_name).to.eql('TestFname2');
            expect(body.application.id).to.eql(4);
        });

        it('No data or Something went wrong should return an error message', async function(){
            let area_code = 'TEST-Invalid'; //invalid data
            let form_id   = 6;              //invalid data
            let {body, statusCode} = await request(app)
                            .get(`/application_form-details/${area_code}/${form_id}`);
            expect(statusCode).to.eql(422);
            expect(body.error.message).to.eql('Something went wrong contact developer or No data found');
        });
    })


    context('Validation Cases', function(){
        it('Should return a message "must be atleast 4 characters" ', async function(){
            let area_code = 'TES';
            let form_id = 4;
            let {body, statusCode} = await request(app)
                            .get(`/application_form-details/${area_code}/${form_id}`);
            expect(statusCode).to.eql(422);
            expect(body).to.have.property('error');
            expect(body.error.message).to.eql('must be atleast 4 characters');
        });

        it('Should return a message "Must be a number" ', async function(){
            let area_code = 'TEST-01';
            let form_id = 'W';
            let {body, statusCode} = await request(app)
                            .get(`/application_form-details/${area_code}/${form_id}`);
            expect(statusCode).to.eql(422);
            expect(body).to.have.property('error');
            expect(body.error.message).to.eql('Must be a number');
        });
    });
    
});