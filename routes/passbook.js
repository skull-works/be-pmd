//npm packages
const express = require('express');
const router = express.Router();
const passbookController = require('../controllers/passbook');
const passbookValidation = require('../middleware/validation/passbook');
const { errorValidation } = require('../middleware/errors/errors');
const { isAuthenticated } = require('../middleware/authentication/isAuth');


/**
 * @swagger
 * /passbook:
 *        post:
 *          parameters:
 *            - name: passbook
 *              description: values to be inserted to passbook
 *              in: body
 *              required: true
 *          description: post values to passbook
 *          responses:
 *              '200':
 *                description: Passbook Created Successfuly 
 */
router.post(
    '/passbook',
    isAuthenticated,
    passbookValidation.postBodyPassbook,
    passbookValidation.passbookCheck,
    errorValidation, 
    passbookController.postPassbook
);


/**
 * @swagger
 * /passbook-item:
 *        post:
 *          parameters:
 *            - name: passbook
 *              description: values to be inserted to passbook-item
 *              in: body
 *              required: true
 *          description: post values to passbook-item
 *          responses:
 *              '200':
 *                description: Payment Created Successfuly 
 */
router.post(
    '/passbook-item',
    isAuthenticated,
    passbookValidation.postBodyPassbookItems,
    errorValidation,
    passbookValidation.passbookItemCheckCleaning,
    passbookController.postPassbookItems
);


/**
 * @swagger
 * /passbook-item/{formId}:
 *        get:
 *          parameters:
 *            - name: formId
 *              description: formId field
 *              in: path
 *              required: true
 *              schema:
 *                type: integer
 *          description: get values from passbook-item
 *          responses:
 *              '202':
 *                description: Passbook Items Retrieved succussfuly
 */
router.get(
    '/passbook-item/:formId',
    isAuthenticated,
    passbookValidation.getParamsPassbookItems,
    errorValidation,
    passbookController.getPassbookItems
)


module.exports = router;