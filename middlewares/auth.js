const trade = require('../models/trade');
// check if user is a guest
exports.isGuest = (req, res, next) => {
    if(!req.session.user) {
        return next();
    } else {
        req.flash('error', 'You are logged in already');
        return res.redirect('/user/profile');
    }
}

// check if user is logged in
exports.isLoggedIn = (req, res, next) => {
    if(req.session.user) {
        return next();
    } else {
        req.flash('error', 'You need to logged in first!');
        return res.redirect('/user/login');
    }
}

// check if trade is posted by the current user
exports.isPostedBy = (req, res, next) => {
    let id = req.params.id
    trade.findById(id)
    .then(trade=>{
        if(trade) {
            if(trade.postedBy == req.session.user) {
                return next();
            } else {
                let err = new Error('Unauthorised to access the resources');
                err.status = 401;
                return next(err);
            }
        } else {
            return next()
        }
    })
    .catch(err=>{
        return next(err)
    })
}