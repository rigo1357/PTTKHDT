-- Smart Bus Sample Data

-- Insert sample users
-- Password for all users: 'password123' (hashed with bcrypt)
-- Note: In production, use proper password hashing
INSERT INTO users (username, email, password_hash, full_name, phone, role, nfc_uid) VALUES
('admin', 'admin@smartbus.com', '$2a$10$rR5WqJ9JLzXZ3YH9v/8m5eL4OQNl0LPJ5xD0yGmKOY3xJ6bVz7YKm', 'System Administrator', '0901234567', 'admin', NULL),
('driver1', 'driver1@smartbus.com', '$2a$10$rR5WqJ9JLzXZ3YH9v/8m5eL4OQNl0LPJ5xD0yGmKOY3xJ6bVz7YKm', 'Nguyễn Văn Tài', '0902345678', 'driver', NULL),
('driver2', 'driver2@smartbus.com', '$2a$10$rR5WqJ9JLzXZ3YH9v/8m5eL4OQNl0LPJ5xD0yGmKOY3xJ6bVz7YKm', 'Trần Thị Lan', '0903456789', 'driver', NULL),
('passenger1', 'passenger1@example.com', '$2a$10$rR5WqJ9JLzXZ3YH9v/8m5eL4OQNl0LPJ5xD0yGmKOY3xJ6bVz7YKm', 'Lê Minh Tuấn', '0904567890', 'passenger', 'NFC-0001'),
('passenger2', 'passenger2@example.com', '$2a$10$rR5WqJ9JLzXZ3YH9v/8m5eL4OQNl0LPJ5xD0yGmKOY3xJ6bVz7YKm', 'Phạm Thu Hà', '0905678901', 'passenger', 'NFC-0002'),
('passenger3', 'passenger3@example.com', '$2a$10$rR5WqJ9JLzXZ3YH9v/8m5eL4OQNl0LPJ5xD0yGmKOY3xJ6bVz7YKm', 'Hoàng Văn Nam', '0906789012', 'passenger', 'NFC-0003');

-- Insert accounts for passengers
INSERT INTO accounts (user_id, balance) VALUES
(4, 500000.00), -- passenger1
(5, 250000.00), -- passenger2
(6, 100000.00); -- passenger3

-- Insert stations
INSERT INTO stations (station_code, station_name, address, latitude, longitude) VALUES
('ST001', 'Bến xe Miền Đông', '292 Đinh Bộ Lĩnh, Bình Thạnh', 10.8142, 106.7062),
('ST002', 'Ngã tư Hàng Xanh', 'Giao lộ Đinh Bộ Lĩnh - Xô Viết Nghệ Tĩnh', 10.7989, 106.7015),
('ST003', 'Chợ Tân Định', 'Hai Bà Trưng, Quận 1', 10.7883, 106.6918),
('ST004', 'Nhà hát Thành phố', 'Đường Đồng Khởi, Quận 1', 10.7769, 106.7009),
('ST005', 'Bến Thành', 'Chợ Bến Thành, Quận 1', 10.7726, 106.6980),
('ST006', 'Công viên 23/9', 'Phạm Ngũ Lão, Quận 1', 10.7686, 106.6913),
('ST007', 'Bến xe An Sương', 'QL1A, Hóc Môn', 10.8425, 106.6173),
('ST008', 'Ngã tư An Sương', 'Quốc lộ 1A, Hóc Môn', 10.8334, 106.6245),
('ST009', 'Trường Chinh', 'Đường Trường Chinh, Tân Bình', 10.8123, 106.6534),
('ST010', 'Tân Sơn Nhất', 'Sân bay Tân Sơn Nhất', 10.8188, 106.6519);

-- Insert routes
INSERT INTO routes (route_number, route_name, description, full_fare, total_distance) VALUES
('01', 'Bến xe Miền Đông - Bến Thành', 'Tuyến chính kết nối Miền Đông và Trung tâm', 7000.00, 8.5),
('02', 'An Sương - Tân Sơn Nhất', 'Tuyến kết nối phía Tây với sân bay', 6000.00, 6.0),
('03', 'Bến Thành - Chợ Lớn', 'Tuyến nội thành', 5000.00, 4.5);

-- Insert route-station mappings for Route 01
INSERT INTO route_stations (route_id, station_id, station_order, distance_from_start) VALUES
(1, 1, 1, 0.0),    -- Bến xe Miền Đông
(1, 2, 2, 1.5),    -- Ngã tư Hàng Xanh
(1, 3, 3, 3.2),    -- Chợ Tân Định
(1, 4, 4, 5.8),    -- Nhà hát Thành phố
(1, 5, 5, 8.5);    -- Bến Thành

-- Insert route-station mappings for Route 02
INSERT INTO route_stations (route_id, station_id, station_order, distance_from_start) VALUES
(2, 7, 1, 0.0),    -- Bến xe An Sương
(2, 8, 2, 1.2),    -- Ngã tư An Sương
(2, 9, 3, 3.5),    -- Trường Chinh
(2, 10, 4, 6.0);   -- Tân Sơn Nhất

-- Insert buses
INSERT INTO buses (bus_number, license_plate, capacity, route_id, driver_id) VALUES
('101', '51B-12345', 40, 1, 2),
('102', '51B-23456', 40, 1, NULL),
('201', '51C-34567', 35, 2, 3),
('202', '51C-45678', 35, 2, NULL);

-- Insert devices
INSERT INTO devices (device_uid, device_type, bus_id, station_id, status) VALUES
('NFC-DOOR-101-FRONT', 'nfc_door', 1, NULL, 'active'),
('NFC-DOOR-101-BACK', 'nfc_door', 1, NULL, 'active'),
('GPS-101', 'gps_tracker', 1, NULL, 'active'),
('DRIVER-TABLET-101', 'driver_tablet', 1, NULL, 'active'),
('STATION-DISPLAY-001', 'station_display', NULL, 1, 'active'),
('STATION-DISPLAY-005', 'station_display', NULL, 5, 'active'),
('NFC-DOOR-201-FRONT', 'nfc_door', 3, NULL, 'active'),
('NFC-DOOR-201-BACK', 'nfc_door', 3, NULL, 'active');

-- Insert active trip for demonstration
INSERT INTO trips (bus_id, route_id, driver_id, current_latitude, current_longitude, current_speed, passenger_count, status) VALUES
(1, 1, 2, 10.8142, 106.7062, 35.5, 5, 'active');

-- Insert sample transactions
INSERT INTO transactions (user_id, account_id, transaction_type, amount, balance_before, balance_after, description) VALUES
(4, 1, 'top_up', 500000.00, 0.00, 500000.00, 'Nạp tiền lần đầu'),
(5, 2, 'top_up', 250000.00, 0.00, 250000.00, 'Nạp tiền lần đầu'),
(6, 3, 'top_up', 100000.00, 0.00, 100000.00, 'Nạp tiền lần đầu');
