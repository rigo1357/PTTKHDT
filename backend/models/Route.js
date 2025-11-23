const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
    route_number: {
        type: String,
        required: true,
        unique: true
    },
    route_name: {
        type: String,
        required: true
    },
    description: String,
    full_fare: {
        type: Number,
        required: true
    },
    total_distance: Number,
    is_active: {
        type: Boolean,
        default: true
    },
    stations: [{
        station_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Station'
        },
        station_order: Number,
        distance_from_start: Number
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Route', routeSchema);
