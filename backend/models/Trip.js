const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    bus_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bus',
        required: true
    },
    route_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route',
        required: true
    },
    driver_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    start_time: {
        type: Date,
        default: Date.now
    },
    end_time: Date,
    current_latitude: Number,
    current_longitude: Number,
    current_speed: Number,
    passenger_count: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
    },
    trip_stations: [{
        station_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Station'
        },
        station_order: Number,
        estimated_arrival: Date,
        actual_arrival: Date,
        passed: {
            type: Boolean,
            default: false
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Trip', tripSchema);
