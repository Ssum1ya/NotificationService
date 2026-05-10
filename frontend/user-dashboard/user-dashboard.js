// API базовый URL
const API_BASE_URL = 'http://localhost:8080'; // Замените на ваш URL

// Проверка авторизации при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    const actionCards = document.querySelectorAll('.action-card');

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const tab = this.getAttribute('data-tab');
            if (tab) {
                switchTab(tab);
            }
        });
    });

    actionCards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            const tab = this.getAttribute('data-tab');
            if (tab) {
                switchTab(tab);
            }
        });
    });

    renderProfile();
    renderNotifications();
    checkAuth();
    renderYoungMessages();
    // loadUserData();
    loadNotifications();
    //loadUnreadMessages();
});

// Проверка авторизации
function checkAuth() {
    const token = localStorage.getItem('acessToken');
    if (!token) {
        window.location.href = '../index.html';
        return;
    }
}

// Парсинг JWT токена
function parseJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Ошибка парсинга JWT:', e);
        return null;
    }
}

function getUserIdFromToken(token) {
    const payload = parseJWT(token);
    return payload ? payload.userId : null;
}

// // Загрузка данных пользователя
// async function loadUserData() {
//     const token = localStorage.getItem('acessToken');
    
//     try {
//         const response = await fetch(`${API_BASE_URL}/profile`, {
//             method: 'GET',
//             headers: {
//                 'Authorization': `Bearer ${token}`,
//                 'Content-Type': 'application/json'
//             }
//         });

//         if (response.ok) {
//             const data = await response.json();
//             document.getElementById('userName').textContent = data.firstName || 'Пользователь';
//         } else {
//             // Используем демо-данные если API недоступен
//             document.getElementById('userName').textContent = 'Иван';
//         }
//     } catch (error) {
//         console.error('Ошибка загрузки данных пользователя:', error);
//         // Демо-данные
//         document.getElementById('userName').textContent = 'Иван';
//     }
// }

function switchTab(tabName) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-tab') === tabName) {
            item.classList.add('active');
        }
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName + 'Tab').classList.add('active');
}

const PAGE_SIZE_NOTIFICATIONS = 8;

let pageNotifications = 0;

function renderPagination(containerId, currentPage, totalPages, onPageChange) {
    const container = document.getElementById(containerId);
    if (!container) return;
 
    if (totalPages <= 1) { container.innerHTML = ''; return; }
 
    let btns = '';
 
    btns += `<button class="page-btn ${currentPage === 0 ? 'page-btn--disabled' : ''}"
        onclick="${currentPage > 0 ? `${onPageChange}(${currentPage - 1})` : ''}"
        ${currentPage === 0 ? 'disabled' : ''}>
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
    </button>`;
 
    for (let i = 0; i < totalPages; i++) {
        if (i === 0 || i === totalPages - 1 || Math.abs(i - currentPage) <= 1) {
            btns += `<button class="page-btn ${i === currentPage ? 'page-btn--active' : ''}"
                onclick="${onPageChange}(${i})">${i + 1}</button>`;
        } else if (Math.abs(i - currentPage) === 2) {
            btns += `<span class="page-dots">…</span>`;
        }
    }
 
    btns += `<button class="page-btn ${currentPage === totalPages - 1 ? 'page-btn--disabled' : ''}"
        onclick="${currentPage < totalPages - 1 ? `${onPageChange}(${currentPage + 1})` : ''}"
        ${currentPage === totalPages - 1 ? 'disabled' : ''}>
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
    </button>`;
 
    container.innerHTML = `<div class="pagination">${btns}</div>`;
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

// Хранилище данных профиля (чтобы не дёргать API лишний раз)
let cachedProfile = null;

async function renderProfile() {

    const token = localStorage.getItem('acessToken');
    const userId = getUserIdFromToken(token);

    if (!token) {
        console.error('No token found');
        return;
    }

    const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
    });

    const result = await response.json();
    cachedProfile = result;
    renderProfileView(result);
}

