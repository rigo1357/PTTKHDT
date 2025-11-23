const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne({ username: 'passenger1' });
        console.log('User found:', user ? user.username : 'NOT FOUND');

        if (user) {
            console.log('User role:', user.role);
            console.log('User email:', user.email);
            console.log('Has password_hash:', !!user.password_hash);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

test();
