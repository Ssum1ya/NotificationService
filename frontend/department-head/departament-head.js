const API_URL = 'http://localhost:8080';

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function showSuccessModal(title, message) {
    document.getElementById('successTitle').textContent = title;
    document.getElementById('successMessage').textContent = message;
    document.getElementById('successModal').classList.add('show');
}

function closeSuccessModal() {
    document.getElementById('successModal').classList.remove('show');
}

function showErrorModal(errorResponse) {
    const modal = document.getElementById('errorModal');
    const errorTitle = document.getElementById('errorTitle');
    const errorMessage = document.getElementById('errorMessage');
    const errorList = document.getElementById('errorList');

    errorTitle.textContent = errorResponse.message || 'Ошибка';
    errorMessage.textContent = 'Пожалуйста, исправьте следующие ошибки:';

    errorList.innerHTML = '';

    if (errorResponse.fieldErrors && errorResponse.fieldErrors.length > 0) {
        errorResponse.fieldErrors.forEach(error => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${error.field}:</strong> ${error.issue}`;
            errorList.appendChild(li);
        });
    }

    modal.classList.add('show');
}

function closeErrorModal() {
    document.getElementById('errorModal').classList.remove('show');
}


// Проверка авторизации при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('acessToken');
    if (!token) {
        window.location.href = '../index.html';
        return;
    }

    // Проверка роли из JWT
    const role = getUserRoleFromToken(token);
    if (!(role === 'Head')) {
        alert('У вас нет доступа к панеле главы депортамента');
        window.location.href = '../index.html';
        return;
    }
});

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

// Получение роли пользователя из токена
function getUserRoleFromToken(token) {
    const payload = parseJWT(token);
    return payload ? payload.role : null;
}

function getUserDepIdFromToken(token) {
    const payload = parseJWT(token);
    return payload ? payload.departmentId : null;
}

function getUserIdFromToken(token) {
    const payload = parseJWT(token);
    return payload ? payload.userId : null;
}

function getIsHeadFromToken(token) {
    const payload = parseJWT(token);
    return payload ? payload.isHead : null;
}

const PAGE_SIZE_NOTIFICATIONS = 8;
const PAGE_SIZE_REQUESTS   = 7;
const PAGE_SIZE_USERS      = 9;
const PAGE_SIZE_HISTORY    = 5;
const PAGE_SIZE_RECIPIENTS = 9;
const PAGE_SIZE_EMPLOYEES  = 5;

const PAGE_SIZE_YOUNG_MESSAGES = 6;
 
// Текущие страницы
let pageRequests   = 0;
let pageUsers      = 0;
let pageHistory    = 0;
let pageRecipients = 0;

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

let messageHistory = [
    {
        id: 1,
        date: '2026-04-24 09:00',
        recipients: ['Кузнецов Алексей', 'Смирнова Ольга', 'Волков Дмитрий'],
        message: 'Напоминаю всем о завтрашнем собрании в 10:00. Пожалуйста, подготовьте отчеты.'
    },
    {
        id: 2,
        date: '2026-04-23 15:30',
        recipients: ['Морозова Елена'],
        message: 'Пожалуйста, проверьте последние тесты перед релизом.'
    },
    {
        id: 3,
        date: '2026-04-22 11:20',
        recipients: ['Все сотрудники'],
        message: 'С понедельника вводится новый график работы. Подробности в приложении.'
    }
];

// Отображение истории сообщений
async function renderYoungMessages(page = 0) {
    const container = document.getElementById('recentNotificationsList');
    const token = localStorage.getItem('acessToken');
    const userId = getUserIdFromToken(token);
    if (!token) return;

    // Загружаем данные только если кэш пустой — бэк хранит их один раз
    if (youngAllData.length === 0) {
        try {
            const response = await fetch(`${API_URL}/message/young-messages/${userId}`, {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
            });
            youngAllData = await response.json();
        } catch (error) {
            console.error('Ошибка загрузки уведомлений:', error);
            container.innerHTML = '<div class="empty-state"><p>Ошибка загрузки</p></div>';
            return;
        }
    }

    if (!youngAllData || youngAllData.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                </svg>
                <h3>Последних уведомлений пока нет</h3>
                <p>-</p>
            </div>`;
        document.getElementById('youngPagination').innerHTML = '';
        return;
    }

    // Режем на страницы на клиенте
    pageYoung = page;
    const start = page * PAGE_YOUNG;
    const pageData = youngAllData.slice(start, start + PAGE_YOUNG);
    const totalPages = Math.ceil(youngAllData.length / PAGE_YOUNG);

    container.innerHTML = pageData.map(notif => `
        <div class="notification-item">
            <div class="notification-icon info">
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

    renderPagination('youngPagination', page, totalPages, 'renderYoungMessages');
}

// Отображение истории сообщений
async function renderMessageHistory(page = 0) {
    pageHistory = page;
    const container = document.getElementById('messageHistoryList');
    const token = localStorage.getItem('acessToken');
    const userId = getUserIdFromToken(token);

    if (!token) {
        console.error('No token found');
        return;
    }

    const response = await fetch(`${API_URL}/message/sending-history/${userId}?page=${page}&size=${PAGE_SIZE_HISTORY}`, {
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
                <h3>Нет отправленных сообщений</h3>
                <p>История сообщений пуста</p>
            </div>
        `;
        document.getElementById('historyPagination').innerHTML = '';
        return;
    }

    container.innerHTML = result.content.map(msg => `
        <div class="message-history-item">
            <div class="message-history-header">
                <div class="message-history-date">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="display: inline; vertical-align: middle; margin-right: 4px;">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    ${msg.messageTime}
                </div>
            </div>
            <div class="message-recipients">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #2563eb;">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                ${msg.usernames.map(r => `<span class="recipient-tag">${r}</span>`).join('')}
            </div>
            <div class="message-history-text">${msg.message}</div>
        </div>
    `).join('');

    renderPagination('historyPagination', page, result.totalPages, 'renderMessageHistory');
}

// При отправке сообщения добавить в историю
function sendMessage() {
    const messageText = document.getElementById('messageText').value;
    const selectedNames = selectedEmployees.map(id => {
        const emp = employees.find(e => e.id === id);
        return emp ? emp.name : '';
    }).filter(Boolean);

    if (selectedEmployees.length === 0 || !messageText.trim()) {
        // показать ошибку
        return;
    }

    // Добавить в историю
    messageHistory.unshift({
        id: Date.now(),
        date: new Date().toLocaleString('ru-RU'),
        recipients: selectedNames.length === employees.length ? ['Все сотрудники'] : selectedNames,
        message: messageText
    });

    // Сбросить форму
    selectedEmployees = [];
    document.getElementById('messageText').value = '';
    updateSelectedCount();

    // Показать успех
    showModal('Сообщение отправлено', `Сообщение отправлено ${selectedNames.length} сотрудникам`);
}

let s = [
    { id: 1, title: 'Новая заявка', message: 'Поступила новая заявка от Иванова И.И. на позицию Разработчик', type: 'info', date: '2026-04-15 14:30', read: false },
    { id: 2, title: 'Собрание команды', message: 'Завтра в 10:00 запланировано общее собрание департамента', type: 'warning', date: '2026-04-14 16:00', read: false },
    { id: 3, title: 'Успешное обновление', message: 'Система успешно обновлена до версии 2.0', type: 'success', date: '2026-04-13 09:15', read: true },
];

let selectedEmployees = [];
let employees;
let cachedHeadProfile = null;

// Пагинация на главной — клиентская
const PAGE_YOUNG   = 5;
let pageYoung      = 0;
let youngAllData   = [];

// Utility Functions
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('');
}

