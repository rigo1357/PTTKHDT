const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/database');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to controllers
app.set('io', io);

// Routes
const authRoutes = require('./routes/auth.routes');
const paymentRoutes = require('./routes/payment.routes');
const routeRoutes = require('./routes/route.routes');
const tripRoutes = require('./routes/trip.routes');

app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/trips', tripRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Smart Bus API is running',
        timestamp: new Date().toISOString(),
        database: 'MongoDB'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Smart Bus API',
        version: '1.0.0',
        database: 'MongoDB',
        endpoints: {
            auth: '/api/auth',
            payment: '/api/payment',
            routes: '/api/routes',
            trips: '/api/trips'
        }
    });
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    // Join trip room
    socket.on('join_trip', (tripId) => {
        socket.join(`trip_${tripId}`);
        console.log(`Client ${socket.id} joined trip ${tripId}`);
    });

    // Join station room
    socket.on('join_station', (stationId) => {
        socket.join(`station_${stationId}`);
        console.log(`Client ${socket.id} joined station ${stationId}`);
    });

    // Driver location update
    socket.on('driver_location', (data) => {
        io.to(`trip_${data.trip_id}`).emit('location_update', data);
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('🚌 ===================================');
    console.log(`🚌 Smart Bus API Server`);
    console.log(`🚌 Running on port ${PORT}`);
    console.log(`🚌 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🚌 Database: MongoDB`);
    console.log('🚌 ===================================');
    console.log(`📡 API: http://localhost:${PORT}`);
    console.log(`🔌 Socket.io ready for real-time connections`);
    console.log('🚌 ===================================');
});

module.exports = { app, server, io };
