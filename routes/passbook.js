//npm packages
const express = require('express');
const router = express.Router();
const passbookController = require('../controllers/passbook');
const passbookValidation = require('../validation/passbook');
const { errorValidation } = require('../errors/errors');



router.post(
    '/passbook',
    passbookValidation.postBodyPassbook,
    passbookValidation.passbookCheck,
    errorValidation, 
    passbookController.postPassbook
);


module.exports = router;