function updateStats() {
    // const unreadCount = notifications.filter(n => !n.read).length;

    // document.getElementById('notificationsBadge').textContent = unreadCount;

    // if (unreadCount === 0) {
    //     document.getElementById('notificationsBadge').style.display = 'none';
    // } else {
    //     document.getElementById('notificationsBadge').style.display = 'inline-block';
    // }
}

// Navigation
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

    renderHeadProfile();

    renderMessageHistory();
    renderYoungMessages();

    renderApplications();
    renderStaff();
    renderRecipients();
    renderNotifications();
});

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

    if (tabName === 'headProfile' && !cachedHeadProfile) {
        renderHeadProfile();
    }
}

async function renderHeadProfile() {
    const token = localStorage.getItem('acessToken');
    const userId = getUserIdFromToken(token);
 
    if (!token) return;
 
    try {
        const response = await fetch(`${API_URL}/profile/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        });
 
        const result = await response.json();
        cachedHeadProfile = result;
        renderHeadProfileView(result);
    } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
    }
}
 
function renderHeadProfileView(p) {
    const container = document.getElementById('headProfileTab');
 
    container.innerHTML = `
        <div class="profile-container">
 
            <div class="profile-edit-bar">
                <button class="btn-edit-profile" onclick="renderHeadProfileEdit()">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5
                               m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    Редактировать профиль
                </button>
            </div>
 
            <div class="profile-section">
                <h2 class="head-section-title">Личная информация</h2>
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
                        <span class="profile-value">${p.surname || '—'}</span>
                    </div>
                </div>
            </div>
 
            <div class="profile-section">
                <h2 class="head-section-title">Контактная информация</h2>
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
                <h2 class="head-section-title">Рабочая информация</h2>
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
 
function renderHeadProfileEdit() {
    const p = cachedHeadProfile;
    if (!p) return;
 
    const container = document.getElementById('headProfileTab');
 
    container.innerHTML = `
        <div class="profile-container">
 
            <div class="profile-edit-bar">
                <button class="btn-cancel-profile" onclick="renderHeadProfileView(cachedHeadProfile)">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    Отмена
                </button>
                <button class="btn-save-profile" onclick="saveHeadProfile()">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    Сохранить
                </button>
            </div>
 
            <div class="profile-section">
                <h2 class="head-section-title">Личная информация</h2>
                <div class="profile-card">
                    <div class="profile-item">
                        <label class="profile-label" for="head-edit-name">Имя</label>
                        <input class="profile-input" id="head-edit-name" type="text" value="${p.name}" placeholder="Введите имя" oninput="clearHeadFieldError(this)"/>
                    </div>
                    <div class="profile-item">
                        <label class="profile-label" for="head-edit-lastName">Фамилия</label>
                        <input class="profile-input" id="head-edit-lastName" type="text" value="${p.lastName}" placeholder="Введите фамилию" oninput="clearHeadFieldError(this)"/>
                    </div>
                    <div class="profile-item">
                        <label class="profile-label" for="head-edit-surname">Отчество</label>
                        <input class="profile-input" id="head-edit-surname" type="text" value="${p.surname || ''}" placeholder="Введите отчество" oninput="clearHeadFieldError(this)"/>
                    </div>
                </div>
            </div>
 
            <div class="profile-section">
                <h2 class="head-section-title">Контактная информация</h2>
                <div class="profile-card">
                    <div class="profile-item">
                        <label class="profile-label" for="head-edit-communication">Средство связи</label>
                        <select class="profile-input" id="head-edit-communication" onchange="updateHeadContactLabel(); clearHeadFieldError(this)">
                            <option value="">Выберите площадку</option>
                            <option value="telegram" ${p.communication.toLowerCase() === 'telegram' ? 'selected' : ''}>Telegram</option>
                            <option value="email" ${p.communication.toLowerCase() === 'email' ? 'selected' : ''}>Mail</option>
                            <option value="vk" ${p.communication.toLowerCase() === 'vk' ? 'selected' : ''}>Vk</option>
                        </select>
                    </div>
                    <div class="profile-item">
                        <label class="profile-label" id="head-edit-username-label">Контактные данные</label>
                        <input class="profile-input" id="head-edit-username" type="text" value="${p.username}" placeholder="Ваш контакт" oninput="clearHeadFieldError(this)"/>
                    </div>
                </div>
            </div>
 
            <div class="profile-section">
                <h2 class="head-section-title">
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
 
async function saveHeadProfile() {
    const token = localStorage.getItem('acessToken');
    const userId = getUserIdFromToken(token);
 
    const updatedFields = {
        name:          document.getElementById('head-edit-name').value.trim(),
        lastName:      document.getElementById('head-edit-lastName').value.trim(),
        surname:       document.getElementById('head-edit-surname').value.trim(),
        communication: document.getElementById('head-edit-communication').value.trim(),
        username:      document.getElementById('head-edit-username').value.trim(),
    };
 
    const fieldLabels = {
        name:          'Имя',
        lastName:      'Фамилия',
        surname:       'Отчество',
        communication: 'Средство связи',
        username:      'Контактные данные',
    };
 
    for (const [field, label] of Object.entries(fieldLabels)) {
        if (!updatedFields[field]) {
            showErrorModal({ message: `Поле "${label}" не может быть пустым.` });
            const el = document.getElementById('head-edit-' + field);
            if (el) { el.style.borderColor = '#dc2626'; el.focus(); }
            return;
        }
    }
 
    try {
        const response = await fetch(`${API_URL}/profile/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedFields)
        });
 
        if (response.ok) {
            cachedHeadProfile = { ...cachedHeadProfile, ...updatedFields };
            renderHeadProfileView(cachedHeadProfile);
            showSuccessModal('Готово!', 'Профиль успешно обновлён.');
        } else if (response.status === 422) {
            const err = await response.json().catch(() => ({}));
            showErrorModal({ message: err.message || 'Сервер отклонил данные. Проверьте правильность заполненных полей.' });
        } else {
            const err = await response.json().catch(() => ({}));
            showErrorModal({ message: err.message || 'Не удалось сохранить изменения. Попробуйте позже.' });
        }
    } catch (error) {
        console.error('Ошибка сохранения профиля:', error);
        showErrorModal({ message: 'Проблема с соединением. Проверьте сеть и попробуйте снова.' });
    }
}
 
