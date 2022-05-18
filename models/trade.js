const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tradeSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Title is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        minLength: [20, 'The description should have atleast 20 characters']
    },
    platform: {
        type: String,
        required: [true, 'Platform is required']
    },
    genre: {
        type: String,
        required: [true, 'Genre is required']
    },
    release: {
        type: String,
        required: [true, 'Release is required']
    },
    postedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    available: {
        type: Number,
        enum : [0, 1, 2],
        default: 0
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Trade', tradeSchema);