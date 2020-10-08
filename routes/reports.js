const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports');
const { isAuthenticated } = require('../middleware/authentication/isAuth');



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
    isAuthenticated,
    reportsController.getCalendarReport
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
    isAuthenticated,
    reportsController.getLogs
);

module.exports = router;