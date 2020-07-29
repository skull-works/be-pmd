const request = require('supertest');
const app = require('../app');
//associations
const associations = require('../util/associations');
//models
const Application = require('../models/application');
const Customer = require('../models/customer');
const Spouse = require('../models/spouse');
//data
const data = require('./data');

beforeAll(async () => {
    associations();
    await Application.destroy({where:{}});
    await Customer.destroy({where:{}});
    await Spouse.destroy({where:{}});
})

describe('Post Application', () => {
    //legends
    // ==== means 'should have'
    it('New application with spouse === customer/application/spouse', async (done) => {
        let res = await request(app)
                 .post('/application_form')
                 .send(data.postApplicationData);
         expect(res.statusCode).toEqual(201);
         expect(res.body.type).toEqual('success');
         expect(res.body.data).toHaveProperty('customer');
         expect(res.body.data).toHaveProperty('application');
         expect(res.body.data).toHaveProperty('spouse');
         done();
     });
})



describe('Get Applications', () => {
    it('Fetch applications according to date', async (done) => {
        let res = await request(app).get(`/application_form/2020-07-19/2020-07-29`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBeGreaterThan(0);
        done();
    })
})
