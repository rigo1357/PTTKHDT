const Route = require('../models/Route');
const Station = require('../models/Station');
const Bus = require('../models/Bus');

// Get all routes
const getAllRoutes = async (req, res) => {
    try {
        const routes = await Route.find({ is_active: true });

        // Add station count and bus count
        const routesWithCounts = await Promise.all(routes.map(async (route) => {
            const busCount = await Bus.countDocuments({ route_id: route._id, is_active: true });
            const routeObj = route.toObject();
            return {
                ...routeObj,
                station_count: route.stations ? route.stations.length : 0,
                bus_count: busCount
            };
        }));

        res.json({
            success: true,
            data: routesWithCounts
        });
    } catch (error) {
        console.error('Get all routes error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách tuyến'
        });
    }
};

// Get routes by station
const getRoutesByStation = async (req, res) => {
    const { station_id } = req.params;

    try {
        const routes = await Route.find({
            'stations.station_id': station_id,
            is_active: true
        });

        res.json({
            success: true,
            data: routes
        });
    } catch (error) {
        console.error('Get routes by station error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy tuyến theo trạm'
        });
    }
};

// Get route details with stations
const getRouteDetails = async (req, res) => {
    const { route_id } = req.params;

    try {
        const route = await Route.findOne({ _id: route_id, is_active: true })
            .populate('stations.station_id');

        if (!route) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tuyến xe'
            });
        }

        // Get buses on this route
        const buses = await Bus.find({ route_id: route._id, is_active: true })
            .populate('driver_id', 'full_name');

        res.json({
            success: true,
            data: {
                route,
                stations: route.stations,
                buses
            }
        });
    } catch (error) {
        console.error('Get route details error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy chi tiết tuyến'
        });
    }
};

// Get all stations
const getAllStations = async (req, res) => {
    try {
        const stations = await Station.find();

        // Add route count for each station
        const stationsWithCounts = await Promise.all(stations.map(async (station) => {
            const routeCount = await Route.countDocuments({
                'stations.station_id': station._id
            });
            const stationObj = station.toObject();
            return {
                ...stationObj,
                route_count: routeCount
            };
        }));

        res.json({
            success: true,
            data: stationsWithCounts
        });
    } catch (error) {
        console.error('Get all stations error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách trạm'
        });
    }
};

module.exports = {
    getAllRoutes,
    getRoutesByStation,
    getRouteDetails,
    getAllStations
};
