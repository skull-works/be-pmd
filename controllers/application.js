//npm packages
const { Op } = require('sequelize');
//models
const Application = require('../models/application');
const Paybases = require('../models/payment_classifications');
const Customer = require('../models/customer');
const Spouse = require('../models/spouse');
//errors
const Errors = require('../errors/errors');
//operations
const CalculateLoan = require('../operations/application');



exports.postAddApplication = (req,res,next) => {
    let body = req.body;

    Paybases.findAll({where:{pay_type: body.pay_type}})
    .then(paybases => {
        if(paybases.length === 0){
            Errors.standardError('Paybases', 'Paybases not Found');
        }

        body.interest_amount = (body.amount_loan * paybases[0].interest_rate) * (body.mnths_to_pay?body.mnths_to_pay:1) ;
        body.interest_amount = body.interest_amount.toFixed(2);
        body.total = (+body.interest_amount + +body.amount_loan).toFixed(2);

        if(body.type_loan === 'NEW'){
            body.no_of_applications = 1;
            return Customer.create(body)
        }
        return Customer.findAll({where: {area_code: body.area_code}})
        .then(customers => {
            let customer = customers[0];
            customer.no_of_applications += 1;
            return  customer.save();
        })
    })
    .then(customer => {
        if(body.civil_status){
            if(body.civil_status === 'M'){
                customer.createSpouse(body)
            }
        }
        return customer;
    })
    .then(customer => {
        return Application.cutomerAddApplication(customer,body)
    })
    .then(application => {
        return res.send(JSON.stringify({
            type: 'success', 
            subject: 'success',
            name: application.area_code,
            message: 'Application added succesfuly'}));
    })
    .catch(err => {
        next(err);
    });
};




exports.getApplications = (req,res) => {
  let inputs = req.params.inputs;
  Application.findAll({
      attributes: ['id','first_name','last_name','area_code','status','date_issued','created_by'],
      where: {
          [Op.and]:{
            date_issued:{
                [Op.and]: {
                    [Op.gte]: inputs.start_date,
                    [Op.lte]: inputs.end_date
                }},
            type_loan: {
                [Op.like]: inputs.type_loan
            },
            status: {
                [Op.like]: inputs.status
            },
            first_name: {
                [Op.like]: inputs.first_name
            },
            last_name: {
                [Op.like]: inputs.last_name
            }
          }
  }})
  .then(data => {
      res.send(JSON.stringify(data));
  })    
  .catch(err => {
      next(err);
  })
};




exports.getApplicationDetails = (req,res,next) => {
    let data = {};
    Customer.findOne({
        attributes: {
            exclude:['no_of_applications','createdAt','updatedAt']
        },
        where:{
            area_code: req.params.area_code,
        }
    })
    .then(customer => {
        data.customer = customer;
        return Application.findOne({
            attributes: {exclude:['area_code','first_name','last_name','interest_amount','createdBy','createdAt','updatedAt','customerId']},
            where:{id: req.params.formId, customerId: customer.id}});
    })
    .then(async (application) => {
        data.application = {...application.dataValues};
        if(data.customer.civil_status === 'M')
            data.spouse = await Spouse.findOne({
                attributes:{
                    exclude:['createdAt','updatedAt','customerId']},
                where:{
                    customerId: data.customer.id
                }
             });
        return;
    })
    .then(jsondata => {
        console.log('asdasd');
        res.send(JSON.stringify(data));
    })
    .catch(err => {
        next(err);
    })
};




exports.updateApplication = (req,res,next) => {
    let Model,Message;
    let Includes = ['id',`${req.body.fieldName}`];
    switch (req.body.updateType){
        case "both":
            Message = "Updated Customer";
            Model = Customer;
            break;
        case "application":
            Model = Application;
            Includes = ['id','amount_loan','total','interest_amount','mnths_to_pay', 'pay_type'];
            break;
        case "customer":
            Model = Customer;
            break;
        default:
            Model = Spouse;
    }
    Model.findByPk(req.body.id, { attributes: Includes})
    .then(data => {
        data[`${req.body.fieldName}`] = req.body.fieldValue;
        if(req.body.fieldName === 'amount_loan' || req.body.fieldName === 'pay_type')
            return CalculateLoan(req.body, req.body.fieldName === 'amount_loan'?req.body.fieldValue:data.amount_loan, data);
        return data.save();
    })
    .then(data => {
        if(req.body.updateType === 'both'){
            return data.getApplications({
                attributes: ['id','area_code',`${req.body.fieldName}`]
            })
        }
        Message = `${req.body.fieldName} updated successfuly`;
        return data;
    })
    .then(datas => {
        if(req.body.updateType === 'both'){
            datas.forEach(a => {
                let num = 0;
                Message = Message + ` and ${++num} Applications Successfuly`;
                a[`${req.body.fieldName}`] = req.body.fieldValue;
                a.save();
            })
        }
        return;
    })
    .then(() => {
        res.send(JSON.stringify({
            type: 'success', 
            message: Message
        }))
    })
    .catch(err => {
        next(err);
    })
}


