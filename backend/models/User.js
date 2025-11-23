const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password_hash: {
        type: String,
        required: true
    },
    full_name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: ['passenger', 'driver', 'admin'],
        required: true
    },
    nfc_uid: {
        type: String,
        unique: true,
        sparse: true
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
