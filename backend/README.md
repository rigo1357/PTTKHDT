# Smart Bus Backend API

RESTful API for Smart Bus system with real-time features using Socket.io.

## Features

- 🔐 Authentication with JWT
- 💳 NFC-based payment system
- 🚌 Real-time bus tracking
- 📍 Stop registration
- 💰 Balance management
- 📊 Transaction history

## Prerequisites

- Node.js >= 14.x
- PostgreSQL >= 12
- Redis (optional, for caching)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your database credentials

4. Setup database:
```bash
# Connect to PostgreSQL and create database
psql -U postgres
CREATE DATABASE smartbus;
\q

# Run schema
psql -U postgres -d smartbus -f database/schema.sql

# Seed sample data
psql -U postgres -d smartbus -f database/seed.sql
```

## Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile (protected)

### Payment
- `GET /api/payment/balance` - Get account balance (protected)
- `POST /api/payment/top-up` - Top-up account (protected)
- `POST /api/payment/tap-in` - NFC tap in when boarding
- `POST /api/payment/tap-out` - NFC tap out when exiting
- `GET /api/payment/transactions` - Get transaction history (protected)

### Routes
- `GET /api/routes` - Get all routes
- `GET /api/routes/stations` - Get all stations
- `GET /api/routes/:route_id` - Get route details
- `GET /api/routes/station/:station_id` - Get routes by station

### Trips
- `GET /api/trips/active` - Get all active trips
- `GET /api/trips/route/:route_id` - Get trips by route
- `GET /api/trips/:trip_id` - Get trip details with ETA
- `POST /api/trips/location/:trip_id` - Update trip location (driver/admin)
- `POST /api/trips/stop-request` - Register stop request (passenger)

## Sample Users

### Admin
- Username: `admin`
- Password: `password123`

### Driver
- Username: `driver1`
- Password: `password123`

### Passengers
- Username: `passenger1`, Password: `password123`, NFC: `NFC-0001`
- Username: `passenger2`, Password: `password123`, NFC: `NFC-0002`
- Username: `passenger3`, Password: `password123`, NFC: `NFC-0003`

## Socket.io Events

### Client -> Server
- `join_trip` - Join trip room for updates
- `join_station` - Join station room for updates
- `driver_location` - Send location update from driver

### Server -> Client
- `location_update` - Real-time bus location update
- `stop_request` - Stop request notification to driver
- `trip_location_update` - Trip location broadcast

## License

MIT