// Режим просмотра профиля
function renderProfileView(p) {
    const container = document.getElementById('profileTab');

    container.innerHTML = `
        <div class="profile-container">

            <div class="profile-edit-bar">
                <button class="btn-edit-profile" onclick="renderProfileEdit()">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5
                               m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    Редактировать профиль
                </button>
            </div>

            <div class="profile-section">
                <h2 class="section-title">Личная информация</h2>
                <div class="profile-card">
                    <div class="profile-item">
                        <span class="profile-label">Имя</span>
                        <span class="profile-value">${p.name}</span>
                    </div>
                    <div class="profile-item">
                        <span class="profile-label">Фамилия</span>
                        <span class="profile-value">${p.lastName}</span>
                    </div>
                    <div class="profile-item">
                        <span class="profile-label">Отчество</span>
                        <span class="profile-value">${p.surname}</span>
                    </div>
                </div>
            </div>

            <div class="profile-section">
                <h2 class="section-title">Контактная информация</h2>
                <div class="profile-card">
                    <div class="profile-item">
                        <span class="profile-label">Средство связи</span>
                        <span class="profile-value">${p.communication}</span>
                    </div>
                    <div class="profile-item">
                        <span class="profile-label">Контактные данные</span>
                        <span class="profile-value">${p.username}</span>
                    </div>
                </div>
            </div>

            <div class="profile-section">
                <h2 class="section-title">Рабочая информация</h2>
                <div class="profile-card">
                    <div class="profile-item">
                        <span class="profile-label">Грейд</span>
                        <span class="profile-value">${p.grade}</span>
                    </div>
                    <div class="profile-item">
                        <span class="profile-label">Должность</span>
                        <span class="profile-value">${p.position}</span>
                    </div>
                    <div class="profile-item">
                        <span class="profile-label">Департамент</span>
                        <span class="profile-value">${p.department}</span>
                    </div>
                </div>
            </div>

        </div>`;
}

// Режим редактирования профиля
function renderProfileEdit() {
    const p = cachedProfile;
    if (!p) return;

    const container = document.getElementById('profileTab');

    container.innerHTML = `
        <div class="profile-container">

            <div class="profile-edit-bar">
                <button class="btn-cancel-profile" onclick="renderProfileView(cachedProfile)">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    Отмена
                </button>
                <button class="btn-save-profile" onclick="saveProfile()">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    Сохранить
                </button>
            </div>

            <div class="profile-section">
                <h2 class="section-title">Личная информация</h2>
                <div class="profile-card">
                    <div class="profile-item">
                        <label class="profile-label" for="edit-name">Имя</label>
                        <input class="profile-input" id="edit-name" type="text" value="${p.name}" placeholder="Введите имя"/>
                    </div>
                    <div class="profile-item">
                        <label class="profile-label" for="edit-lastName">Фамилия</label>
                        <input class="profile-input" id="edit-lastName" type="text" value="${p.lastName}" placeholder="Введите фамилию"/>
                    </div>
                    <div class="profile-item">
                        <label class="profile-label" for="edit-surname">Отчество</label>
                        <input class="profile-input" id="edit-surname" type="text" value="${p.surname}" placeholder="Введите отчество"/>
                    </div>
                </div>
            </div>

            <div class="profile-section">
                <h2 class="section-title">Контактная информация</h2>
                <div class="profile-card">
                    <div class="profile-item">
                        <label class="profile-label" for="edit-communication">Средство связи</label>
                        <select class="profile-input" id="edit-communication" onchange="updateContactLabel()">
                            <option value="">Выберите площадку</option>
                            <option value="telegram" ${p.communication === 'telegram' ? 'selected' : ''}>Telegram</option>
                            <option value="email" ${p.communication === 'email' ? 'selected' : ''}>Mail</option>
                            <option value="vk" ${p.communication === 'vk' ? 'selected' : ''}>Vk</option>
                        </select>
                    </div>
                    <div class="profile-item">
                        <label class="profile-label" id="edit-username-label">Контактные данные</label>
                        <input class="profile-input" id="edit-username" type="text" value="${p.username}" placeholder="Ваш контакт"/>
                    </div>
                </div>
            </div>

            <div class="profile-section">
                <h2 class="section-title">
                    Рабочая информация
                    <span class="readonly-badge">
                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6
                                   a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        </svg>
                        Только для чтения
                    </span>
                </h2>
                <div class="profile-card profile-card--readonly">
                    <div class="profile-item">
                        <span class="profile-label">Грейд</span>
                        <span class="profile-value profile-value--readonly">${p.grade}</span>
                    </div>
                    <div class="profile-item">
                        <span class="profile-label">Должность</span>
                        <span class="profile-value profile-value--readonly">${p.position}</span>
                    </div>
                    <div class="profile-item">
                        <span class="profile-label">Департамент</span>
                        <span class="profile-value profile-value--readonly">${p.department}</span>
                    </div>
                </div>
            </div>

        </div>`;
}

// Обновление лейбла и плейсхолдера контактного поля
function updateContactLabel() {
    const value = document.getElementById('edit-communication').value;
    const label = document.getElementById('edit-username-label');
    const input = document.getElementById('edit-username');
 
    let text, placeholder;
 
    if (value === "") {
        text = 'Контактные данные';
        placeholder = 'Ваш контакт';
    } else if (value === 'telegram') {
        text = 'Username в Telegram';
        placeholder = 'Введите username';
    } else if (value === 'email') {
        text = 'Электронная почта';
        placeholder = 'Введите почту';
    } else if (value === 'vk') {
        text = 'VK ID';
        placeholder = 'Введите id аккаунта';
    }
 
    label.textContent = text;
    input.placeholder = placeholder;

}

