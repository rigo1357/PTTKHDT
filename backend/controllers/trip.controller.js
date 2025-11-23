const Trip = require('../models/Trip');
const Route = require('../models/Route');
const Bus = require('../models/Bus');
const Station = require('../models/Station');
const StopRegistration = require('../models/StopRegistration');
const User = require('../models/User');
const moment = require('moment');

// Get all active trips
const getActiveTrips = async (req, res) => {
    try {
        const trips = await Trip.find({ status: 'active' })
            .populate('route_id', 'route_number route_name')
            .populate('bus_id', 'bus_number license_plate')
            .populate('driver_id', 'full_name')
            .sort({ start_time: -1 });

        res.json({
            success: true,
            data: trips
        });
    } catch (error) {
        console.error('Get active trips error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách chuyến đi'
        });
    }
};

// Get trips by route
const getTripsByRoute = async (req, res) => {
    const { route_id } = req.params;

    try {
        const trips = await Trip.find({ route_id, status: 'active' })
            .populate('route_id', 'route_number route_name')
            .populate('bus_id', 'bus_number')
            .populate('driver_id', 'full_name')
            .sort({ start_time: -1 });

        res.json({
            success: true,
            data: trips
        });
    } catch (error) {
        console.error('Get trips by route error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy chuyến đi theo tuyến'
        });
    }
};

// Get trip details
const getTripDetails = async (req, res) => {
    const { trip_id } = req.params;

    try {
        const trip = await Trip.findById(trip_id)
            .populate('route_id')
            .populate('bus_id', 'bus_number capacity')
            .populate('driver_id', 'full_name')
            .populate('trip_stations.station_id');

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy chuyến đi'
            });
        }

        // Get stop registrations
        const stopRegistrations = await StopRegistration.find({
            trip_id: trip._id,
            status: { $in: ['pending', 'acknowledged'] }
        })
            .populate('station_id', 'station_name station_code')
            .populate('user_id', 'full_name')
            .sort({ createdAt: 1 });

        res.json({
            success: true,
            data: {
                trip,
                stations: trip.trip_stations,
                stop_registrations: stopRegistrations
            }
        });
    } catch (error) {
        console.error('Get trip details error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy chi tiết chuyến đi'
        });
    }
};

// Update trip location
const updateTripLocation = async (req, res) => {
    const { trip_id } = req.params;
    const { latitude, longitude, speed } = req.body;

    try {
        const trip = await Trip.findById(trip_id);

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy chuyến đi'
            });
        }

        // Update location and speed
        trip.current_latitude = latitude;
        trip.current_longitude = longitude;
        trip.current_speed = speed;
        await trip.save();

        // Emit real-time update
        if (req.app.get('io')) {
            req.app.get('io').emit('trip_location_update', {
                trip_id,
                latitude,
                longitude,
                speed
            });
        }

        res.json({
            success: true,
            message: 'Cập nhật vị trí thành công'
        });
    } catch (error) {
        console.error('Update trip location error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật vị trí'
        });
    }
};

// Register stop request
const registerStopRequest = async (req, res) => {
    const { trip_id, station_id, request_type } = req.body;

    try {
        // Validate input
        if (!trip_id || !station_id || !request_type) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin yêu cầu'
            });
        }

        if (!['board', 'exit'].includes(request_type)) {
            return res.status(400).json({
                success: false,
                message: 'Loại yêu cầu không hợp lệ'
            });
        }

        // Get trip
        const trip = await Trip.findOne({ _id: trip_id, status: 'active' });

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy chuyến đi'
            });
        }

        // Create stop registration
        await StopRegistration.create({
            user_id: req.user.id,
            trip_id,
            station_id,
            route_id: trip.route_id,
            request_type,
            status: 'pending'
        });

        // Get station info
        const station = await Station.findById(station_id);

        // Emit real-time notification to driver
        if (req.app.get('io')) {
            req.app.get('io').emit('stop_request', {
                trip_id,
                station_id,
                station_name: station?.station_name,
                request_type,
                user_name: req.user.username
            });
        }

        res.json({
            success: true,
            message: `Đã đăng ký ${request_type === 'board' ? 'lên xe' : 'xuống xe'} tại ${station?.station_name}`
        });
    } catch (error) {
        console.error('Register stop request error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi đăng ký điểm dừng'
        });
    }
};

module.exports = {
    getActiveTrips,
    getTripsByRoute,
    getTripDetails,
    updateTripLocation,
    registerStopRequest
};
