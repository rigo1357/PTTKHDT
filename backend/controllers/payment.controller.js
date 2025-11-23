const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Trip = require('../models/Trip');
const Route = require('../models/Route');

// Get account balance
const getBalance = async (req, res) => {
    try {
        const account = await Account.findOne({ user_id: req.user.id });
        const user = await User.findById(req.user.id);

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài khoản'
            });
        }

        res.json({
            success: true,
            data: {
                balance: account.balance,
                currency: account.currency,
                full_name: user.full_name
            }
        });
    } catch (error) {
        console.error('Get balance error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy số dư'
        });
    }
};

// Top-up account
const topUp = async (req, res) => {
    const { amount } = req.body;

    try {
        // Validate amount
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Số tiền nạp không hợp lệ'
            });
        }

        const account = await Account.findOne({ user_id: req.user.id });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài khoản'
            });
        }

        const balance_before = account.balance;
        const balance_after = balance_before + parseFloat(amount);

        // Update balance
        account.balance = balance_after;
        await account.save();

        // Record transaction
        await Transaction.create({
            user_id: req.user.id,
            account_id: account._id,
            transaction_type: 'top_up',
            amount: parseFloat(amount),
            balance_before,
            balance_after,
            description: 'Nạp tiền vào tài khoản'
        });

        res.json({
            success: true,
            message: 'Nạp tiền thành công',
            data: {
                balance_before,
                balance_after,
                amount: parseFloat(amount)
            }
        });
    } catch (error) {
        console.error('Top-up error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi nạp tiền'
        });
    }
};

// NFC Tap In (board bus)
const tapIn = async (req, res) => {
    const { nfc_uid, device_uid, trip_id } = req.body;

    try {
        // Get user by NFC UID
        const user = await User.findOne({ nfc_uid });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thẻ NFC'
            });
        }

        const account = await Account.findOne({ user_id: user._id });

        // Check if user has sufficient balance
        if (account.balance < 5000) {
            return res.status(400).json({
                success: false,
                message: `Số dư không đủ. Số dư hiện tại: ${new Intl.NumberFormat('vi-VN').format(account.balance)} VND`
            });
        }

        // Get trip and route information
        const trip = await Trip.findById(trip_id).populate('route_id');

        if (!trip || trip.status !== 'active') {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy chuyến xe'
            });
        }

        // Check if user already tapped in
        const existingTapIn = await Transaction.findOne({
            user_id: user._id,
            trip_id: trip._id,
            tap_out_time: null
        }).sort({ createdAt: -1 });

        if (existingTapIn) {
            return res.status(400).json({
                success: false,
                message: 'Bạn đã quét thẻ lên xe rồi'
            });
        }

        // Create pending transaction
        await Transaction.create({
            user_id: user._id,
            account_id: account._id,
            trip_id: trip._id,
            transaction_type: 'fare',
            amount: 0,
            balance_before: account.balance,
            tap_in_time: new Date(),
            description: `Lên xe ${trip.route_id.route_name}`
        });

        // Update passenger count
        trip.passenger_count += 1;
        await trip.save();

        res.json({
            success: true,
            message: `Chào mừng ${user.full_name}!`,
            data: {
                user_name: user.full_name,
                balance: account.balance,
                route_name: trip.route_id.route_name,
                full_fare: trip.route_id.full_fare
            }
        });
    } catch (error) {
        console.error('Tap in error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi quét thẻ lên xe'
        });
    }
};

// NFC Tap Out (exit bus)
const tapOut = async (req, res) => {
    const { nfc_uid, device_uid, trip_id, station_id } = req.body;

    try {
        // Get user
        const user = await User.findOne({ nfc_uid });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thẻ NFC'
            });
        }

        const account = await Account.findOne({ user_id: user._id });

        // Get pending transaction (tap in)
        const tapInTransaction = await Transaction.findOne({
            user_id: user._id,
            trip_id: trip_id,
            tap_out_time: null
        }).sort({ createdAt: -1 });

        if (!tapInTransaction) {
            return res.status(400).json({
                success: false,
                message: 'Không tìm thấy thông tin quét thẻ lên xe'
            });
        }

        // Get trip and route
        const trip = await Trip.findById(trip_id).populate('route_id');
        const full_fare = trip.route_id.full_fare;

        // Calculate fare (simplified - default to full fare for now)
        let fare = full_fare;

        // TODO: Calculate based on distance if station info available
        // For now, use simple logic: 50% if less than half route
        const routeStations = trip.route_id.stations || [];
        if (routeStations.length > 0) {
            const halfRoute = Math.floor(routeStations.length / 2);
            // Simplified calculation
            fare = full_fare * 0.5; // Demo: always charge half
        }

        // Check balance
        if (account.balance < fare) {
            return res.status(400).json({
                success: false,
                message: `Số dư không đủ. Cần: ${new Intl.NumberFormat('vi-VN').format(fare)} VND`
            });
        }

        const balance_before = account.balance;
        const balance_after = balance_before - fare;

        // Update transaction
        tapInTransaction.tap_out_time = new Date();
        tapInTransaction.amount = fare;
        tapInTransaction.balance_after = balance_after;
        tapInTransaction.exit_station_id = station_id;
        await tapInTransaction.save();

        // Update account balance
        account.balance = balance_after;
        await account.save();

        // Update passenger count
        trip.passenger_count = Math.max(0, trip.passenger_count - 1);
        await trip.save();

        res.json({
            success: true,
            message: 'Cảm ơn bạn đã sử dụng dịch vụ!',
            data: {
                user_name: user.full_name,
                fare,
                balance_before,
                balance_after
            }
        });
    } catch (error) {
        console.error('Tap out error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi quét thẻ xuống xe'
        });
    }
};

// Get transaction history
const getTransactionHistory = async (req, res) => {
    const { limit = 50, offset = 0 } = req.query;

    try {
        const transactions = await Transaction.find({ user_id: req.user.id })
            .populate('boarding_station_id', 'station_name')
            .populate('exit_station_id', 'station_name')
            .populate({
                path: 'trip_id',
                populate: { path: 'route_id', select: 'route_name' }
            })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(offset));

        // Format response
        const formattedTransactions = transactions.map(t => {
            const obj = t.toObject();
            return {
                ...obj,
                boarding_station: obj.boarding_station_id?.station_name,
                exit_station: obj.exit_station_id?.station_name,
                route_name: obj.trip_id?.route_id?.route_name
            };
        });

        res.json({
            success: true,
            data: formattedTransactions
        });
    } catch (error) {
        console.error('Get transaction history error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy lịch sử giao dịch'
        });
    }
};

module.exports = {
    getBalance,
    topUp,
    tapIn,
    tapOut,
    getTransactionHistory
};
