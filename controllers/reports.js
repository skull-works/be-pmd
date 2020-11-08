const { Op, literal } = require('sequelize');
const moment = require('moment');
//models
const {
	Application,
	Customer,
	Passbook,
	PassbookItems,
	Log,
} = require('../models/index');
//helper function
const { getDates } = require('./operations/reports');

exports.getCalendarReport = async (req, res, next) => {
	let { areaGroup, startDate, endDate } = req.params;
	try {
		let payments = await Application.findAll({
			attributes: ['id', 'area_code', 'first_name', 'last_name', 'type_loan'],
			include: [
				{
					model: Customer,
					attributes: ['contact_no'],
				},
				{
					model: Passbook,
					attributes: {
						exclude: ['area_code', 'createdAt', 'updatedAt', 'applicationId'],
					},
					include: [
						{
							model: PassbookItems,
							attributes: ['id', 'dates_paid', 'collection'],
							where: {
								dates_paid: { [Op.between]: [startDate, endDate] },
							},
						},
					],
				},
			],
			where: {
				area_code: {
					[Op.like]: `${areaGroup}%`,
				},
				status: 'ONGOING',
			},
		});
		if (payments.length > 0) {
			let sendData = {};
			sendData.allDates = getDates(startDate, endDate);
			sendData.customerPayments = payments;
			return res.status(200).json(sendData);
		}
		throw { message: 'no data found' };
	} catch (err) {
		next(err);
	}
};

exports.getLogs = async (req, res, next) => {
	try {
		let logs = await Log.findAll({ raw: true });
		let max = logs.length;
		for (var i = 0; i < max; i++)
			logs[i]['createdAt'] = moment(logs[i].createdAt).format(
				'YYYY-MM-DD hh:mm A'
			);
		res.status(200).json(logs);
	} catch (err) {
		next(err);
	}
};

exports.getCashInflowOutflow = async (req, res, next) => {
	let { areaGroup, startDate, endDate } = req.params;

	const dates = getDates(startDate, endDate);

	let released_attr = [];
	let recieved_attr = [];

	for (const date of dates) {
		recieved_attr.push([
			literal(
				`(select sum(collection) from passbookitems where dates_paid='${date}' and passbookId IN (select id from passbooks where area_code like '${areaGroup}%') )`
			),
			`recieved_${date}`,
		]);
		released_attr.push([
			literal(
				`sum(case when passbook.createdAt='${date}' then (select amount_loan from applications where id=applicationId) else 0 end)`
			),
			`released_${date}`,
		]);
	}

	try {
		let data = await Passbook.findAll({
			attributes: [...released_attr, ...recieved_attr],
			where: {
				area_code: {
					[Op.like]: `${areaGroup}%`,
				},
			},
			raw: true,
		});
		if (data.length > 0) {
			let sendData = {};
			sendData.released = [];
			sendData.recieved = [];

			for (const [key, value] of Object.entries(data[0])) {
				if (key.includes('recieved')) sendData.recieved.push(value || 0);
				else if (key.includes('released')) sendData.released.push(value || 0);
			}

			sendData.allDates = dates;
			return res.status(200).json(sendData);
		}
		throw { message: 'no data found' };
	} catch (err) {
		next(err);
	}
};
