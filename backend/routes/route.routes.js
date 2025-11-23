const express = require('express');
const router = express.Router();
const routeController = require('../controllers/route.controller');

// Public routes (no authentication required for viewing routes)
router.get('/', routeController.getAllRoutes);
router.get('/stations', routeController.getAllStations);
router.get('/:route_id', routeController.getRouteDetails);
router.get('/station/:station_id', routeController.getRoutesByStation);

module.exports = router;
