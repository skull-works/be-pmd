const { Application } = require('../models/index');


exports.postPassbook = async (req, res ,next) => {
    let passbook = {...req.body};
    passbook.createdAt = Date.now();
    let application = await Application.findByPk(req.body.AppId);
    return application.createPassbook(passbook)
    .then(passbook => {
        return res.status(200).json(passbook);
    })
    .catch(err => {
        console.log(err);
    });
};