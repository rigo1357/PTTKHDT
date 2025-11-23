# 🚀 Hướng Dẫn Chạy Hệ Thống Smart Bus (MongoDB)

## 📋 Yêu Cầu

- Node.js >= 14.x
- MongoDB Atlas account (hoặc MongoDB local)
- npm hoặc yarn

## 🔧 Cài Đặt

### Bước 1: Cài Node.js Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Passenger App
```bash
cd passenger-app
npm install
```

### Bước 2: Cấu Hình MongoDB

1. Mở file `backend/.env`
2. Cập nhật password trong MongoDB URI:

```env
MONGODB_URI=mongodb+srv://cutaiden_db_user:YOUR_PASSWORD@pttk.jss9bxz.mongodb.net/smartbus?retryWrites=true&w=majority&appName=PTTK
```

Thay `YOUR_PASSWORD` bằng mật khẩu thực tế của database.

### Bước 3: Seed Database

Chạy script để tạo dữ liệu mẫu:

```bash
cd backend
npm run db:seed
```

Kết quả mong đợi:
```
✅ MongoDB Connected
🗑️  Clearing existing data...
👥 Creating users...
💰 Creating accounts...
🚏 Creating stations...
🚌 Creating routes...
🚐 Creating buses...
🛣️  Creating active trip...
💳 Creating sample transactions...
✅ Database seeded successfully!

📊 Summary:
- Users: 6
- Accounts: 3
- Stations: 10
- Routes: 3
- Buses: 4
- Active Trips: 1
- Transactions: 3
```

### Bước 4: Chạy Backend Server

```bash
cd backend
npm run dev
```

Kết quả mong đợi:
```
🚌 ===================================
🚌 Smart Bus API Server
🚌 Running on port 3000
🚌 Environment: development
🚌 Database: MongoDB
🚌 ===================================
✅ MongoDB Connected: pttk.jss9bxz.mongodb.net
📊 Database: smartbus
📡 API: http://localhost:3000
🔌 Socket.io ready
🚌 ===================================
```

### Bước 5: Chạy Passenger App

Mở terminal mới:

```bash
cd passenger-app
npm run dev
```

App sẽ mở tại: `http://localhost:5173`

### Bước 6: Mở Driver Interface

Mở file `driver-interface/index.html` trên trình duyệt.

## 👤 Tài Khoản Mẫu

### Hành Khách
- **Username**: `passenger1` | **Password**: `password123` | **NFC**: `NFC-0001` | **Số dư**: 500,000 VND
- **Username**: `passenger2` | **Password**: `password123` | **NFC**: `NFC-0002` | **Số dư**: 250,000 VND
- **Username**: `passenger3` | **Password**: `password123` | **NFC**: `NFC-0003` | **Số dư**: 100,000 VND

### Tài Xế
- **Username**: `driver1` | **Password**: `password123`
- **Username**: `driver2` | **Password**: `password123`

### Admin
- **Username**: `admin` | **Password**: `password123`

## 🧪 Test Chức Năng

### 1. Test Đăng Nhập và Xem Tuyến
1. Mở Passenger App: http://localhost:5173
2. Đăng nhập với `passenger1` / `password123`
3. Xem tab **Tuyến xe** - Sẽ hiển thị 3 tuyến
4. Xem tab **Chuyến đi** - Sẽ thấy 1 chuyến đang hoạt động

### 2. Test Nạp Tiền
1. Vào tab **Tài khoản**
2. Nhập số tiền: `100000`
3. Click **Nạp tiền**
4. Kiểm tra số dư tăng lên
5. Xem lịch sử giao dịch có record mới

### 3. Test Quét Thẻ NFC
1. Vào tab **Quét thẻ**
2. Chọn chuyến xe trong dropdown (Tuyến 01 - Xe 101)
3. Click **Quét lên xe** ✅
   - Thông báo: "Chào mừng Lê Minh Tuấn!"
4. Đợi vài giây
5. Click **Quét xuống xe** ❌
   - Thông báo: "Cảm ơn bạn!"
   - Số tiền bị trừ: 3,500 VND (nửa giá)
6. Kiểm tra tab **Tài khoản** → Lịch sử có giao dịch mới

### 4. Test Driver Interface
1. Mở `driver-interface/index.html`
2. Đăng nhập với `driver1` / `password123`
3. Xem Dashboard:
   - Số hành khách hiện tại
   - Tốc độ xe
   - Trạm kế tiếp

## 📊 Cấu Trúc Database MongoDB

### Collections
- `users` - Người dùng
- `accounts` - Tài khoản tiền
- `routes` - Tuyến xe (có embedded stations array)
- `stations` - Trạm dừng
- `buses` - Xe buýt
- `trips` - Chuyến đi (có embedded trip_stations)
- `transactions` - Giao dịch
- `stopregistrations` - Yêu cầu dừng

## 🔍 API Endpoints

### Health Check
```bash
GET http://localhost:3000/api/health
```

### Authentication
```bash
POST http://localhost:3000/api/auth/login
{
  "username": "passenger1",
  "password": "password123"
}
```

### Get Routes
```bash
GET http://localhost:3000/api/routes
```

### Get Active Trips
```bash
GET http://localhost:3000/api/trips/active
```

## ❌ Troubleshooting

### Lỗi: "MongoServerError: Authentication failed"
**Giải  pháp**: Kiểm tra lại password trong `.env` file

### Lỗi: "Connection refused"
**Giải pháp**: 
1. Kiểm tra MongoDB Atlas có allow IP của bạn chưa
2. Hoặc set IP Access List thành `0.0.0.0/0` (cho phép all IPs)

### Lỗi: "Cannot find module 'mongoose'"
**Giải pháp**: Chạy lại `npm install` trong thư mục backend

### App không load được routes/trips
**Giải pháp**: Chạy lại seed script: `npm run db:seed`

## 🎯 Các Tính Năng Đã Hoàn Thành

✅ Backend API với MongoDB/Mongoose  
✅ Authentication với JWT  
✅ Payment với NFC simulation  
✅ Tính cước tự động (nửa giá/toàn giá)  
✅ Real-time updates với Socket.io  
✅ Passenger web app  
✅ Driver interface  
✅ Transaction history  
✅ Seed data script  

## 📝 Notes

- Database sử dụng **MongoDB Atlas** (cloud)
- Tất cả passwords trong seed data là: `password123`
- NFC UIDs: `NFC-0001`, `NFC-0002`, `NFC-0003`
- Backend chạy port: `3000`
- Passenger app chạy port: `5173`

---

**Made with ❤️ for Smart Transportation**
