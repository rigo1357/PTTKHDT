// Page Navigation
function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    const targetPage = document.getElementById('page-' + page);
    if (targetPage) {
        targetPage.classList.remove('hidden');
    }
    
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = document.querySelector(`[onclick="showPage('${page}')"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Reinitialize icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Passenger App Functions
function login() {
    const loginScreen = document.getElementById('screen-login');
    const mainScreen = document.getElementById('screen-main');
    if (loginScreen && mainScreen) {
        loginScreen.classList.remove('active');
        mainScreen.classList.add('active');
        switchTab('home');
    }
}

function showRegister() {
    alert('Màn hình đăng ký sẽ mở tại đây');
}

function switchTab(tab) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => {
        n.classList.remove('active');
        n.classList.add('text-gray-600');
    });
    
    // Show selected tab
    const targetTab = document.getElementById('tab-' + tab);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    const navItems = document.querySelectorAll('.nav-item');
    const tabIndex = ['home', 'search', 'wallet', 'account'].indexOf(tab);
    if (navItems[tabIndex]) {
        navItems[tabIndex].classList.add('active');
        navItems[tabIndex].classList.remove('text-gray-600');
    }
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function searchRoute() {
    const from = document.getElementById('search-from');
    const to = document.getElementById('search-to');
    if (from && to) {
        const fromValue = from.value;
        const toValue = to.value;
        if (fromValue && toValue) {
            alert(`Đang tìm tuyến đường từ ${fromValue} đến ${toValue}`);
        } else {
            alert('Vui lòng nhập cả điểm đi và điểm đến');
        }
    }
}

function startTrip() {
    const mainScreen = document.getElementById('screen-main');
    const liveTripScreen = document.getElementById('screen-live-trip');
    if (mainScreen && liveTripScreen) {
        mainScreen.classList.remove('active');
        liveTripScreen.classList.add('active');
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

function endTrip() {
    const mainScreen = document.getElementById('screen-main');
    const liveTripScreen = document.getElementById('screen-live-trip');
    if (mainScreen && liveTripScreen) {
        liveTripScreen.classList.remove('active');
        mainScreen.classList.add('active');
        switchTab('home');
    }
}

function requestStop() {
    alert('Yêu cầu dừng xe đã được gửi đến tài xế!');
    setTimeout(() => {
        const notification = document.getElementById('stop-request-notification');
        if (notification) {
            notification.classList.remove('hidden');
        }
    }, 1000);
}

function showWallet() {
    switchTab('wallet');
}

function showAccount() {
    switchTab('account');
}

function topUp() {
    alert('Màn hình nạp tiền sẽ mở tại đây');
}

// Driver App Functions
function driverLogin() {
    const driverLoginScreen = document.getElementById('driver-login');
    const driverDashboard = document.getElementById('driver-dashboard');
    if (driverLoginScreen && driverDashboard) {
        driverLoginScreen.classList.remove('active');
        driverDashboard.classList.add('active');
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

function acknowledgeStop() {
    const notification = document.getElementById('stop-request-notification');
    if (notification) {
        notification.classList.add('hidden');
        alert('Đã xác nhận yêu cầu dừng xe');
    }
}

function reportIssue(type) {
    const issueTypes = {
        'traffic': 'Kẹt Xe',
        'technical': 'Sự Cố Kỹ Thuật'
    };
    alert(`${issueTypes[type] || 'Sự cố'} đã được báo cáo đến trung tâm điều hành`);
}

// Station Kiosk - Update Time
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    const dateString = now.toLocaleDateString('vi-VN', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        timeElement.textContent = `${timeString} • ${dateString}`;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Initialize time
    updateTime();
    setInterval(updateTime, 1000);
    
    // Show home page by default
    showPage('home');
});

