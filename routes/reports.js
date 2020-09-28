const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports');



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
    reportsController.getCalendarReport
);

module.exports = router;