function updateHeadContactLabel() {
    const value = document.getElementById('head-edit-communication').value;
    const label = document.getElementById('head-edit-username-label');
    const input = document.getElementById('head-edit-username');
 
    const map = {
        '':         ['Контактные данные',   'Ваш контакт'],
        'telegram': ['Username в Telegram', 'Введите username'],
        'email':    ['Электронная почта',   'Введите почту'],
        'vk':       ['VK ID',               'Введите id аккаунта'],
    };
 
    const [text, placeholder] = map[value] || map[''];
    label.textContent = text;
    input.placeholder = placeholder;
}
 
function clearHeadFieldError(el) {
    el.style.borderColor = '';
}


// Applications
async function renderApplications(page = 0) {
    pageRequests = page;
    const token = localStorage.getItem('acessToken');
    const container = document.getElementById('applicationsList');

    if (!token) {
        console.error('No token found');
        return;
    }

    const depId = getUserDepIdFromToken(token);

    const response = await fetch(`${API_URL}/requests/head/department-requests/${depId}?page=${page}&size=${PAGE_SIZE_REQUESTS}`, {
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
                <h3>Заявок пока нет(</h3>
                <p>-</p>
            </div>
        `;
        document.getElementById('requestsPagination').innerHTML = '';
        return;
    }

    const requestsLength = result.totalElements;

    document.getElementById('statApplications').textContent = requestsLength;
    document.getElementById('applicationsBadge').textContent = requestsLength;

    if (requestsLength === 0) {
        document.getElementById('applicationsBadge').style.display = 'none';
    } else {
        document.getElementById('applicationsBadge').style.display = 'inline-block';
    }

    container.innerHTML = result.content.map(app => {
        const headStatus = app.requestStatus;
        let status;

        if (headStatus === 'APPROVED') {
            status = "Одобрено админом";
        } else if (headStatus === 'DECLINED') {
            status = "Откланено админом";
        } else {
            status = "В ожидании просмотра админа"
        }
                        
        return `
            <div class="request-card">
                <div class="request-info">
                    <div class="request-header">
                        <div class="request-user">${app.userName}</div>
                        <div class="request-status ${status}">
                            ${status}
                        </div>
                    </div>
                    <div class="request-details">
                        <div class="request-detail-item">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                            Позиция: ${app.position}
                        </div>
                    </div>
                </div>
                <div class="request-actions">
                    <button class="btn-small" onclick="viewProfile('${app.userId}')" style="margin-right: 8px;">
                        Профиль
                    </button>
                    <button class="btn-approve" onclick="approveRequest('${app.userId}', '${app.userName}')">
                        Принять
                    </button>
                    <button class="btn-reject" onclick="rejectRequest('${app.userId}', '${app.userName}')">
                        Отклонить
                    </button>
                </div>
            </div>
        `;
        }).join('');
    renderPagination('requestsPagination', page, result.totalPages, 'renderApplications');    
}

// Отклонение заявки
async function rejectRequest(requestId, userName) {
    if (!confirm(`Отклонить заявку от ${userName}?`)) {
        return;
    }

    const token = localStorage.getItem('acessToken');

    // Запрос на бэкенд
    fetch(`${API_URL}/requests/head/declineRequest/${requestId}`, {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 'VALIDATION_FAILED') {
            showErrorModal(data);
        } else {
            showSuccessModal('Заявка отклонена', `Заявка от ${userName} была отклонена.`);
            timeout(2000);
            renderApplications();
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
        // Демо режим
        showSuccessModal('Заявка отклонена', `Заявка от ${userName} была отклонена.`);
        setTimeout(() => {
            loadRequests();
        }, 1500);
    });
}

// Одобрение заявки
function approveRequest(userId) {
    const token = localStorage.getItem('acessToken');

    fetch(`${API_URL}/requests/head/approveRequest/${userId}`, {
        method: "PUT",
        headers: {
            'Authorization': 'Bearer ' + token,
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Ошибка запроса: " + response.status);
        }

        return;
    })
    .then(() => {
        showSuccessModal('Сотрудник одобрен главой отдела', '');
        timeout(2000);
        renderApplications();
    })
    .then(() => {
        renderApplications();
    })
    .catch(err => {
        console.error(err);
        showErrorModal("Ошибка", '');
    });
}

function viewProfile(userId) {
    const token = localStorage.getItem('acessToken');
    console.log('Загрузка профиля для пользователя ID:', userId);

    // Запрос на бэкенд
    fetch(`${API_URL}/profile/${userId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        displayProfile(data);
    })
    .catch(error => {
        console.error('Ошибка загрузки профиля:', error);
        // Демо данные
        displayProfile({
            id: userId,
            lastName: 'Петров',
            name: 'Петр',
            surname: 'Петрович',
            communication: 'Telegram',
            position: 'Middle Developer',
            grade: 'Middle',
            department: 'Разработка',
            username: 'petrov@example.com'
        });
    });
}

function displayProfile(profile) {
    const content = document.getElementById('profileContent');

    content.innerHTML = `
        <div class="profile-section">
            <div class="profile-section-title">Личная информация</div>
            <div class="profile-grid">
                <div class="profile-field">
                    <div class="profile-label">Фамилия</div>
                    <div class="profile-value">${profile.lastName}</div>
                </div>
                <div class="profile-field">
                    <div class="profile-label">Имя</div>
                    <div class="profile-value">${profile.name}</div>
                </div>
                ${profile.surname ? `
                    <div class="profile-field profile-full-width">
                        <div class="profile-label">Отчество</div>
                        <div class="profile-value">${profile.surname}</div>
                    </div>
                ` : ''}
            </div>
        </div>

        <div class="profile-section">
            <div class="profile-section-title">Контактная информация</div>
            <div class="profile-grid">
                ${profile.username ? `
                    <div class="profile-field">
                        <div class="profile-label">Контактные данные</div>
                        <div class="profile-value">${profile.username}</div>
                    </div>
                ` : ''}
                <div class="profile-field">
                    <div class="profile-label">Предпочтительная связь</div>
                    <div class="profile-value">${profile.communication.toLowerCase()}</div>
                </div>
            </div>
        </div>

        <div class="profile-section">
            <div class="profile-section-title">Рабочая информация</div>
            <div class="profile-grid">
                <div class="profile-field">
                    <div class="profile-label">Позиция</div>
                    <div class="profile-value">${profile.position}</div>
                </div>
                <div class="profile-field">
                    <div class="profile-label">Grade</div>
                    <div class="profile-value">${profile.grade}</div>
                </div>
                ${profile.department ? `
                    <div class="profile-field profile-full-width">
                        <div class="profile-label">Департамент</div>
                        <div class="profile-value">${profile.department}</div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    document.getElementById('profileModalTitle').textContent = `Профиль: ${profile.lastName} ${profile.name}`;
    document.getElementById('profileModal').classList.add('show');
}

let currentEditingUserId = null;

function closeProfileModal() {
    document.getElementById('profileModal').classList.remove('show');
    document.getElementById('profileSaveBtn').style.display = 'none';
    currentEditingUserId = null;
}

function handleApplication(id, action) {
    const app = applications.find(a => a.id === id);
    if (app) {
        app.status = action === 'accept' ? 'accepted' : 'rejected';
        renderApplications();
        updateStats();
        showModal(
            action === 'accept' ? 'Заявка принята' : 'Заявка отклонена',
            `Заявка успешно ${action === 'accept' ? 'принята' : 'отклонена'}`
        );
    }
}

async function renderStaff(page = 0) {
    pageRecipients = page;
    try {
        const token = localStorage.getItem('acessToken');
        const depId = getUserDepIdFromToken(token);
 
        if (!token) {
            console.error('No token found');
            return;
        }
 
        const response = await fetch(`${API_URL}/profile/head/departament-employees/${depId}?page=${page}&size=${PAGE_SIZE_USERS}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        });
 
        if (!response.ok) {
            throw new Error('Failed to fetch employees');
        }
 
        const employees = await response.json();
 
        document.getElementById('statEmployees').textContent = employees.totalElements;
 
        const container = document.getElementById('staffList');
 
        if (!employees || employees.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <h3>Сотрудников пока нет</h3>
                    <p>-</p>
                </div>`;
            document.getElementById('usersPagination').innerHTML = '';
            return;
        }
 
        container.innerHTML = employees.content.map(emp => `
            <div class="staff-card" data-id=${emp.id}>
                <div class="staff-card-info">
                    <div class="employee-avatar">${getInitials(emp.name)}</div>
                    <div class="staff-card-details">
                        <div class="staff-card-name">${emp.name}</div>
                        <div class="staff-card-position">${emp.position}</div>
                    </div>
                </div>
                <div class="staff-card-actions">
                    <button class="btn-small" onclick="openStaffProfile('${emp.id}')">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        Профиль
                    </button>
                    <button class="btn-reject" onclick="kickEmployee('${emp.id}', '${emp.name}')">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6h12a6 6 0 00-6-6zM21 12h-6"/>
                        </svg>
                        Выгнать
                    </button>
                </div>
            </div>
        `).join('');
        renderPagination('usersPagination', page, employees.totalPages, 'renderStaff'); 
 
    } catch (error) {
        console.error('Error loading employees:', error);
        document.getElementById('staffList').innerHTML = `<div class="empty-state"><p>Ошибка загрузки сотрудников</p></div>`;
    }
}
 
function openStaffProfile(userId) {
    const token = localStorage.getItem('acessToken');
    currentEditingUserId = userId;
 
    fetch(`${API_URL}/profile/${userId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => displayStaffProfile(data))
    .catch(error => {
        console.error('Ошибка загрузки профиля:', error);
    });
}
 
function displayStaffProfile(profile) {
    const content = document.getElementById('profileContent');
 
    content.innerHTML = `
        <div class="profile-section">
            <div class="profile-section-title">Личная информация</div>
            <div class="profile-grid">
                <div class="profile-field">
                    <div class="profile-label">Фамилия</div>
                    <div class="profile-value">${profile.lastName}</div>
                </div>
                <div class="profile-field">
                    <div class="profile-label">Имя</div>
                    <div class="profile-value">${profile.name}</div>
                </div>
                ${profile.surname ? `
                    <div class="profile-field profile-full-width">
                        <div class="profile-label">Отчество</div>
                        <div class="profile-value">${profile.surname}</div>
                    </div>` : ''}
            </div>
        </div>
 
        <div class="profile-section">
            <div class="profile-section-title">Контактная информация</div>
            <div class="profile-grid">
                ${profile.username ? `
                    <div class="profile-field">
                        <div class="profile-label">Контактные данные</div>
                        <div class="profile-value">${profile.username}</div>
                    </div>` : ''}
                <div class="profile-field">
                    <div class="profile-label">Средство связи</div>
                    <div class="profile-value">${profile.communication}</div>
                </div>
            </div>
        </div>
 
        <div class="profile-section">
            <div class="profile-section-title">
                Рабочая информация
                <span class="editable-badge">
                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    Можно редактировать
                </span>
            </div>
            <div class="profile-grid">
                <div class="profile-field">
                    <label class="profile-label" for="edit-staff-position">Позиция</label>
                    <select class="profile-input" id="edit-staff-position">
                        <option value="Developer" ${profile.position === 'Developer' ? 'selected' : ''}>Разработчик</option>
                        <option value="Tester" ${profile.position === 'Tester' ? 'selected' : ''}>Тестировщик</option>
                        <option value="Analyst" ${profile.position === 'Analyst' ? 'selected' : ''}>Аналитик</option>
                        <option value="Designer" ${profile.position === 'Designer' ? 'selected' : ''}>Дизайнер</option>
                        <option value="Manager" ${profile.position === 'Manager' ? 'selected' : ''}>Менеджер проекта</option>
                        <option value="Devops" ${profile.position === 'Devops' ? 'selected' : ''}>DevOps инженер</option>
                        <option value="DataScientist" ${profile.position === 'DataScientist' ? 'selected' : ''}>Data Scientist</option>
                    </select>
                </div>
                <div class="profile-field">
                    <label class="profile-label" for="edit-staff-grade">Grade</label>
                    <select class="profile-input" id="edit-staff-grade">
                        <option value="Junior" ${profile.grade === 'Junior' ? 'selected' : ''}>Junior</option>
                        <option value="Middle" ${profile.grade === 'Middle' ? 'selected' : ''}>Middle</option>
                        <option value="Senior" ${profile.grade === 'Senior' ? 'selected' : ''}>Senior</option>
                        <option value="Lead" ${profile.grade === 'Lead' ? 'selected' : ''}>Lead</option>
                    </select>
                </div>
                ${profile.department ? `
                    <div class="profile-field profile-full-width">
                        <div class="profile-label">Департамент</div>
                        <div class="profile-value">${profile.department}</div>
                    </div>` : ''}
            </div>
        </div>
    `;
 
    document.getElementById('profileModalTitle').textContent = `Профиль: ${profile.lastName} ${profile.name}`;
 
    // Показываем кнопку сохранения
    document.getElementById('profileSaveBtn').style.display = 'inline-flex';
 
    document.getElementById('profileModal').classList.add('show');
}
 
// Сохранение изменений grade и position
async function saveStaffProfile() {
    const token = localStorage.getItem('acessToken');
 
    const position = document.getElementById('edit-staff-position').value;
    const grade = document.getElementById('edit-staff-grade').value;
 
    if (!position) {
        showErrorModal({ message: 'Поле "Позиция" не может быть пустым.' });
        return;
    }
 
    try {
        const response = await fetch(`${API_URL}/profile/head/${currentEditingUserId}`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ position, grade })
        });
 
        if (response.ok) {
            closeProfileModal();
            showSuccessModal('Готово!', 'Данные сотрудника успешно обновлены.');
            renderStaff();
        } else if (response.status === 422) {
            const err = await response.json().catch(() => ({}));
            showErrorModal({ message: err.message || 'Ошибка валидации данных.' });
        } else {
            const err = await response.json().catch(() => ({}));
            showErrorModal({ message: err.message || 'Не удалось сохранить изменения.' });
        }
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        showErrorModal({ message: 'Проблема с соединением. Попробуйте снова.' });
    }
}
 
// Выгнать сотрудника из департамента
async function kickEmployee(userId, userName) {
    if (!confirm(`Выгнать сотрудника ${userName} из департамента?`)) return;
 
    const token = localStorage.getItem('acessToken');
 
    try {
        const response = await fetch(`${API_URL}/user/head/kick/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        });
 
        if (response.ok) {
            showSuccessModal('Готово!', `${userName} исключён из департамента.`);
            setTimeout(() => renderStaff(), 1500);
        } else if (response.status === 422) {
            const err = await response.json().catch(() => ({}));
            showErrorModal({ message: err.message || 'Ошибка валидации.' });
        } else {
            const err = await response.json().catch(() => ({}));
            showErrorModal({ message: err.message || 'Не удалось исключить сотрудника.' });
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showErrorModal({ message: 'Проблема с соединением. Попробуйте снова.' });
    }
}

// Messages
async function renderRecipients(page = 0) {
    pageRecipients = page;
    const container = document.getElementById('recipientsList');

    try {
        const token = localStorage.getItem('acessToken');
        const depId = getUserDepIdFromToken(token);
        if (!token) return;

        const response = await fetch(
            `${API_URL}/profile/head/departament-employees-for-notification/${depId}?page=${page}&size=${PAGE_SIZE_RECIPIENTS}`,
            {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
            }
        );

        if (!response.ok) throw new Error('Failed to fetch employees');

        const result = await response.json();
        // result: { content: [...], page, size, totalElements, totalPages }

        employees = result.content;

        if (!result.content || result.content.length === 0) {
            container.innerHTML = '<div style="padding:12px;color:#6b7280;">Нет сотрудников</div>';
            document.getElementById('recipientsPagination').innerHTML = '';
            return;
        }

        container.innerHTML = result.content.map(emp => `
            <label class="recipient-item">
                <input type="checkbox"
                    value="${emp.id}"
                    onchange="toggleRecipient('${emp.id}')"
                    ${selectedEmployees.includes(emp.id) ? 'checked' : ''}>
                <div class="employee-avatar">${getInitials(emp.name)}</div>
                <div style="flex: 1;">
                    <div class="employee-name">${emp.name}</div>
                    <div style="color: #64748b; font-size: 13px;">${emp.position}</div>
                </div>
            </label>
        `).join('');

        renderPagination('recipientsPagination', page, result.totalPages, 'renderRecipients');

        // Рассчитываем высоту элементов по реальной высоте списка
        requestAnimationFrame(() => {
            const listHeight = container.clientHeight;
            const count = result.content.length;
            const gap = 6;
            const itemHeight = Math.floor((listHeight - gap * (count - 1)) / count);
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.gap = gap + 'px';
            container.querySelectorAll('.recipient-item').forEach(item => {
                item.style.height = itemHeight + 'px';
            });
        });

    } catch (error) {
        console.error('Error loading employees:', error);
        container.innerHTML = '<div style="padding:12px;color:#ef4444;">Ошибка загрузки</div>';
    }
}

function toggleRecipient(id) {
    if (selectedEmployees.includes(id)) {
        selectedEmployees = selectedEmployees.filter(empId => empId !== id);
    } else {
        selectedEmployees.push(id);
    }
    updateSelectedCount();
}

function toggleSelectAll() {
    const checkboxes = document.querySelectorAll('#recipientsList input[type="checkbox"]');
    if (selectedEmployees.length === employees.length) {
        selectedEmployees = [];
        checkboxes.forEach(cb => cb.checked = false);
        document.querySelector('.select-all-btn').textContent = 'Выбрать всех';
    } else {
        selectedEmployees = employees.map(emp => emp.id);
        checkboxes.forEach(cb => cb.checked = true);
        document.querySelector('.select-all-btn').textContent = 'Снять все';
    }
    updateSelectedCount();
}

function updateSelectedCount() {
    const countDiv = document.getElementById('selectedCount');
    const countValue = document.getElementById('selectedCountValue');
    
    if (selectedEmployees.length > 0) {
        countDiv.style.display = 'block';
        countValue.textContent = selectedEmployees.length;
    } else {
        countDiv.style.display = 'none';
    }

    const btn = document.querySelector('.select-all-btn');
    if (selectedEmployees.length === employees.length) {
        btn.textContent = 'Снять все';
    } else {
        btn.textContent = 'Выбрать всех';
    }
}

async function sendMessage() {
    const messageText = document.getElementById('messageText').value;

    if (selectedEmployees.length === 0) {
        showModal('Ошибка', 'Выберите хотя бы одного сотрудника');
        return;
    }

    if (!messageText.trim()) {
        showModal('Ошибка', 'Введите текст сообщения');
        return;
    }

    console.log(messageText)
    console.log(selectedEmployees)

    try {
        const token = localStorage.getItem('acessToken');
        const fromId = getUserIdFromToken(token);

        if (!token) {           
            console.error('No token found');        
            return;     
        }                           

        const response = await fetch(`${API_URL}/notify`, {         
            method: 'POST',         
            headers: {               
                'Authorization': 'Bearer ' + token,                                                                                                                                                                                                                
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fromId: fromId,
                message: messageText,
                listUserIds: selectedEmployees
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch employees');
        }

        showSuccessModal('Сообщения успешно отправлены', '');
        timeout(2000);

    } catch (error) {
        console.error('Error sending message', error);
    }

    // Reset
    selectedEmployees = [];
    document.getElementById('messageText').value = '';
    const checkboxes = document.querySelectorAll('#recipientsList input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
    updateSelectedCount();
}

// Notifications
async function renderNotifications(page = 0) {
    pageHistory = page;
    const token = localStorage.getItem('acessToken');
    const userId = getUserIdFromToken(token);

    const container = document.getElementById('notificationsList');

    if (!token) {
        console.error('No token found');
        return;
    }

    const response = await fetch(`${API_URL}/message/notification-history/${userId}?page=${page}&size=${PAGE_SIZE_NOTIFICATIONS}`, {
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
                <h3>Уведомлений пока нет((</h3>
                <p>-</p>
            </div>
        `;
        document.getElementById('notificationsPagination').innerHTML = '';
        return;
    }

    // ${!notif.read ? 'unread' : ''}" onclick="markAsRead(${notif.id})

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

function markAsRead(id) {
    const notif = notifications.find(n => n.id === id);
    if (notif) {
        notif.read = true;
        renderNotifications();
        updateStats();
    }
}

// Modal
function showModal(title, message) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    document.getElementById('modal').classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

// Logout
function logout() {
    localStorage.removeItem('acessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '../index.html';
}