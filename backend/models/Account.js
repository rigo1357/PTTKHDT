const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        default: 'VND'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Account', accountSchema);
