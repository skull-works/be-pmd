const express = require('express');

// controllers
const reportsController = require('../controllers/reports');

// middlewares
const { isAuthenticated } = require('../middleware/authentication/isAuth');
const { CheckCutoff } = require('../middleware/authentication/cutOff');

// initialize express router
const router = express.Router();



/**
 * @swagger
 * /calendarReport/{areaGroup}/{startDate}/{endDate}:
 *                post:
 *                  parameters:
 *                    - name: areaGroup
 *                      description: group of customers to be fetched
 *                      in: path
 *                      required: true
 *                    - name: startDate
 *                      description: start date
 *                      in: path
 *                      required: true
 *                    - name: endDate
 *                      description: end date
 *                      in: path
 *                      required: true
 *                  description: Request to fetch customer ongoing passbooks/payments
 *                  responses: 
 *                      '201':      
 *                          description: Fetched Successfuly
 */
router.get(
    '/calendarReport/:areaGroup/:startDate/:endDate',
    CheckCutoff,
    isAuthenticated,
    reportsController.getCalendarReport
);


/**
 * @swagger
 * /GraphReport/{areaGroup}/{startDate}/{endDate}:
 *                post:
 *                  parameters:
 *                    - name: areaGroup
 *                      description: group of customers to be fetched
 *                      in: path
 *                      required: true
 *                    - name: startDate
 *                      description: start date
 *                      in: path
 *                      required: true
 *                    - name: endDate
 *                      description: end date
 *                      in: path
 *                      required: true
 *                  description: Request to fetch customer ongoing passbooks/payments
 *                  responses: 
 *                      '201':      
 *                          description: Fetched Successfuly
 */
router.get(
    '/GraphReport/:areaGroup/:startDate/:endDate',
    CheckCutoff,
    isAuthenticated,
    reportsController.getCashInflowOutflow
);

/**
 * @swagger
 * /logs:
 *      post:
 *        description: Request to fetch logs
 *        responses: 
 *            '201':      
 *                description: Fetched Successfuly
 */
router.get(
    '/logs',
    CheckCutoff,
    isAuthenticated,
    reportsController.getLogs
);

module.exports = router;