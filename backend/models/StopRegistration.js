const mongoose = require('mongoose');

const stopRegistrationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    trip_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
        required: true
    },
    station_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Station',
        required: true
    },
    route_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route'
    },
    request_type: {
        type: String,
        enum: ['board', 'exit']
    },
    status: {
        type: String,
        enum: ['pending', 'acknowledged', 'completed'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('StopRegistration', stopRegistrationSchema);
