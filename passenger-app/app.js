import axios from 'axios';
import io from 'socket.io-client';

// Configuration
const API_URL = 'http://localhost:3000/api';
const SOCKET_URL = 'http://localhost:3000';

// State
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
let socket = null;
let currentTripId = null;

// API Client
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests
api.interceptors.request.use(config => {
    if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
});

// Handle API errors
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            logout();
        }
        throw error;
    }
);

// UI Helper Functions
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleString('vi-VN');
}

// Authentication
async function login(username, password) {
    try {
        const response = await api.post('/auth/login', { username, password });

        if (response.data.success) {
            authToken = response.data.data.token;
            currentUser = response.data.data.user;

            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            showScreen('main-screen');
            initializeApp();
            showToast('Đăng nhập thành công!', 'success');
        }
    } catch (error) {
        showToast(error.response?.data?.message || 'Đăng nhập thất bại', 'error');
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');

    if (socket) {
        socket.disconnect();
    }

    showScreen('login-screen');
    showToast('Đã đăng xuất', 'info');
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Initialize App
async function initializeApp() {
    connectSocket();
    loadBalance();
    loadProfile();
    loadRoutes();
    loadActiveTrips();
    loadTransactions();
}

// Socket.io
function connectSocket() {
    socket = io(SOCKET_URL);

    socket.on('connect', () => {
        console.log('Socket connected');
    });

    socket.on('location_update', (data) => {
        console.log('Location update:', data);
        // Update trip location on map if visible
    });

    socket.on('stop_request', (data) => {
        showToast(`Yêu cầu dừng tại ${data.station_name}`, 'info');
    });
}

// Balance
async function loadBalance() {
    try {
        const response = await api.get('/payment/balance');
        if (response.data.success) {
            const balance = response.data.data.balance;
            document.getElementById('balance-amount').textContent = formatCurrency(balance);
        }
    } catch (error) {
        console.error('Load balance error:', error);
    }
}

// Profile
async function loadProfile() {
    try {
        const response = await api.get('/auth/profile');
        if (response.data.success) {
            const user = response.data.data;
            const profileInfo = document.getElementById('profile-info');

            profileInfo.innerHTML = `
                <div class="profile-item">
                    <span class="profile-label">Họ tên</span>
                    <span class="profile-value">${user.full_name}</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Email</span>
                    <span class="profile-value">${user.email}</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Số điện thoại</span>
                    <span class="profile-value">${user.phone || 'Chưa cập nhật'}</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Mã NFC</span>
                    <span class="profile-value">${user.nfc_uid || 'Chưa có'}</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Số dư</span>
                    <span class="profile-value">${formatCurrency(user.balance || 0)}</span>
                </div>
            `;
        }
    } catch (error) {
        console.error('Load profile error:', error);
    }
}

// Routes
async function loadRoutes() {
    try {
        const response = await api.get('/routes');
        if (response.data.success) {
            const routesList = document.getElementById('routes-list');
            const routes = response.data.data;

            if (routes.length === 0) {
                routesList.innerHTML = '<p class="loading">Không có tuyến xe nào</p>';
                return;
            }

            routesList.innerHTML = routes.map(route => `
                <div class="route-card">
                    <h3>🚌 Tuyến ${route.route_number}: ${route.route_name}</h3>
                    <p>${route.description || ''}</p>
                    <div class="route-info">
                        <div class="info-item">
                            <span class="info-icon">💰</span>
                            <span>Giá vé: ${formatCurrency(route.full_fare)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">📍</span>
                            <span>${route.station_count || 0} trạm</span>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">🚌</span>
                            <span>${route.bus_count || 0} xe hoạt động</span>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">📏</span>
                            <span>${route.total_distance} km</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Load routes error:', error);
        document.getElementById('routes-list').innerHTML = '<p class="loading">Lỗi tải dữ liệu</p>';
    }
}

// Trips
async function loadActiveTrips() {
    try {
        const response = await api.get('/trips/active');
        if (response.data.success) {
            const tripsList = document.getElementById('trips-list');
            const tripSelect = document.getElementById('trip-select');
            const trips = response.data.data;

            if (trips.length === 0) {
                tripsList.innerHTML = '<p class="loading">Không có chuyến xe nào đang hoạt động</p>';
                tripSelect.innerHTML = '<option value="">-- Không có chuyến xe --</option>';
                return;
            }

            tripsList.innerHTML = trips.map(trip => `
                <div class="trip-card">
                    <h3>🚌 ${trip.route_id?.route_name || trip.route_name || 'Không rõ'} - Xe ${trip.bus_id?.bus_number || trip.bus_number || 'N/A'}</h3>
                    <div class="trip-info">
                        <div class="info-item">
                            <span class="info-icon">👨‍✈️</span>
                            <span>Tài xế: ${trip.driver_id?.full_name || trip.driver_name || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">👥</span>
                            <span>${trip.passenger_count} hành khách</span>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">⚡</span>
                            <span>${trip.current_speed || 0} km/h</span>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">⏰</span>
                            <span>Bắt đầu: ${formatDate(trip.start_time || trip.createdAt)}</span>
                        </div>
                    </div>
                </div>
            `).join('');

            tripSelect.innerHTML = '<option value="">-- Chọn chuyến xe --</option>' +
                trips.map(trip => `
                    <option value="${trip._id}">
                        ${trip.route_id?.route_name || trip.route_name} - Xe ${trip.bus_id?.bus_number || trip.bus_number} (${trip.passenger_count} người)
                    </option>
                `).join('');
        }
    } catch (error) {
        console.error('Load trips error:', error);
        document.getElementById('trips-list').innerHTML = '<p class="loading">Lỗi tải dữ liệu</p>';
    }
}

// Transactions
async function loadTransactions() {
    try {
        const response = await api.get('/payment/transactions');
        if (response.data.success) {
            const transactionsList = document.getElementById('transactions-list');
            const transactions = response.data.data;

            if (transactions.length === 0) {
                transactionsList.innerHTML = '<p class="loading">Chưa có giao dịch nào</p>';
                return;
            }

            transactionsList.innerHTML = transactions.map(transaction => {
                const isPositive = transaction.transaction_type === 'top_up' || transaction.transaction_type === 'refund';
                const amountClass = isPositive ? 'positive' : 'negative';
                const amountSign = isPositive ? '+' : '-';

                return `
                    <div class="transaction-item">
                        <div class="transaction-info">
                            <div class="transaction-type">
                                ${transaction.transaction_type === 'top_up' ? '💰 Nạp tiền' :
                        transaction.transaction_type === 'fare' ? '🚌 Thanh toán vé' :
                            transaction.transaction_type === 'refund' ? '↩️ Hoàn tiền' :
                                '⚠️ Phạt'}
                            </div>
                            <div class="transaction-date">${formatDate(transaction.created_at)}</div>
                            ${transaction.route_name ? `<div style="font-size: 0.85rem; color: var(--text-secondary);">${transaction.route_name}</div>` : ''}
                        </div>
                        <div class="transaction-amount ${amountClass}">
                            ${amountSign}${formatCurrency(Math.abs(transaction.amount))}
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Load transactions error:', error);
        document.getElementById('transactions-list').innerHTML = '<p class="loading">Lỗi tải dữ liệu</p>';
    }
}

// Top-up
async function topUp(amount) {
    try {
        const response = await api.post('/payment/top-up', { amount });
        if (response.data.success) {
            showToast('Nạp tiền thành công!', 'success');
            loadBalance();
            loadProfile();
            loadTransactions();
            document.getElementById('topup-form').reset();
        }
    } catch (error) {
        showToast(error.response?.data?.message || 'Nạp tiền thất bại', 'error');
    }
}

// NFC Tap In
async function tapIn(tripId) {
    if (!currentUser.nfc_uid) {
        showToast('Tài khoản chưa có thẻ NFC', 'error');
        return;
    }

    try {
        const response = await api.post('/payment/tap-in', {
            nfc_uid: currentUser.nfc_uid,
            trip_id: tripId,
            device_uid: 'WEB-SIMULATOR'
        });

        if (response.data.success) {
            currentTripId = tripId;
            document.getElementById('tap-in-btn').disabled = true;
            document.getElementById('tap-out-btn').disabled = false;
            showToast(response.data.message, 'success');
            loadBalance();
        }
    } catch (error) {
        showToast(error.response?.data?.message || 'Quét thẻ lên xe thất bại', 'error');
    }
}

// NFC Tap Out
async function tapOut() {
    if (!currentUser.nfc_uid || !currentTripId) {
        showToast('Chưa quét thẻ lên xe', 'error');
        return;
    }

    try {
        const response = await api.post('/payment/tap-out', {
            nfc_uid: currentUser.nfc_uid,
            trip_id: currentTripId,
            device_uid: 'WEB-SIMULATOR',
            station_id: null // In real scenario, this would be the actual station
        });

        if (response.data.success) {
            currentTripId = null;
            document.getElementById('tap-in-btn').disabled = false;
            document.getElementById('tap-out-btn').disabled = true;
            document.getElementById('trip-select').value = '';
            showToast(response.data.message, 'success');
            loadBalance();
            loadTransactions();
        }
    } catch (error) {
        showToast(error.response?.data?.message || 'Quét thẻ xuống xe thất bại', 'error');
    }
}

// Navigation
function switchTab(tabName) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    if (authToken && currentUser) {
        showScreen('main-screen');
        initializeApp();
    }

    // Login form
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        login(username, password);
    });

    // Logout button
    document.getElementById('logout-btn').addEventListener('click', logout);

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const tabName = item.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // Refresh buttons
    document.getElementById('refresh-routes-btn').addEventListener('click', loadRoutes);
    document.getElementById('refresh-trips-btn').addEventListener('click', loadActiveTrips);

    // Top-up form
    document.getElementById('topup-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('topup-amount').value);
        topUp(amount);
    });

    // NFC tap in
    document.getElementById('tap-in-btn').addEventListener('click', () => {
        const tripId = document.getElementById('trip-select').value;
        if (!tripId) {
            showToast('Vui lòng chọn chuyến xe', 'error');
            return;
        }
        tapIn(parseInt(tripId));
    });

    // NFC tap out
    document.getElementById('tap-out-btn').addEventListener('click', tapOut);
});
