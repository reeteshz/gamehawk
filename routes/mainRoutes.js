const express = require('express');
const router = express.Router()
const controller = require('../controllers/mainController')

router.get('/contact', controller.contact );

router.get('/about', controller.about);

router.get('/', controller.home);

module.exports = router;