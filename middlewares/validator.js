const model = require('../models/trade')
const {body} = require('express-validator')
const {validationResult} = require('express-validator')

// check if story ID is valid
exports.isIDValid = (req, res, next) => {
    let id = req.params.id;
    //an objectId is a 24-bit Hex string
    if(id.match(/^[0-9a-fA-F]{24}$/)) {
        return next();
    } else {
        let err = new Error('Invalid story id');
        err.status = 400;
        return next(err);
    }
}

exports.availableForTrade = (req, res, next) => {
    Promise.all([model.findById(req.body.trade), model.findById(req.body.offer)])
    .then(result=>{
        if(result[0].available == 0 && result[1].available == 0) {
            return next();
        } else {
            req.flash('error', 'Trade item is not available.')
            res.redirect('/trades');
        }
    })
    .catch()
}

exports.notOwnTrade = (req, res, next) => {
    tradeId = req.params.id
    model.findById(tradeId)
    .then(result=>{
        if(result.postedBy != req.session.user) {
            return next();
        } else {
            req.flash('error', "You can't make offer to your own trade.")
            res.redirect('/trades');
        }
    })
    .catch()
}

exports.validTrade =  [body('title', 'Title can not be empty').notEmpty().trim().escape(),
body('description', 'Description must be atleast 10 characters').isLength({min: 10}).trim().escape()];

exports.validateSignup =  [body('firstName', 'First name can not be empty').notEmpty().trim().escape(),
body('lastName', 'Last name can not be empty').notEmpty().trim().escape(),
body('email', 'Email must be valid email address.').isEmail().trim().escape().normalizeEmail(), 
body('password', 'Password must be atleast 8 characters and at most 64 characters.').isLength({min: 8, max: 64})];


exports.validateLogin =  [body('email', 'Email must be valid email address.').isEmail().trim().escape().normalizeEmail(), 
body('password', 'Password must be atleast 8 characters and at most 64 characters.').isLength({min: 8, max: 64})];

exports.validateResult = (req, res, next) => {
    let errors = validationResult(req);
    if(!errors.isEmpty()) {
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });
        return res.redirect('back');
    } else {
        return next()
    }
}