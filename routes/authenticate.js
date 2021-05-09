const express = require('express');
const authController = require('../controllers/auth');

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
    authController.Login
);


/**
 * @swagger
 * /isLoggedIn:
 *        post:
 *          description: Check if user still logged in and generate new Access Token
 *          responses:
 *              '200':
 *                description: generate new Access Token if User still Logged In
 */
router.get(
    '/isLoggedIn',
    authController.isLoggedIn
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


module.exports = router