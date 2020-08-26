//npm packages
const express = require('express');
//controllers
const applicationController = require('../controllers/application');
//validations
const applicationValidator = require('../validation/application');
//errors
const Errors = require('../errors/errors');
//initialize express router
const router = express.Router();



/**
 * @swagger
 * /application_form:
 *                post:
 *                  parameters:
 *                    - name: name
 *                      description: data of customer to be input
 *                      in: body
 *                      required: true
 *                  description: request to create new customer
 *                  responses: 
 *                      '201':      
 *                          description: Customer created successfuly
 */
router.post(
    '/application_form',
    applicationValidator.appNamesCodeInput,
    applicationValidator.appPostInputValidation,
    applicationValidator.appApplicationInput,
    applicationValidator.appCustomerInput,
    applicationValidator.appSpouseInput,   
    Errors.errorValidation,
    applicationController.postAddApplication);


/**
 * @swagger
 * /application_form/:{start_date}/:{end_date}:
 *                get:
 *                  parameters:
 *                      - name: start_date
 *                        description: start_date field
 *                        in: parameters
 *                        required: true
 *                      - name: end_date
 *                        description: end_date field
 *                        in: parameters
 *                        required: true
 *                      - name: inputs
 *                        description: input parameter to use to get application data
 *                        in: query
 *                  description: request to get application data
 *                  responses:
 *                      '202':
 *                          description: Data successfuly fetched
 *                  
 */
router.get(
    '/application_form/:start_date/:end_date',
    applicationValidator.jsonParse,
    applicationValidator.appGetApplicationInput,
    Errors.errorValidation,
    applicationController.getApplications);

/**
 * @swagger
 * /application_form-details/{area_code}/{formId}:
 *                 get:
 *                   parameters:
 *                     - name: area_code
 *                       description: area id of customer of application
 *                       in: parameters
 *                       required: true
 *                     - name: formId
 *                       description: id of application
 *                       in: parameters
 *                       required: true
 *                   description: request to get application details 
 *                   responses:
 *                      '202': 
 *                          description: Data successfuly fetched
 */
router.get(
    '/application_form-details/:area_code/:formId',
    applicationValidator.getApplicationInputDetails,
    Errors.errorValidation,
    applicationController.getApplicationDetails);


 /**
  * @swagger
  * /application_form:
  *                 put:
  *                   parameters:
  *                     - name: formId
  *                       description: id of application
  *                       in: body
  *                       required: true
  *                     - name: fieldName
  *                       description: field to be updated
  *                       in: body
  *                       required: true
  *                     - name: fieldValue
  *                       description: new value of field
  *                       in: body
  *                       required: true
  *                   description: request to update existing application
  *                   responses:
  *                     '202':
  *                         description: updated successfuly
  */   
router.put(
    '/application_form',
    applicationValidator.getApplicationInputUpdate,
    Errors.errorValidation,
    applicationController.updateApplication
);


module.exports = router;