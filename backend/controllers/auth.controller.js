const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Account = require('../models/Account');
require('dotenv').config();

// Register new user
const register = async (req, res) => {
    const { username, email, password, full_name, phone, role = 'passenger', nfc_uid } = req.body;

    try {
        // Validate required fields
        if (!username || !email || !password || !full_name) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Tên đăng nhập hoặc email đã tồn tại'
            });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            username,
            email,
            password_hash,
            full_name,
            phone,
            role,
            nfc_uid
        });

        // Create account for passenger
        if (role === 'passenger') {
            await Account.create({
                user_id: user._id,
                balance: 0
            });
        }

        console.log(user._id);

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password_hash;

        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công',
            data: {
                user: userResponse,
                token
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi đăng ký'
        });
    }
};

// Login
const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập tên đăng nhập và mật khẩu'
            });
        }

        // Find user
        const user = await User.findOne({ username, is_active: true });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Tên đăng nhập hoặc mật khẩu không đúng'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Tên đăng nhập hoặc mật khẩu không đúng'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password_hash;

        res.json({
            success: true,
            message: 'Đăng nhập thành công',
            data: {
                user: userResponse,
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi đăng nhập'
        });
    }
};

// Get current user profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password_hash');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Get account balance if user is passenger
        let account = null;
        if (user.role === 'passenger') {
            account = await Account.findOne({ user_id: user._id });
        }

        const profile = user.toObject();
        if (account) {
            profile.balance = account.balance;
            profile.currency = account.currency;
        }

        res.json({
            success: true,
            data: profile
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thông tin người dùng'
        });
    }
};

module.exports = {
    register,
    login,
    getProfile
};
