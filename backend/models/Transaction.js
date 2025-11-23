const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    account_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    trip_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip'
    },
    transaction_type: {
        type: String,
        enum: ['top_up', 'fare', 'refund', 'penalty'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    balance_before: Number,
    balance_after: Number,
    boarding_station_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Station'
    },
    exit_station_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Station'
    },
    tap_in_time: Date,
    tap_out_time: Date,
    description: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
