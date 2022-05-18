const express = require('express');
const router = express.Router()
const controller = require('../controllers/userController')
const {isGuest, isLoggedIn} = require('../middlewares/auth');
const {validateLogin, validateSignup, validateResult} = require('../middlewares/validator');
const { logInLimiter } = require('../middlewares/rateLimiters.js');

router.get('/login', isGuest, controller.login );

router.post('/login', logInLimiter, isGuest, validateLogin, validateResult, controller.validatelogin );

router.get('/signup', isGuest, controller.signup );

router.post('/signup', isGuest, validateSignup, validateResult, controller.newuser );

router.get('/logout', isLoggedIn, controller.logout );

router.get('/profile', isLoggedIn, controller.profile );

router.post('/:id/watch', isLoggedIn, controller.watch );

router.post('/:id/unwatch', isLoggedIn, controller.unwatch );

module.exports = router;