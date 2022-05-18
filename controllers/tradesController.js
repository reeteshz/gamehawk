const model = require('../models/trade')
const User = require('../models/user');
const Onwatchitem = require('../models/onwatchitem');
const Transaction = require('../models/transaction');

exports.index = (req, res, next) => {
    model.find()
    .then(trades => {
            let platforms = trades.map( (trade) => trade.platform).filter( (trade, index, trades) => trades.indexOf(trade) == index);
            options = { year: 'numeric', month: 'numeric', day: 'numeric' };
            for (let i = 0; i < trades.length; i++) {
                trades[i].postedAt = new Date(trades[i].createdAt.getTime()).toLocaleString('en-US', options)
            }
            res.render('./trades/index', {trades, platforms});
        }
    )
    .catch(err =>
        {
            next(err)
        } );
};

exports.new = (req, res) => {
    res.render('trades/newTrade');
};

exports.create = (req, res, next) => {
    let trade = new model(req.body);
    trade.postedBy = req.session.user;
    trade.save()
    .then((trade) => {
        res.redirect('/trades');
    })
    .catch(err => {
        if (err.name === 'ValidationError') {
            err.status = 400;
            req.flash('error', err.message)
            res.redirect('back') 
        }
        next(err);
    });
};

exports.details = (req, res, next) => {
    let id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid trade ID');
        err.status = 400;
        return next(err);
    }
    model.findById(id).populate('postedBy', 'firstName lastName')
    .then(trade => {
        if (trade) {
            let onWatch = false
            let userId = req.session.user;
            if (userId) {
                Onwatchitem.findOne({ onWatchedBy: userId, trade: id })
                .then(item => {
                    onWatch = item ? true : false
                    return res.render('./trades/details', {
                        trade,
                        onWatch
                    });
                })
                .catch(err => next(err));
            } else {
                return res.render('./trades/details', {
                    trade,
                    onWatch
                });
            }
        } else {
            let err = new Error('Cannot find a trade with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err => next(err));
};

exports.edit = (req, res, next) => {
    let id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid trade ID');
        err.status = 400;
        return next(err);
    }
    model.findById(id)
    .then(trade => {
        if (trade) {
            res.render('./trades/edit', {
                trade
            });
        } else {
            let err = new Error('Cannot find a trade with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err => next(err));
};

exports.update = (req, res, next) => {
    let trade = req.body;
    let id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid Story ID');
        err.status = 400;
        return next(err);
    }
    model.findByIdAndUpdate(id, trade, {
        useFindAndModify: false,
        runValidators: true
    })
    .then(trade => {
        if (trade) {
            res.redirect(`/trades/${id}`);
        } else {
            let err = new Error('Cannot find a trade with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err => {
        if (err.name === 'ValidationError') {
            err.status = 400;
            req.flash('error', err.message)
            res.redirect('back') 
        }
    });
};

exports.delete = (req, res, next) => {
    let id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid trade ID');
        err.status = 400;
        return next(err);
    }
    model.findByIdAndDelete(id, {
        useFindAndModify: false
    })
    .then(result => {
        if (result) {
            Promise.all([Transaction.deleteMany({trade: result._id}), 
                Transaction.deleteMany({offer: result._id}), Onwatchitem.deleteMany({trade: result._id})]) 
            res.redirect('/trades');
        } else {
            let err = new Error('Cannot find a trade with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err => next(err));
};


exports.offer = (req, res, next) => {
    let offerBy = req.session.user;
    let tradeID = req.params.id;
    let tradeOwner = null
    if (!tradeID.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid trade ID');
        err.status = 400;
        return next(err);
    } else {
        model.findById(tradeID).then(trade => {
            tradeOwner = trade.postedBy
        })
    }
    if(offerBy) {
        Promise.all([User.findById(offerBy), model.find({postedBy: offerBy})])
        .then(results=> {
            const [user, trades] = results
            options = { year: 'numeric', month: 'numeric', day: 'numeric' };
            for (let i = 0; i < trades.length; i++) {
                trades[i].postedAt = new Date(trades[i].createdAt.getTime()).toLocaleString('en-US', options)
            }
            res.render('./trades/tradeOffers', {tradeID, tradeOwner, offerBy, trades})
        })
        .catch(err=>next(err))
    } else {
        res.redirect('/user/login')
    }
};

exports.makeoffer = (req, res, next) => {
    let transaction = new Transaction(req.body);
    transaction.status = 0
    transaction.save()
    .then(() => {
        Promise.all([model.findOneAndUpdate({_id: req.body.trade}, {available: 1}), 
            model.findOneAndUpdate({_id: req.body.offer}, {available: 1})])
            .then(result => {
                req.flash('success', 'Trade offered successfully.')
                res.redirect('/trades');
            })
            .catch(err=>next(err))
    })
    .catch(err => {
        if (err.name === 'MongoServerError') {
            err.status = 400;
            req.flash('error', 'There is some problem in making trade offer.')
            res.redirect(`/trades/${req.body.trade}`) 
        }
        next(err);
    });
};

exports.accept = (req, res, next) => {
    let tradeId = req.params.id;
    Transaction.findOneAndUpdate({_id: tradeId}, {status: true})
    .then(result =>{
        if (result) {
            Promise.all([model.findOneAndUpdate({_id: result.trade}, {available: 2}), 
                model.findOneAndUpdate({_id: result.offer}, {available: 2})])
            req.flash('success', 'Trade accepted')
            res.redirect('/user/profile');
        } else {
            req.flash('error', 'Failed to accept the trade')
        }
    })
    .catch(err=>next(err))
}

exports.cancel = (req, res, next) => {
    transactionId = req.params.id;
    Transaction.findOneAndDelete({ _id:  transactionId})
    .then(result =>{
        if (result) {
            Promise.all([model.findOneAndUpdate({_id: result.trade}, {available: 0}), 
                model.findOneAndUpdate({_id: result.offer}, {available: 0})])
            req.flash('success', 'Trade offer has been cancelled successfully')
            res.redirect('/user/profile');
        } else {
            req.flash('error', 'Failed to cancel the trade')
        }
    })
    .catch(err=>next(err))
}