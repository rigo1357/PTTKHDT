-- Smart Bus Database Schema

-- Drop existing tables
DROP TABLE IF EXISTS stop_registrations CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS trip_stations CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS devices CASCADE;
DROP TABLE IF EXISTS route_stations CASCADE;
DROP TABLE IF EXISTS stations CASCADE;
DROP TABLE IF EXISTS routes CASCADE;
DROP TABLE IF EXISTS buses CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (passengers, drivers, admins)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK (role IN ('passenger', 'driver', 'admin')),
    nfc_uid VARCHAR(50) UNIQUE, -- NFC card/phone UID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Accounts table (for payment/balance management)
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'VND',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Routes table
CREATE TABLE routes (
    id SERIAL PRIMARY KEY,
    route_number VARCHAR(20) UNIQUE NOT NULL,
    route_name VARCHAR(100) NOT NULL,
    description TEXT,
    full_fare DECIMAL(10, 2) NOT NULL,
    total_distance DECIMAL(10, 2), -- in kilometers
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stations table
CREATE TABLE stations (
    id SERIAL PRIMARY KEY,
    station_code VARCHAR(20) UNIQUE NOT NULL,
    station_name VARCHAR(100) NOT NULL,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Route-Station mapping (with order)
CREATE TABLE route_stations (
    id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES routes(id) ON DELETE CASCADE,
    station_id INTEGER REFERENCES stations(id) ON DELETE CASCADE,
    station_order INTEGER NOT NULL,
    distance_from_start DECIMAL(10, 2), -- in kilometers
    UNIQUE(route_id, station_id),
    UNIQUE(route_id, station_order)
);

-- Buses table
CREATE TABLE buses (
    id SERIAL PRIMARY KEY,
    bus_number VARCHAR(20) UNIQUE NOT NULL,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    capacity INTEGER NOT NULL,
    route_id INTEGER REFERENCES routes(id),
    driver_id INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trips table (active bus trips)
CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    bus_id INTEGER REFERENCES buses(id) ON DELETE CASCADE,
    route_id INTEGER REFERENCES routes(id) ON DELETE CASCADE,
    driver_id INTEGER REFERENCES users(id),
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    current_speed DECIMAL(6, 2), -- km/h
    passenger_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trip-Station tracking (for ETA calculation)
CREATE TABLE trip_stations (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    station_id INTEGER REFERENCES stations(id),
    station_order INTEGER NOT NULL,
    estimated_arrival TIMESTAMP,
    actual_arrival TIMESTAMP,
    passed BOOLEAN DEFAULT FALSE
);

-- Transactions table (payment history)
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
    trip_id INTEGER,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('top_up', 'fare', 'refund', 'penalty')),
    amount DECIMAL(10, 2) NOT NULL,
    balance_before DECIMAL(10, 2),
    balance_after DECIMAL(10, 2),
    boarding_station_id INTEGER REFERENCES stations(id),
    exit_station_id INTEGER REFERENCES stations(id),
    tap_in_time TIMESTAMP,
    tap_out_time TIMESTAMP,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stop Registrations (passenger requests to stop)
CREATE TABLE stop_registrations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    station_id INTEGER REFERENCES stations(id),
    route_id INTEGER REFERENCES routes(id),
    request_type VARCHAR(20) CHECK (request_type IN ('board', 'exit')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Devices table (NFC readers, station displays, GPS devices)
CREATE TABLE devices (
    id SERIAL PRIMARY KEY,
    device_uid VARCHAR(100) UNIQUE NOT NULL,
    device_type VARCHAR(30) NOT NULL CHECK (device_type IN ('nfc_door', 'station_display', 'gps_tracker', 'driver_tablet')),
    bus_id INTEGER REFERENCES buses(id),
    station_id INTEGER REFERENCES stations(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    last_heartbeat TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_nfc_uid ON users(nfc_uid);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_trip_id ON transactions(trip_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_bus_id ON trips(bus_id);
CREATE INDEX idx_stop_registrations_trip_id ON stop_registrations(trip_id);
CREATE INDEX idx_stop_registrations_status ON stop_registrations(status);
CREATE INDEX idx_route_stations_route_id ON route_stations(route_id);
