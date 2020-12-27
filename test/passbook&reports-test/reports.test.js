const { expect } = require('chai');
const { createLoginUser, createSession, Login } = require('../general-helper/session');

const { Application, Customer, Spouse, Passbook, PassbookItems } = require('../../models/index');
const { createData } = require('./helper/helper');
const { dateToday } = require('../general-helper/operations');
const data = require('./data/general-data');
const passbookData = require('./data/post-passbook');
//helper function here
const addPassbookPassbookItems = async (session, csrf, appId, areaCode) => {
    let { body  } = await session
                          .post('/passbook')
                          .send({...passbookData.postPassbook(areaCode, appId), _csrf:csrf});
    await session.post('/passbook-item').send({...passbookData.postPassbookItems(body.passbook.id, 3000, 200), _csrf: csrf});   
}






describe('Suite === Reports', function(){
    let user = 'TestAdmin8', userPassword = 'TestPassword8';
    let csrf, session;
    before(async function(){
        //cleaning tables
        await Customer.destroy({where:{}});
        await Application.destroy({where:{}});
        await Spouse.destroy({where:{}});
        await Passbook.destroy({where:{}});
        await PassbookItems.destroy({where:{}});

        //populating Customer and application tables
        let customers = await Customer.bulkCreate(data.customers);
        customerId = customers[2].id;
        createData(customers, data.application, data.spouse);
        
        // creating Userlogin and session
        await createLoginUser(user, userPassword);
        let { newSession, csurf } = await createSession();
        session = newSession;
        csrf = csurf;
        await Login(session, user, userPassword, csrf);

        //population Passbook and PassbookItems tables
        await addPassbookPassbookItems(session, csrf, 7, 'TEST-04');
        await addPassbookPassbookItems(session, csrf, 6, 'TEST-03');  
    });

    
    context('Calendar Reports', function(){
        it('Successful Fetch of reports', async function(){
            let { body, statusCode } = await session
                                                .get(`/calendarReport/TEST/2020-09-01/${dateToday()}`)
                                                .send({_csrf: csrf});
            expect(statusCode).to.eq(200);
            expect(body.allDates).not.to.be.empty;
            expect(body.customerPayments[2]).to.have.property('passbook');                 //application 6
            expect(body.customerPayments[2].passbook).to.have.property('passbookitems');
            expect(body.customerPayments[3]).to.have.property('passbook');                 //application 7
            expect(body.customerPayments[3].passbook).to.have.property('passbookitems');
        });

        it('No Payments retrieved from applications should return null passbook property', async function(){
            let { body, statusCode } = await session
                                                .get(`/calendarReport/TEST/2020-09-01/2020-09-02`)
                                                .send({_csrf: csrf});
            expect(statusCode).to.eq(200);
            expect(body.allDates).not.to.be.empty;
            expect(body.customerPayments[1].passbook).to.be.null;
            expect(body.customerPayments[2].passbook).to.be.null;
        })
    });
});