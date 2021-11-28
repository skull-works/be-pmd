// npm packages
const express = require('express');

// controllers
const passbookController = require('../controllers/passbook');

// middlewares
const passbookValidation = require('../middleware/validation/passbook');
const { errorValidation } = require('../middleware/errors/errors');
const { isAuthenticated } = require('../middleware/authentication/isAuth');
const { CheckCutoff } = require('../middleware/authentication/cutOff');

// initialize express router
const router = express.Router();

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
    CheckCutoff,
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
    CheckCutoff,
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
    CheckCutoff,
    isAuthenticated,
    passbookValidation.getParamsPassbookItems,
    errorValidation,
    passbookController.getPassbookItems
);


/**
 * @swagger
 * /passbook-item/{id}/{formId}/{collection}/{dates_paid}:
 *        get:
 *          parameters:
 *            - name: id
 *              description: id of payment to be deleted
 *              in: path
 *              required: true
 *              schema:
 *                type: integer
 *            - name: formId
 *              description: form id of payment that will deleted
 *              in: path
 *              required: true
 *              schema:
 *                type: integer
 *            - name: collection
 *              description: collection of the deleted payment
 *              in: path
 *              required: true
 *              schema:
 *                type: integer
 *            - name: dates_paid
 *              description: dates_paid of the deleted payment
 *              in: path
 *              required: true
 *              schema:
 *                type: date
 *          description: delete a payment
 *          responses:
 *              '204':
 *                description: Payment deleted
 */
router.delete(
    '/passbook-item/:id/:formId/:collection/:dates_paid',
    CheckCutoff,
    isAuthenticated,
    passbookValidation.deleteParamsPassbookItems,
    errorValidation,
    passbookController.delPassbookItem
);


module.exports = router;