// Сохранение изменений профиля
async function saveProfile() {
    const token = localStorage.getItem('acessToken');
    const userId = getUserIdFromToken(token);
 
    const updatedFields = {
        name:          document.getElementById('edit-name').value.trim(),
        lastName:      document.getElementById('edit-lastName').value.trim(),
        surname:       document.getElementById('edit-surname').value.trim(),
        communication: document.getElementById('edit-communication').value.trim(),
        username:      document.getElementById('edit-username').value.trim(),
    };
 
    // Валидация: все поля обязательны
    const fieldLabels = {
        name:          'Имя',
        lastName:      'Фамилия',
        surname:       'Отчество',
        communication: 'Средство связи',
        username:      'Контактные данные',
    };
 
    for (const [field, label] of Object.entries(fieldLabels)) {
        const value = updatedFields[field];
        if (!value || value === null || value === '') {
            showErrorModal('Ошибка валидации', `Поле "${label}" не может быть пустым.`);
            // Подсвечиваем проблемное поле
            const el = document.getElementById('edit-' + field) || document.getElementById('edit-' + (field === 'lastName' ? 'lastName' : field));
            if (el) {
                el.style.borderColor = '#dc2626';
                el.focus();
            }
            return;
        }
    }
 
    try {
        const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedFields)
        });
 
        if (response.ok) {
            cachedProfile = { ...cachedProfile, ...updatedFields };
            renderProfileView(cachedProfile);
            showSuccessModal('Готово!', 'Профиль успешно обновлён.');
        } else if (response.status === 422) {
            const err = await response.json().catch(() => ({}));
            showErrorModal(error);
        } else {
            const err = await response.json().catch(() => ({}));
            showErrorModal('Ошибка сохранения', err.message || 'Не удалось сохранить изменения. Попробуйте позже.');
        }
    } catch (error) {
        console.error('Ошибка сохранения профиля:', error);
        showErrorModal('Ошибка', 'Проблема с соединением. Проверьте сеть и попробуйте снова.');
    }
}

// Отображение истории сообщений
async function renderYoungMessages() {
    const container = document.getElementById('recentNotificationsList');

    const token = localStorage.getItem('acessToken');
    const userId = getUserIdFromToken(token);

    if (!token) {
        console.error('No token found');
        return;
    }

    const response = await fetch(`${API_BASE_URL}/message/young-messages/${userId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
    });

    const result = await response.json();

    if (result.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                </svg>
                <h3>Последних уведомлений пока нет(</h3>
                <p>-</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = result.map(notif => `
        <div class="notification-item">
            <div class="notification-icon ${'info'}">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
            </div>
            <div class="notification-content">
                <div class="notification-header">
                    <div class="notification-title">${notif.fromName}</div>
                    <div class="notification-time">${notif.message_time}</div>
                </div>
                <div class="notification-text">${notif.message}</div>
            </div>
        </div>
    `).join('');
}

// Notifications
async function renderNotifications(page = 0) {
    pageNotifications = page;
    const token = localStorage.getItem('acessToken');
    const userId = getUserIdFromToken(token);

    if (!token) {
        console.error('No token found');
        return;
    }

    const response = await fetch(`${API_BASE_URL}/message/notification-history/${userId}?page=${page}&size=${PAGE_SIZE_NOTIFICATIONS}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
    });

    const result = await response.json();

    const container = document.getElementById('notificationsList');
    container.innerHTML = result.content.map(notif => `
        <div class="notification-item">
            <div class="notification-icon ${'info'}">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
            </div>
            <div class="notification-content">
                <div class="notification-header">
                    <div class="notification-title">${notif.fromName}</div>
                    <div class="notification-time">${notif.message_time}</div>
                </div>
                <div class="notification-text">${notif.message}</div>
            </div>
        </div>
    `).join('');
    renderPagination('notificationsPagination', page, result.totalPages, 'renderNotifications');
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

// // Загрузка количества непрочитанных сообщений
// async function loadUnreadMessages() {
//     const token = localStorage.getItem('acessToken');
    
//     try {
//         const response = await fetch(`${API_BASE_URL}/messages/unread-count`, {
//             method: 'GET',
//             headers: {
//                 'Authorization': `Bearer ${token}`,
//                 'Content-Type': 'application/json'
//             }
//         });

//         if (response.ok) {
//             const data = await response.json();
//             updateMessagesBadge(data.count);
//         } else {
//             // Демо-данные
//             updateMessagesBadge(3);
//         }
//     } catch (error) {
//         console.error('Ошибка загрузки сообщений:', error);
//         updateMessagesBadge(3);
//     }
// }

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
