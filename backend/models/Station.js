const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
    station_code: {
        type: String,
        required: true,
        unique: true
    },
    station_name: {
        type: String,
        required: true
    },
    address: String,
    latitude: Number,
    longitude: Number
}, {
    timestamps: true
});

module.exports = mongoose.model('Station', stationSchema);
