const User = require('../models/user');
const model = require('../models/trade')
const Onwatchitem = require('../models/onwatchitem');
const Transaction = require('../models/transaction');

exports.login = (req, res) => {
    res.render('./user/login');
};

exports.validatelogin = (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    User.findOne({email: email})
    .then(user=>{
        if(user) {
            user.comparePassword(password)
            .then(result => {
                if(result) {
                    req.session.user = user._id;
                    req.flash('success', 'Welcome, ' + user.firstName + '. You have successfully logged in.')
                    res.redirect('/user/profile');
                } else {
                    req.flash('error', 'Invalid Credentials')
                    res.redirect('/user/login')
                }
            })
        } else {
            req.flash('error', 'Wrong email address')
            res.redirect('/user/login')
        }
    })
    .catch(err=>next(err));
};

exports.signup = (req, res) => {
    res.render('./user/signup');
};

exports.newuser = (req, res, next) => {
    let user = new User(req.body);
    user.save()
    .then(() => {
        req.flash('success', 'You have successfully signed up')
        res.redirect('/user/login');
    })
    .catch(err => {
        if (err.name === 'MongoServerError') {
            err.status = 400;
            req.flash('error', 'Email ID already exists')
            res.redirect('back') 
        }
        next(err);
    });
};

exports.logout = (req, res) => {
    req.session.destroy(err=>{
        if(err)
            return next(err)
        else
            res.redirect('/')
    });
};

exports.profile = (req, res) => {
    let id = req.session.user;
    if(id) {
        Promise.all([User.findById(id), 
            model.find({postedBy: id}), 
            Onwatchitem.find({onWatchedBy: id}).populate('trade'),
            Transaction.find({tradeOwner: id, status: false}).populate('trade').populate('tradeOwner', 'firstName lastName').populate('offer').populate('offerBy', 'firstName lastName'),
            Transaction.find({offerBy: id, status: false}).populate('trade').populate('tradeOwner', 'firstName lastName').populate('offer').populate('offerBy', 'firstName lastName'),
            Transaction.find({ $or: [{tradeOwner: id, status: true}, {offerBy: id, status: true}]}).populate('trade').populate('tradeOwner', 'firstName lastName').populate('offer').populate('offerBy', 'firstName lastName')

        ])
        .then(results=> {
            const [user, trades, watchlist,  offersReceived, OffersGiven, archive] = results
            options = { year: 'numeric', month: 'numeric', day: 'numeric' };
            for (let i = 0; i < trades.length; i++) {
                trades[i].postedAt = new Date(trades[i].createdAt.getTime()).toLocaleString('en-US', options)
            }
            for (let i = 0; i < watchlist.length; i++) {
                watchlist[i] = watchlist[i].trade
                watchlist[i].postedAt = new Date(watchlist[i].createdAt.getTime()).toLocaleString('en-US', options)
            }
            res.render('./user/profile', {user, trades, watchlist, offersReceived, OffersGiven, archive})
        })
        .catch(err=>next(err))
    } else {
        res.redirect('/user/login')
    }
};


exports.watch = (req, res) => {
    let userId = req.session.user;
    let tradeId = req.params.id;
    Onwatchitem.findOne({ onWatchedBy: userId, trade: tradeId })
    .then(result=>{
        if(!result) {
            let onWatchItem = new Onwatchitem({ onWatchedBy: userId, trade: tradeId });
            onWatchItem.save()
            .then((entry) => {
                req.flash('success', 'Trade added to watchlist')
                res.redirect(`/trades/${tradeId}`);
            })
            .catch(err => {
                req.flash('error', 'Failed to add trade to watchlist')
                next(err);
            });
        } else {
            req.flash('success', 'Trade has been already added to watchlist')
            res.redirect(`/trades/${tradeId}`);
        }
    })
    .catch(err => {
        if (err.name === 'ValidationError') {
            err.status = 400;
            req.flash('error', err.message)
            res.redirect('back') 
        }
        next(err);
    });
}

exports.unwatch = (req, res) => {
    console.log(req)
    let userId = req.session.user;
    let tradeId = req.params.id;
    Onwatchitem.findOneAndDelete({ onWatchedBy: userId, trade: tradeId })
    .then(result=> {
        req.flash('success', 'Trade removed from watchlist')
        res.redirect('back');
    })
    .catch(err => {
        if (err.name === 'ValidationError') {
            err.status = 400;
            req.flash('error', err.message)
            res.redirect('back') 
        }
    })
}