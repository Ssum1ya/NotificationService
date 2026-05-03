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
async function renderYoungMessages() {
    const container = document.getElementById('recentNotificationsList');

    const token = localStorage.getItem('acessToken');
    const userId = getUserIdFromToken(token);

    if (!token) {
        console.error('No token found');
        return;
    }

    const response = await fetch(`${API_URL}/message/young-messages/${userId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
    });

    const result = await response.json();
    
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

// Отображение истории сообщений
async function renderMessageHistory() {
    const container = document.getElementById('messageHistoryList');

    const token = localStorage.getItem('acessToken');
    const userId = getUserIdFromToken(token);

    if (!token) {
        console.error('No token found');
        return;
    }

    const response = await fetch(`${API_URL}/message/sending-history/${userId}`, {
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
        return;
    }

    container.innerHTML = result.map(msg => `
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
}

// Applications
async function renderApplications() {

    const token = localStorage.getItem('acessToken');

    if (!token) {
        console.error('No token found');
        return;
    }

    const depId = getUserDepIdFromToken(token);

    const response = await fetch(`${API_URL}/profile/head/departament-requests/${depId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
    });

    const result = await response.json();

    if (!result || result.length === 0) {
        return;
    }

    const requestsLength = result.length;

    document.getElementById('statApplications').textContent = requestsLength;
    document.getElementById('applicationsBadge').textContent = requestsLength;

    if (requestsLength === 0) {
        document.getElementById('applicationsBadge').style.display = 'none';
    } else {
        document.getElementById('applicationsBadge').style.display = 'inline-block';
    }

    const container = document.getElementById('applicationsList');

    container.innerHTML = result.map(app => {
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
}

// Отклонение заявки
async function rejectRequest(requestId, userName) {
    if (!confirm(`Отклонить заявку от ${userName}?`)) {
        return;
    }

    const token = localStorage.getItem('acessToken');

    // Запрос на бэкенд
    fetch(`${API_URL}/user/head/declineRequest/${requestId}`, {
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

    fetch(`${API_URL}/user/head/approveRequest/${userId}`, {
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

function closeProfileModal() {
    document.getElementById('profileModal').classList.remove('show');
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

// Staff
async function renderStaff() {
    try {
        const token = localStorage.getItem('acessToken');
        const depId = getUserDepIdFromToken(token);

        if (!token) {
            console.error('No token found');
            return;
        }

        const response = await fetch(`${API_URL}/profile/head/departament-employees/${depId}`, {
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

         document.getElementById('statEmployees').textContent = employees.length;

        const tbody = document.getElementById('staffTableBody');

        if (!employees || employees.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5">Нет сотрудников</td></tr>`;
            return;
        }

        tbody.innerHTML = employees.map(emp => `
            <tr>
                <td>
                    <div class="employee-cell">
                        <div class="employee-avatar">${getInitials(emp.name)}</div>
                        <span class="employee-name">${emp.name}</span>
                    </div>
                </td>
                <td>${emp.position}</td>
                <td>${emp.department}</td>
                <td>${emp.communication.toLowerCase()}</td>
                <td>${emp.username}</td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error loading employees:', error);

        const tbody = document.getElementById('staffTableBody');
        tbody.innerHTML = `<tr><td colspan="5">Ошибка загрузки</td></tr>`;
    }
}

// Messages
async function renderRecipients() {

    try {
        const token = localStorage.getItem('acessToken');
        const depId = getUserDepIdFromToken(token);

        if (!token) {
            console.error('No token found');
            return;
        }

        const response = await fetch(`${API_URL}/profile/head/departament-employees-for-notification/${depId}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch employees');
        }

        const employeesForNotification = await response.json();

        employees = employeesForNotification;

        const container = document.getElementById('recipientsList');
        container.innerHTML = employeesForNotification.map(emp => `
            <label class="recipient-item">
                <input type="checkbox" value="${emp.id}" onchange="toggleRecipient('${emp.id}')">
                <div class="employee-avatar">${getInitials(emp.name)}</div>
                <div style="flex: 1;">
                    <div class="employee-name">${emp.name}</div>
                    <div style="color: #64748b; font-size: 14px;">${emp.position}</div>
                </div>
            </label>
        `).join('');


    } catch (error) {
        console.error('Error loading employees:', error);

        const tbody = document.getElementById('staffTableBody');
        tbody.innerHTML = `<tr><td colspan="5">Ошибка загрузки</td></tr>`;
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
async function renderNotifications() {

    const token = localStorage.getItem('acessToken');
    const userId = getUserIdFromToken(token);

    if (!token) {
        console.error('No token found');
        return;
    }

    const response = await fetch(`${API_URL}/message/notification-history/${userId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
    });

    const result = await response.json();

    // ${!notif.read ? 'unread' : ''}" onclick="markAsRead(${notif.id})

    const container = document.getElementById('notificationsList');
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
