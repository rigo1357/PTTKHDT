const express = require('express');
const router = express.Router();
const tripController = require('../controllers/trip.controller');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

// Public routes
router.get('/active', tripController.getActiveTrips);
router.get('/route/:route_id', tripController.getTripsByRoute);
router.get('/:trip_id', tripController.getTripDetails);

// Protected routes
router.post('/location/:trip_id', authMiddleware, requireRole('driver', 'admin'), tripController.updateTripLocation);
router.post('/stop-request', authMiddleware, requireRole('passenger'), tripController.registerStopRequest);

module.exports = router;
