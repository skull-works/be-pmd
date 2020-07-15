const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/application');



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
router.post('/application_form', applicationController.postAddApplication);

module.exports = router;