const { Op } = require('sequelize');
//models
const { Application, Customer, Passbook, PassbookItems } = require('../models/index');
//helper function
const { getDates } = require('./operations/reports');



exports.getCalendarReport = async (req, res, next) => {
    let  { areaGroup, startDate, endDate } = req.params;
    try{
        let payments = await Application.findAll({
            attributes: ['id', 'area_code', 'first_name', 'last_name', 'type_loan'],
            include: [
                {
                    model: Customer,
                    attributes: ['contact_no']
                },
                {
                    model: Passbook,
                    attributes: { exclude: ['area_code', 'createdAt', 'updatedAt', 'applicationId'] },
                    include: [{
                        model: PassbookItems,
                        attributes: ['id', 'dates_paid', 'collection'],
                        where: {
                             dates_paid: { [Op.between]: [startDate, endDate] }
                        }
                    }]
                }
            ],
            where: {
                area_code : { 
                    [Op.like]: `${areaGroup}%`
                },
                status: 'ONGOING'
            }
        });
        if(payments.length > 0){
            let sendData = {};
            sendData.allDates = getDates(startDate, endDate);
            sendData.customerPayments = payments
            return res.status(200).json(sendData);
        }
        throw({ message: 'no data found' })
    }catch(err){
        next(err)
    }
}