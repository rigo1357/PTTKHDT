const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/database');
const User = require('../models/User');
const Account = require('../models/Account');
const Station = require('../models/Station');
const Route = require('../models/Route');
const Bus = require('../models/Bus');
const Trip = require('../models/Trip');
const Transaction = require('../models/Transaction');

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Account.deleteMany({});
        await Station.deleteMany({});
        await Route.deleteMany({});
        await Bus.deleteMany({});
        await Trip.deleteMany({});
        await Transaction.deleteMany({});

        console.log('👥 Creating users...');
        const password_hash = await bcrypt.hash('password123', 10);

        const users = await User.create([
            {
                username: 'admin',
                email: 'admin@smartbus.com',
                password_hash,
                full_name: 'System Administrator',
                phone: '0901234567',
                role: 'admin'
            },
            {
                username: 'driver1',
                email: 'driver1@smartbus.com',
                password_hash,
                full_name: 'Nguyễn Văn Tài',
                phone: '0902345678',
                role: 'driver'
            },
            {
                username: 'driver2',
                email: 'driver2@smartbus.com',
                password_hash,
                full_name: 'Trần Thị Lan',
                phone: '0903456789',
                role: 'driver'
            },
            {
                username: 'passenger1',
                email: 'passenger1@example.com',
                password_hash,
                full_name: 'Lê Minh Tuấn',
                phone: '0904567890',
                role: 'passenger',
                nfc_uid: 'NFC-0001'
            },
            {
                username: 'passenger2',
                email: 'passenger2@example.com',
                password_hash,
                full_name: 'Phạm Thu Hà',
                phone: '0905678901',
                role: 'passenger',
                nfc_uid: 'NFC-0002'
            },
            {
                username: 'passenger3',
                email: 'passenger3@example.com',
                password_hash,
                full_name: 'Hoàng Văn Nam',
                phone: '0906789012',
                role: 'passenger',
                nfc_uid: 'NFC-0003'
            }
        ]);

        const [admin, driver1, driver2, passenger1, passenger2, passenger3] = users;

        console.log('💰 Creating accounts...');
        const accounts = await Account.create([
            { user_id: passenger1._id, balance: 500000 },
            { user_id: passenger2._id, balance: 250000 },
            { user_id: passenger3._id, balance: 100000 }
        ]);

        console.log('🚏 Creating stations...');
        const stations = await Station.create([
            {
                station_code: 'ST001',
                station_name: 'Bến xe Miền Đông',
                address: '292 Đinh Bộ Lĩnh, Bình Thạnh',
                latitude: 10.8142,
                longitude: 106.7062
            },
            {
                station_code: 'ST002',
                station_name: 'Ngã tư Hàng Xanh',
                address: 'Giao lộ Đinh Bộ Lĩnh - Xô Viết Nghệ Tĩnh',
                latitude: 10.7989,
                longitude: 106.7015
            },
            {
                station_code: 'ST003',
                station_name: 'Chợ Tân Định',
                address: 'Hai Bà Trưng, Quận 1',
                latitude: 10.7883,
                longitude: 106.6918
            },
            {
                station_code: 'ST004',
                station_name: 'Nhà hát Thành phố',
                address: 'Đường Đồng Khởi, Quận 1',
                latitude: 10.7769,
                longitude: 106.7009
            },
            {
                station_code: 'ST005',
                station_name: 'Bến Thành',
                address: 'Chợ Bến Thành, Quận 1',
                latitude: 10.7726,
                longitude: 106.6980
            },
            {
                station_code: 'ST006',
                station_name: 'Công viên 23/9',
                address: 'Phạm Ngũ Lão, Quận 1',
                latitude: 10.7686,
                longitude: 106.6913
            },
            {
                station_code: 'ST007',
                station_name: 'Bến xe An Sương',
                address: 'QL1A, Hóc Môn',
                latitude: 10.8425,
                longitude: 106.6173
            },
            {
                station_code: 'ST008',
                station_name: 'Ngã tư An Sương',
                address: 'Quốc lộ 1A, Hóc Môn',
                latitude: 10.8334,
                longitude: 106.6245
            },
            {
                station_code: 'ST009',
                station_name: 'Trường Chinh',
                address: 'Đường Trường Chinh, Tân Bình',
                latitude: 10.8123,
                longitude: 106.6534
            },
            {
                station_code: 'ST010',
                station_name: 'Tân Sơn Nhất',
                address: 'Sân bay Tân Sơn Nhất',
                latitude: 10.8188,
                longitude: 106.6519
            }
        ]);

        console.log('🚌 Creating routes...');
        const routes = await Route.create([
            {
                route_number: '01',
                route_name: 'Bến xe Miền Đông - Bến Thành',
                description: 'Tuyến chính kết nối Miền Đông và Trung tâm',
                full_fare: 7000,
                total_distance: 8.5,
                stations: [
                    { station_id: stations[0]._id, station_order: 1, distance_from_start: 0.0 },
                    { station_id: stations[1]._id, station_order: 2, distance_from_start: 1.5 },
                    { station_id: stations[2]._id, station_order: 3, distance_from_start: 3.2 },
                    { station_id: stations[3]._id, station_order: 4, distance_from_start: 5.8 },
                    { station_id: stations[4]._id, station_order: 5, distance_from_start: 8.5 }
                ]
            },
            {
                route_number: '02',
                route_name: 'An Sương - Tân Sơn Nhất',
                description: 'Tuyến kết nối phía Tây với sân bay',
                full_fare: 6000,
                total_distance: 6.0,
                stations: [
                    { station_id: stations[6]._id, station_order: 1, distance_from_start: 0.0 },
                    { station_id: stations[7]._id, station_order: 2, distance_from_start: 1.2 },
                    { station_id: stations[8]._id, station_order: 3, distance_from_start: 3.5 },
                    { station_id: stations[9]._id, station_order: 4, distance_from_start: 6.0 }
                ]
            },
            {
                route_number: '03',
                route_name: 'Bến Thành - Chợ Lớn',
                description: 'Tuyến nội thành',
                full_fare: 5000,
                total_distance: 4.5,
                stations: [
                    { station_id: stations[4]._id, station_order: 1, distance_from_start: 0.0 },
                    { station_id: stations[5]._id, station_order: 2, distance_from_start: 2.0 }
                ]
            }
        ]);

        console.log('🚐 Creating buses...');
        const buses = await Bus.create([
            {
                bus_number: '101',
                license_plate: '51B-12345',
                capacity: 40,
                route_id: routes[0]._id,
                driver_id: driver1._id
            },
            {
                bus_number: '102',
                license_plate: '51B-23456',
                capacity: 40,
                route_id: routes[0]._id
            },
            {
                bus_number: '201',
                license_plate: '51C-34567',
                capacity: 35,
                route_id: routes[1]._id,
                driver_id: driver2._id
            },
            {
                bus_number: '202',
                license_plate: '51C-45678',
                capacity: 35,
                route_id: routes[1]._id
            }
        ]);

        console.log('🛣️  Creating active trips...');
        const trips = await Trip.create([
            {
                bus_id: buses[0]._id,
                route_id: routes[0]._id,
                driver_id: driver1._id,
                current_latitude: 10.8142,
                current_longitude: 106.7062,
                current_speed: 35.5,
                passenger_count: 5,
                status: 'active'
            },
            {
                bus_id: buses[1]._id,
                route_id: routes[0]._id,
                current_latitude: 10.7883,
                current_longitude: 106.6918,
                current_speed: 28.0,
                passenger_count: 12,
                status: 'active'
            },
            {
                bus_id: buses[2]._id,
                route_id: routes[1]._id,
                driver_id: driver2._id,
                current_latitude: 10.8334,
                current_longitude: 106.6245,
                current_speed: 32.0,
                passenger_count: 8,
                status: 'active'
            },
            {
                bus_id: buses[3]._id,
                route_id: routes[1]._id,
                current_latitude: 10.8188,
                current_longitude: 106.6519,
                current_speed: 0,
                passenger_count: 0,
                status: 'active'
            }
        ]);

        console.log('💳 Creating sample transactions...');
        await Transaction.create([
            {
                user_id: passenger1._id,
                account_id: accounts[0]._id,
                transaction_type: 'top_up',
                amount: 500000,
                balance_before: 0,
                balance_after: 500000,
                description: 'Nạp tiền lần đầu'
            },
            {
                user_id: passenger2._id,
                account_id: accounts[1]._id,
                transaction_type: 'top_up',
                amount: 250000,
                balance_before: 0,
                balance_after: 250000,
                description: 'Nạp tiền lần đầu'
            },
            {
                user_id: passenger3._id,
                account_id: accounts[2]._id,
                transaction_type: 'top_up',
                amount: 100000,
                balance_before: 0,
                balance_after: 100000,
                description: 'Nạp tiền lần đầu'
            }
        ]);

        console.log('✅ Database seeded successfully!');
        console.log('\n📊 Summary:');
        console.log(`- Users: ${users.length}`);
        console.log(`- Accounts: ${accounts.length}`);
        console.log(`- Stations: ${stations.length}`);
        console.log(`- Routes: ${routes.length}`);
        console.log(`- Buses: ${buses.length}`);
        console.log(`- Active Trips: ${trips.length}`);
        console.log(`- Transactions: 3`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
