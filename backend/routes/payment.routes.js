const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

// All payment routes require authentication
router.use(authMiddleware);

// Get balance
router.get('/balance', paymentController.getBalance);

// Top-up account
router.post('/top-up', requireRole('passenger'), paymentController.topUp);

// NFC tap in/out (can also be called by device/admin)
router.post('/tap-in', paymentController.tapIn);
router.post('/tap-out', paymentController.tapOut);

// Transaction history
router.get('/transactions', paymentController.getTransactionHistory);

module.exports = router;
