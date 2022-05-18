const express = require('express');
const router = express.Router();
const controller = require('../controllers/tradesController');
const {isLoggedIn} = require('../middlewares/auth');
const {isIDValid, validTrade, validateResult, availableForTrade, notOwnTrade} = require('../middlewares/validator');

router.get('/', controller.index)

router.post('/', isLoggedIn,  validTrade, validateResult, controller.create);

router.get('/new', isLoggedIn, controller.new);

router.get('/:id', isIDValid, controller.details);

router.get('/:id/edit', isIDValid, isLoggedIn, isIDValid, controller.edit);

router.put('/:id', isIDValid, isLoggedIn, isIDValid,  validTrade, validateResult, controller.update);

router.delete('/:id', isIDValid, isLoggedIn, isIDValid, controller.delete);

router.get('/:id/offer', isIDValid, isLoggedIn, notOwnTrade, controller.offer );

router.post('/makeoffer', isLoggedIn, availableForTrade, controller.makeoffer );

router.post('/:id/accept', isLoggedIn, controller.accept );

router.post('/:id/cancel', isLoggedIn, controller.cancel );

module.exports = router;