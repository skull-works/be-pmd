const express = require('express');
const authController = require('../controllers/auth');

// middlewares
const { CheckCutoff } = require('../middleware/authentication/cutOff');

// initialize express router
const router = express.Router();


/**
 * @swagger
 * /csrf-token:
 *        get:
 *          description: get csrfToken
 *          responses:
 *              '202':
 *                description: successfuly generated csrfToken
 */
router.get(
    '/csrf-token',
    authController.generateCSRF
);


/**
 * @swagger
 * /sign-up:
 *        post:
 *          parameters:
 *            - name: username
 *              description: username to register for user
 *              in: body
 *              required: true
 *            - name: password
 *              description: password for user to register
 *              in: body
 *              required: true
 *          description: register user
 *          responses:
 *              '200':
 *                description: Registered User Successfuly 
 */
router.post(
    '/sign-up',
    CheckCutoff,
    authController.signUp
);


/**
 * @swagger
 * /login:
 *        post:
 *          parameters:
 *            - name: username
 *              description: Login info
 *              in: body
 *              required: true
 *          description: Login user
 *          responses:
 *              '200':
 *                description: Logged in successfuly
 */
router.post(
    '/login',
    CheckCutoff,
    authController.Login
);


/**
 * @swagger
 * /logout:
 *        post:
 *          parameters:
 *            - name: username
 *              description: value to identify which user to logout
 *              in: body
 *              required: true
 *          description: Request to log out user
 *          responses:
 *              '200':
 *                description: logout user
 */
router.get(
    '/logout',
    authController.willLogout
)


/**
 * @swagger
 * /isStillAuthenticated:
 *        post:
 *          description: Request to check if user is still authenticated
 *          responses:
 *              '200':
 *                description: user is still authenticated
 */
 router.get(
    '/isStillAuthenticated',
    CheckCutoff,
    authController.isStillAuthenticated
)


module.exports = router