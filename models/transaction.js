const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    trade: {
        type: Schema.Types.ObjectId,
        ref: 'Trade'
    },
    tradeOwner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    offer: {
        type: Schema.Types.ObjectId,
        ref: 'Trade'
    },
    offerBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);