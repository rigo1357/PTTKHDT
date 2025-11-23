const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
    bus_number: {
        type: String,
        required: true,
        unique: true
    },
    license_plate: {
        type: String,
        required: true,
        unique: true
    },
    capacity: {
        type: Number,
        required: true
    },
    route_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route'
    },
    driver_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Bus', busSchema);
