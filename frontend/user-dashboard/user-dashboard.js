// API базовый URL
const API_BASE_URL = 'http://localhost:8000'; // Замените на ваш URL

// Проверка авторизации при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadUserData();
    loadNotifications();
    loadUnreadMessages();
});

// Проверка авторизации
function checkAuth() {
    const token = localStorage.getItem('acessToken');
    if (!token) {
        window.location.href = '../index.html';
        return;
    }
}

// Загрузка данных пользователя
async function loadUserData() {
    const token = localStorage.getItem('acessToken');
    
    try {
        const response = await fetch(`${API_BASE_URL}/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('userName').textContent = data.firstName || 'Пользователь';
        } else {
            // Используем демо-данные если API недоступен
            document.getElementById('userName').textContent = 'Иван';
        }
    } catch (error) {
        console.error('Ошибка загрузки данных пользователя:', error);
        // Демо-данные
        document.getElementById('userName').textContent = 'Иван';
    }
}

// Загрузка уведомлений
async function loadNotifications() {
    const token = localStorage.getItem('acessToken');
    
    try {
        const response = await fetch(`${API_BASE_URL}/notifications`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const notifications = await response.json();
            displayNotifications(notifications);
        } else {
            // Используем демо-данные
            displayDemoNotifications();
        }
    } catch (error) {
        console.error('Ошибка загрузки уведомлений:', error);
        // Демо-данные
        displayDemoNotifications();
    }
}

// Отображение демо-уведомлений
function displayDemoNotifications() {
    const demoNotifications = [
        {
            id: 1,
            title: 'Добро пожаловать в систему!',
            message: 'Спасибо за регистрацию. Заполните свой профиль для полного доступа к функциям системы.',
            type: 'info',
            time: '2 часа назад',
            date: '15 апреля 2026, 10:30',
            read: false
        },
        {
            id: 2,
            title: 'Новое сообщение',
            message: 'У вас новое сообщение от Петра Петрова. Проверьте раздел "Сообщения".',
            type: 'success',
            time: '1 день назад',
            date: '14 апреля 2026, 15:45',
            read: false
        },
        {
            id: 3,
            title: 'Обновление профиля',
            message: 'Пожалуйста, обновите информацию о департаменте в вашем профиле.',
            type: 'warning',
            time: '3 дня назад',
            date: '12 апреля 2026, 09:15',
            read: true
        }
    ];
    
    displayNotifications(demoNotifications);
}

// Отображение уведомлений
function displayNotifications(notifications) {
    const notificationsList = document.getElementById('notificationsList');
    
    if (!notifications || notifications.length === 0) {
        notificationsList.innerHTML = `
            <div class="empty-state">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
                <h3>Нет уведомлений</h3>
                <p>У вас пока нет новых уведомлений</p>
            </div>
        `;
        return;
    }
    
    notificationsList.innerHTML = notifications.map(notification => `
        <div class="notification-card ${!notification.read ? 'notification-unread' : ''}" onclick="openNotification(${notification.id})">
            <div class="notification-icon ${notification.type}">
                ${getNotificationIcon(notification.type)}
            </div>
            <div class="notification-content">
                <div class="notification-header">
                    <span class="notification-title">${notification.title}</span>
                    <span class="notification-time">${notification.time}</span>
                </div>
                <p class="notification-text">${notification.message}</p>
            </div>
        </div>
    `).join('');
}

// Получение иконки уведомления
function getNotificationIcon(type) {
    const icons = {
        info: '<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        success: '<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        warning: '<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>',
        error: '<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
    };
    return icons[type] || icons.info;
}

// Загрузка количества непрочитанных сообщений
async function loadUnreadMessages() {
    const token = localStorage.getItem('acessToken');
    
    try {
        const response = await fetch(`${API_BASE_URL}/messages/unread-count`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            updateMessagesBadge(data.count);
        } else {
            // Демо-данные
            updateMessagesBadge(3);
        }
    } catch (error) {
        console.error('Ошибка загрузки сообщений:', error);
        updateMessagesBadge(3);
    }
}

// Обновление бейджа сообщений
function updateMessagesBadge(count) {
    const badge = document.getElementById('messagesBadge');
    if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

// Демо-данные уведомлений для детального просмотра
const notificationsData = {
    1: {
        title: 'Добро пожаловать в систему!',
        message: 'Спасибо за регистрацию в нашей системе. Пожалуйста, заполните свой профиль для получения полного доступа ко всем функциям системы. В разделе "Мой профиль" вы можете указать личные данные, контактную информацию и данные о вашей работе.',
        date: '15 апреля 2026, 10:30'
    },
    2: {
        title: 'Новое сообщение',
        message: 'У вас новое сообщение от Петра Петрова. Тема: "Обсуждение проекта". Проверьте раздел "Сообщения" для просмотра полного текста.',
        date: '14 апреля 2026, 15:45'
    },
    3: {
        title: 'Обновление профиля',
        message: 'Пожалуйста, обновите информацию о департаменте в вашем профиле. Администрация внесла изменения в структуру департаментов.',
        date: '12 апреля 2026, 09:15'
    }
};

// Открытие уведомления
function openNotification(id) {
    const notification = notificationsData[id];
    if (!notification) return;
    
    document.getElementById('notificationTitle').textContent = notification.title;
    document.getElementById('notificationMessage').textContent = notification.message;
    document.getElementById('notificationDate').textContent = notification.date;
    
    document.getElementById('notificationModal').classList.add('active');
    
    // Отметить как прочитанное
    markAsRead(id);
}

// Закрытие модального окна уведомления
function closeNotificationModal() {
    document.getElementById('notificationModal').classList.remove('active');
}

// Отметить уведомление как прочитанное
async function markAsRead(id) {
    const token = localStorage.getItem('acessToken');
    
    try {
        await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        // Обновить список уведомлений
        loadNotifications();
    } catch (error) {
        console.error('Ошибка отметки уведомления:', error);
    }
}

// Выход из системы
function logout() {
    localStorage.removeItem('acessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '../index.html';
}

// Модальные окна успеха и ошибки
function showSuccessModal(title, message) {
    document.getElementById('successTitle').textContent = title;
    document.getElementById('successMessage').textContent = message;
    document.getElementById('successModal').classList.add('active');
}

function closeSuccessModal() {
    document.getElementById('successModal').classList.remove('active');
}

function showErrorModal(title, message) {
    document.getElementById('errorTitle').textContent = title;
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorModal').classList.add('active');
}

function closeErrorModal() {
    document.getElementById('errorModal').classList.remove('active');
}

// Закрытие модальных окон по клику вне их области
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}
