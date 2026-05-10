const API_URL = 'http://localhost:8080';
 
function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
 
function getUserRoleFromToken(token) {
    const payload = parseJWT(token);
    return payload ? payload.role : null;
}
 
function getUserIdFromToken(token) {
    const payload = parseJWT(token);
    return payload ? payload.userId : null;
}
 
// Проверка авторизации при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('acessToken');
    if (!token) {
        window.location.href = '../index.html';
        return;
    }
 
    // Проверка роли из JWT
    const userRole = getUserRoleFromToken(token);
    if (userRole !== 'Admin') {
        showErrorModal({"message": "Нет доступа"})
        timeout(2000);
        window.location.href = '../index.html';
        return;
    }
 
    // Загрузка департаментов
    loadDepartments();
 
    renderRecipients();
    renderMessageHistory();
    // renderNotifications();
    // updateNotificationsBadge();
 
    // Загрузка заявок
    loadRequests();
 
    // Загрузка всех пользователей
    loadAllUsers();
});
 
// Отображение истории сообщений
async function renderMessageHistory(page = 0) {
    pageHistory = page;
    const container = document.getElementById('messageHistoryList');
    const token = localStorage.getItem('acessToken');
    const userId = getUserIdFromToken(token);
    if (!token) return;
 
    container.innerHTML = '<div class="empty-state"><p>Загрузка...</p></div>';
 
    try {
        const response = await fetch(
            `${API_URL}/message/sending-history/${userId}?page=${page}&size=${PAGE_SIZE_HISTORY}`,
            {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
            }
        );
        const result = await response.json();
        // result: { content: [...], page, size, totalElements, totalPages }
 
        if (!result.content || result.content.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                    </svg>
                    <h3>Нет отправленных сообщений</h3>
                    <p>История сообщений пуста</p>
                </div>`;
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
    } catch (error) {
        console.error('Ошибка загрузки истории:', error);
        container.innerHTML = '<div class="empty-state"><p>Ошибка загрузки</p></div>';
    }
}
 
 
allRecipientsCache = []
currentDeptFilter = ''
 
// Кэш департаментов — заполняется при loadDepartments()
let cachedDepartments = [];
 
// Кэш редактируемого пользователя
let currentAdminEditUserId = null;
 
let allEmployees = [
    { id: 1, name: 'Кузнецов Алексей', position: 'Senior Developer', department: 'Разработка' },
    { id: 2, name: 'Смирнова Ольга', position: 'Team Lead', department: 'Разработка' },
    { id: 3, name: 'Волков Дмитрий', position: 'Middle Developer', department: 'Разработка' },
    { id: 4, name: 'Морозова Елена', position: 'QA Engineer', department: 'Тестирование' },
    { id: 5, name: 'Новиков Сергей', position: 'DevOps', department: 'Инфраструктура' }
];
 
let selectedEmployees = [];
let employees;
 
// ── Состояние пагинации ──────────────────────────────────────────────────────
const PAGE_SIZE_REQUESTS   = 6;
const PAGE_SIZE_USERS      = 6;
const PAGE_SIZE_HISTORY    = 5;
const PAGE_SIZE_RECIPIENTS = 4;
const PAGE_SIZE_EMPLOYEES  = 5;
 
// Текущие страницы
let pageRequests   = 0;
let pageUsers      = 0;
let pageHistory    = 0;
let pageRecipients = 0;
 
// departmentId открытого модала сотрудников
let currentDeptModalId   = null;
let currentDeptModalName = null;
let pageEmployees        = 0;
 
// Фильтр пользователей
let usersActiveDeptFilter = '';
// ────────────────────────────────────────────────────────────────────────────
 
let messageHistory = [];
let notifications = [];
 
 
// ── Универсальный рендер пагинации ──────────────────────────────────────────
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
// ────────────────────────────────────────────────────────────────────────────
 
function switchSection(event, sectionName) {
    event.preventDefault();
 
    // Убираем active у всех вкладок
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
 
    // Добавляем active к выбранной вкладке
    event.currentTarget.classList.add('active');
 
    // Скрываем все секции
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
 
    console.log(sectionName)
 
    // Показываем выбранную секцию
    document.getElementById(sectionName + '-section').classList.add('active');
 
    // Загружаем данные для секции
    if (sectionName === 'requests') {
        loadRequests();
    } else if (sectionName === 'departments') {
        loadDepartments();
    } else if (sectionName === 'users') {
        loadAllUsers();
    }
}
 
// Отображение списка получателей
async function renderRecipients(page = 0) {
    pageRecipients = page;
    const token = localStorage.getItem('acessToken');
    if (!token) return;
 
    const container = document.getElementById('recipientsList');
 
    try {
        const deptFilter = document.getElementById('recipientsDeptFilter');
        const dept = deptFilter ? deptFilter.value : '';
 
        let url = `${API_URL}/profile/admin/users-for-notification?page=${page}&size=${PAGE_SIZE_RECIPIENTS}`;
        if (dept) url += `&departmentName=${encodeURIComponent(dept)}`;
 
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
        });
 
        if (!response.ok) throw new Error('Failed to fetch recipients');
        const result = await response.json();
        // result: { content: [...], page, size, totalElements, totalPages }
 
        // Кэшируем для toggleSelectAll
        allRecipientsCache = result.content;
        employees = result.content;
 
        // Заполняем фильтр по департаментам из cachedDepartments (один раз)
        if (page === 0 && deptFilter && cachedDepartments.length > 0) {
            const cur = deptFilter.value;
            deptFilter.innerHTML = '<option value="">Все департаменты</option>' +
                cachedDepartments.map(d =>
                    `<option value="${d.name}" ${cur === d.name ? 'selected' : ''}>${d.name}</option>`
                ).join('');
        }
 
        renderRecipientsList(result.content);
        renderPagination('recipientsPagination', page, result.totalPages, 'renderRecipients');
 
    } catch (error) {
        console.error('Error loading recipients:', error);
        container.innerHTML = '<div style="padding:12px;color:#ef4444;">Ошибка загрузки</div>';
    }
}
 
// Отрисовка списка получателей
function renderRecipientsList(list) {
    const container = document.getElementById('recipientsList');
 
    if (!list || list.length === 0) {
        container.innerHTML = '<div style="padding:12px;color:#6b7280;">Нет пользователей</div>';
        return;
    }
 
    container.innerHTML = list.map(emp => `
        <label class="recipient-item">
            <input type="checkbox"
                value="${emp.id}"
                onchange="toggleRecipient('${emp.id}')"
                ${selectedEmployees.includes(emp.id) ? 'checked' : ''}>
            <div class="employee-avatar ${emp.role === 'Head' ? 'avatar--head' : ''}">${getInitials(emp.name)}</div>
            <div class="recipient-info">
                <div class="recipient-name-row">
                    <span class="recipient-name">${emp.name}</span>
                    ${emp.role === 'Head' ? '<span class="recipient-role-badge">Глава отдела</span>' : ''}
                </div>
                <div class="recipient-position">${emp.position || '—'}</div>
                <div class="recipient-dept">${emp.department || '—'}</div>
            </div>
        </label>
    `).join('');
}
 
// Фильтрация получателей — сбрасываем на страницу 0
function filterRecipientsByDept() {
    selectedEmployees = [];
    updateSelectedCount();
    renderRecipients(0);
}
 
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('');
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
    renderMessageHistory();
}
 
// Загрузка департаментов
function loadDepartments() {
    const token = localStorage.getItem('acessToken');
 
    // Пример запроса на бэкенд
    fetch(`${API_URL}/departament/get-all`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        displayDepartments(data);
    })
    .catch(error => {
        console.error('Ошибка загрузки департаментов:', error);
        // Демо данные для тестирования
        displayDepartments([
            {
                id: 1,
                name: 'Разработка',
                headName: 'Иван Иванов',
                employeeCount: 12
            },
            {
                id: 2,
                name: 'Тестирование',
                headName: null,
                employeeCount: 8
            },
            {
                id: 3,
                name: 'Дизайн',
                headName: 'Мария Петрова',
                employeeCount: 5
            }
        ]);
    });
}
 
// Отображение департаментов
function displayDepartments(departments) {
    cachedDepartments = departments; // сохраняем для использования в других вкладках
 
    // Заполняем фильтр департаментов во вкладке пользователей
    const deptFilter = document.getElementById('usersDeptFilter');
    if (deptFilter) {
        const current = deptFilter.value;
        deptFilter.innerHTML = '<option value="">Все департаменты</option>' +
            departments.map(d => `<option value="${d.id}" ${current === String(d.id) ? 'selected' : ''}>${d.name}</option>`).join('');
    }
 
    const grid = document.getElementById('departmentsGrid');
 
    if (departments.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                <p>Департаменты не найдены</p>
            </div>
        `;
        return;
    }
 
    grid.innerHTML = departments.map(dept => `
        <div class="department-card">
            <div class="department-card-header">
                <div>
                    <div class="department-name">${dept.name}</div>
                </div>
            </div>
 
            ${dept.headName ? `
                <div class="department-head">
                    👤 Глава: ${dept.headName}
                </div>
            ` : `
                <div class="department-head" style="background: #fef2f2; color: #991b1b;">
                    ⚠️ Глава не назначен
                </div>
            `}
 
            <div class="department-stats">
                <div class="stat-item">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                    </svg>
                    ${dept.employeeCount || 0} сотрудников
                </div>
            </div>
 
            <div class="department-actions">
                <button class="btn-small" onclick="viewEmployees('${dept.id}', '${dept.name}')">
                    Сотрудники
                </button>
                <button class="btn-delete" onclick="deleteDepartment('${dept.id}', '${dept.name}')">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}
 
// Открытие модального окна добавления департамента
function openAddDepartmentModal() {
    document.getElementById('addDepartmentModal').classList.add('show');
}
 
// Закрытие модального окна добавления департамента
function closeAddDepartmentModal() {
    document.getElementById('addDepartmentModal').classList.remove('show');
    document.getElementById('addDepartmentForm').reset();
}
 
// Обработка формы добавления департамента
document.getElementById('addDepartmentForm').addEventListener('submit', async function(e) {
    e.preventDefault();
 
    const name = document.getElementById('departmentName').value;
    const token = localStorage.getItem('acessToken');
 
    try {
        const response = await fetch(`${API_URL}/departament/create`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name
            })
        });
 
        let data;
 
        try {
            data = await response.json();
        } catch {
            data = { message: 'Ошибка обработки ответа сервера' };
        }
 
        if (!response.ok) {
            console.error('Ошибка от сервера:', data);
            throw new Error(data.message || `Ошибка ${response.status}`);
        }
 
        if (data.code === 'VALIDATION_FAILED') {
            showErrorModal(data);
            return;
        }
 
        closeAddDepartmentModal();
        showSuccessModal(
            'Департамент создан!',
            'Новый департамент успешно добавлен в систему.'
        );
 
        setTimeout(() => {
            loadDepartments();
        }, 1500);
 
    } catch (error) {
        console.error('Ошибка:', error);
        showErrorModal({ message: error.message });
    }
});
 
// Просмотр сотрудников департамента
function viewEmployees(departmentId, departmentName) {
    currentDeptModalId   = departmentId;
    currentDeptModalName = departmentName;
    pageEmployees        = 0;
    document.getElementById('employeesModal').classList.add('show');
    loadEmployees(0);
}
 
async function loadEmployees(page = 0) {
    pageEmployees = page;
    const token = localStorage.getItem('acessToken');
    const list = document.getElementById('employeesList');
 
    document.getElementById('employeesModalTitle').textContent =
        `Сотрудники: ${currentDeptModalName}`;
    list.innerHTML = '<div class="empty-state"><p>Загрузка...</p></div>';
 
    try {
        const response = await fetch(
            `${API_URL}/profile/admin/departament-employees/${currentDeptModalId}?page=${page}&size=${PAGE_SIZE_EMPLOYEES}`,
            {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
            }
        );
        const result = await response.json();
        // result: { content: [...], page, size, totalElements, totalPages }
 
        displayEmployees(result.content);
        renderPagination('employeesPagination', page, result.totalPages, 'loadEmployees');
    } catch (error) {
        console.error('Ошибка загрузки сотрудников:', error);
        list.innerHTML = '<div class="empty-state"><p>Ошибка загрузки</p></div>';
    }
}
 
// Отображение сотрудников
function displayEmployees(emps) {
    const list = document.getElementById('employeesList');
 
    if (!emps || emps.length === 0) {
        list.innerHTML = '<div class="empty-state"><p>В этом департаменте пока нет сотрудников</p></div>';
        return;
    }
 
    list.innerHTML = emps.map(emp => `
        <div class="employee-card">
            <div class="employee-info">
                <div class="employee-name">${emp.lastName} ${emp.firstName}</div>
                <div class="employee-position">${emp.position}</div>
            </div>
            ${emp.isHead ? '<span class="employee-badge">Глава департамента</span>' : ''}
        </div>
    `).join('');
}
 
// Закрытие модального окна сотрудников
function closeEmployeesModal() {
    document.getElementById('employeesModal').classList.remove('show');
}
 
// Модальные окна
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
 
// Просмотр профиля пользователя
function viewProfile(userId) {
    const token = localStorage.getItem('acessToken');
 
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
 
// Отображение профиля
function displayProfile(profile) {
    const content = document.getElementById('profileContent');
 
    const registeredDate = new Date(profile.registeredAt);
    const formattedDate = registeredDate.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
 
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
                    <div class="profile-value">${profile.communication}</div>
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
 
// Закрытие модального окна профиля
function closeProfileModal() {
    document.getElementById('profileModal').classList.remove('show');
}
 
// Закрытие модальных окон при клике вне их
window.addEventListener('click', function(event) {
    const modals = ['addDepartmentModal', 'employeesModal', 'successModal', 'errorModal', 'profileModal', 'adminProfileModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    });
});
 
// ── Все пользователи ────────────────────────────────────────────────────────
 
let allUsersCache = [];
let filteredUsersCache = [];
 
async function loadAllUsers(page = 0) {
    pageUsers = page;
    const token = localStorage.getItem('acessToken');
    const container = document.getElementById('usersListContainer');
    if (!container) return;
 
    container.innerHTML = '<div class="empty-state"><p>Загрузка...</p></div>';
 
    let url = `${API_URL}/profile/admin/all-user-profiles?page=${page}&size=${PAGE_SIZE_USERS}`;
    if (usersActiveDeptFilter) {
        url += `&departmentName=${encodeURIComponent(usersActiveDeptFilter)}`;
    }
 
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
        });
 
        if (!response.ok) throw new Error('Ошибка загрузки');
        const result = await response.json();
        // result: { content: [...], page, size, totalElements, totalPages }
        allUsersCache = result.content;
 
        // Заполняем фильтр департаментов из cachedDepartments
        const deptFilter = document.getElementById('usersDeptFilter');
        if (deptFilter && cachedDepartments.length > 0) {
            const cur = deptFilter.value;
            deptFilter.innerHTML = '<option value="">Все департаменты</option>' +
                cachedDepartments.map(d =>
                    `<option value="${d.name}" ${cur === d.name ? 'selected' : ''}>${d.name}</option>`
                ).join('');
        }
 
        renderUsersList(result.content);
        renderPagination('usersPagination', page, result.totalPages, 'loadAllUsers');
    } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
        container.innerHTML = '<div class="empty-state"><p>Ошибка загрузки пользователей</p></div>';
    }
}
 
function renderUsersList(users) {
    const container = document.getElementById('usersListContainer');
 
    if (!users || users.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <p>Пользователей не найдено</p>
            </div>`;
        return;
    }
 
    const statusLabel = { APPROVED: 'Одобрено', DECLINED: 'Отклонено', PENDING: 'Ожидает' };
    const statusClass = { APPROVED: 'status-approved', DECLINED: 'status-declined', PENDING: 'status-pending' };
 
    container.innerHTML = users.map(u => `
        <div class="user-card" data-id="${u.id}">
            <div class="user-card-main">
                <div class="user-avatar ${u.role === 'Head' ? 'user-avatar--head' : ''}">${getAdminInitials(u.lastName, u.name)}</div>
                <div class="user-card-info">
                    <div class="user-card-name-row">
                        <span class="user-card-name">${u.lastName} ${u.name}${u.surname ? ' ' + u.surname : ''}</span>
                        ${u.role === 'Head' ? '<span class="role-badge role-head">Глава отдела</span>' : ''}
                    </div>
                    <div class="user-card-meta">${u.position} · ${u.grade}</div>
                    <div class="user-card-dept">${u.departmentName || '—'}</div>
                    <div class="user-card-statuses">
                        <span class="status-badge ${statusClass[u.requestStatusAdmin] || ''}">
                            Админ: ${statusLabel[u.requestStatusAdmin] || u.requestStatusAdmin}
                        </span>
                        <span class="status-badge ${statusClass[u.requestStatusHead] || ''}">
                            Глава: ${statusLabel[u.requestStatusHead] || u.requestStatusHead}
                        </span>
                    </div>
                </div>
            </div>
            <div class="user-card-actions">
                <button class="btn-small" onclick="openAdminUserProfile('${u.id}')">
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    Профиль
                </button>
            </div>
        </div>
    `).join('');
}
 
function filterUsersByDepartment() {
    const select = document.getElementById('usersDeptFilter');
    const deptName = select.options[select.selectedIndex].text;
    const deptId = select.value;
 
    usersActiveDeptFilter = deptId ? deptName : '';
    loadAllUsers(0); // всегда на первую страницу при смене фильтра
 
    if (!deptId) {
        return; // loadAllUsers уже всё сделает
    } else {
        const filtered = allUsersCache.filter(u => u.departmentName === deptName);
        renderUsersList(filtered);
    }
}
 
function getAdminInitials(lastName, name) {
    const l = lastName ? lastName[0] : '';
    const n = name ? name[0] : '';
    return (l + n).toUpperCase();
}
 
// ── Открытие профиля пользователя для редактирования (Админ) ──
 
function openAdminUserProfile(userId) {
    const user = allUsersCache.find(u => u.id === userId);
 
    if (!user) {
        showErrorModal({ message: 'Пользователь не найден в списке. Обновите страницу.' });
        return;
    }
 
    currentAdminEditUserId = userId;
    renderAdminUserProfileEdit(user);
}
 
function renderAdminUserProfileEdit(p) {
    const content = document.getElementById('adminProfileContent');
 
    const gradeOptions = ['Junior', 'Middle', 'Senior', 'Lead']
        .map(g => `<option value="${g}" ${p.grade === g ? 'selected' : ''}>${g}</option>`)
        .join('');
 
    const positionOptions = ['Developer', 'Tester', 'Analyst', 'Designer', 'Manager', 'Devops', 'DataScientist']
        .map(p => `<option value="${p}" ${p.position === p ? 'selected' : ''}>${p}</option>`)
        .join('');
 
    const roleOptions = ['User', 'Head', 'Admin']
        .map(r => `<option value="${r}" ${p.role === r ? 'selected' : ''}>${r}</option>`)
        .join('');
 
    // communication в кэше приходит в верхнем регистре (EMAIL, TELEGRAM, VK)
    const commNormalized = p.communication ? p.communication.toLowerCase() : '';
 
    const commOptions = [
        { value: 'telegram', label: 'Telegram' },
        { value: 'email',    label: 'Mail' },
        { value: 'vk',       label: 'Vk' },
    ].map(c => `<option value="${c.value}" ${commNormalized === c.value ? 'selected' : ''}>${c.label}</option>`).join('');
 
    const deptOptions = cachedDepartments.length > 0
        ? cachedDepartments.map(d => `<option value="${d.id}" ${p.departmentName === d.name ? 'selected' : ''}>${d.name}</option>`).join('')
        : `<option value="">Загрузка...</option>`;
 
    const reqStatusAdminOptions = ['APPROVED', 'DECLINED', 'PENDING']
        .map(s => `<option value="${s}" ${p.requestStatusAdmin === s ? 'selected' : ''}>${s}</option>`)
        .join('');
 
    const reqStatusHeadOptions = ['APPROVED', 'DECLINED', 'PENDING']
        .map(s => `<option value="${s}" ${p.requestStatusHead === s ? 'selected' : ''}>${s}</option>`)
        .join('');
 
    content.innerHTML = `
        <div class="admin-profile-grid">
 
            <div class="ap-section">
                <div class="ap-section-title">Личная информация</div>
                <div class="ap-field">
                    <label class="ap-label">Фамилия</label>
                    <input class="ap-input" id="ap-lastName" type="text" value="${p.lastName || ''}" oninput="clearApError(this)"/>
                </div>
                <div class="ap-field">
                    <label class="ap-label">Имя</label>
                    <input class="ap-input" id="ap-name" type="text" value="${p.name || ''}" oninput="clearApError(this)"/>
                </div>
                <div class="ap-field">
                    <label class="ap-label">Отчество</label>
                    <input class="ap-input" id="ap-surname" type="text" value="${p.surname || ''}" oninput="clearApError(this)"/>
                </div>
            </div>
 
            <div class="ap-section">
                <div class="ap-section-title">Контактная информация</div>
                <div class="ap-field">
                    <label class="ap-label">Средство связи</label>
                    <select class="ap-input" id="ap-communication" onchange="updateApContactLabel()">
                        <option value="">Выберите</option>
                        ${commOptions}
                    </select>
                </div>
                <div class="ap-field">
                    <label class="ap-label" id="ap-username-label">Контактные данные</label>
                    <input class="ap-input" id="ap-username" type="text" value="${p.username || ''}" oninput="clearApError(this)"/>
                </div>
            </div>
 
            <div class="ap-section">
                <div class="ap-section-title">Рабочая информация</div>
                <div class="ap-field">
                    <label class="ap-label">Должность</label>
                    <select class="ap-input" id="ap-position">${positionOptions}</select>
                </div>
                <div class="ap-field">
                    <label class="ap-label">Грейд</label>
                    <select class="ap-input" id="ap-grade">${gradeOptions}</select>
                </div>
                <div class="ap-field">
                    <label class="ap-label">Департамент</label>
                    <select class="ap-input" id="ap-departmentId">
                        <option value="">Без департамента</option>
                        ${deptOptions}
                    </select>
                </div>
            </div>
 
            <div class="ap-section">
                <div class="ap-section-title">Системная информация</div>
                <div class="ap-field">
                    <label class="ap-label">Роль</label>
                    <select class="ap-input" id="ap-role">${roleOptions}</select>
                </div>
                <div class="ap-field">
                    <label class="ap-label">Статус заявки (Админ)</label>
                    <select class="ap-input" id="ap-requestStatusAdmin">${reqStatusAdminOptions}</select>
                </div>
                <div class="ap-field">
                    <label class="ap-label">Статус заявки (Глава)</label>
                    <select class="ap-input" id="ap-requestStatusHead">${reqStatusHeadOptions}</select>
                </div>
            </div>
 
        </div>`;
 
    document.getElementById('adminProfileModalTitle').textContent =
        `Редактирование: ${p.lastName} ${p.name}`;
 
    document.getElementById('adminProfileModal').classList.add('show');
    updateApContactLabel();
}
 
async function saveAdminUserProfile() {
    const token = localStorage.getItem('acessToken');
 
    const fields = {
        lastName:            document.getElementById('ap-lastName').value.trim(),
        name:                document.getElementById('ap-name').value.trim(),
        surname:             document.getElementById('ap-surname').value.trim(),
        communication:       document.getElementById('ap-communication').value.toUpperCase(),
        username:            document.getElementById('ap-username').value.trim(),
        position:            document.getElementById('ap-position').value.trim(),
        grade:               document.getElementById('ap-grade').value,
        departmentId:        document.getElementById('ap-departmentId').value || null,
        role:                document.getElementById('ap-role').value,
        requestStatusAdmin:  document.getElementById('ap-requestStatusAdmin').value,
        requestStatusHead:   document.getElementById('ap-requestStatusHead').value,
    };
 
    // Валидация обязательных полей
    const required = { lastName: 'Фамилия', name: 'Имя', position: 'Должность', username: 'Контактные данные' };
    for (const [field, label] of Object.entries(required)) {
        if (!fields[field]) {
            showErrorModal({ message: `Поле "${label}" не может быть пустым.` });
            const el = document.getElementById('ap-' + field);
            if (el) { el.style.borderColor = '#dc2626'; el.focus(); }
            return;
        }
    }
 
    try {
        const response = await fetch(`${API_URL}/profile/admin/${currentAdminEditUserId}`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(fields)
        });
 
        if (response.ok) {
            closeAdminProfileModal();
            showSuccessModal('Готово!', 'Профиль пользователя успешно обновлён.');
            loadAllUsers();
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
 
function updateApContactLabel() {
    const value = document.getElementById('ap-communication').value;
    const label = document.getElementById('ap-username-label');
    const input = document.getElementById('ap-username');
    if (!label || !input) return;
 
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
 
function clearApError(el) {
    el.style.borderColor = '';
}
 
function closeAdminProfileModal() {
    document.getElementById('adminProfileModal').classList.remove('show');
    currentAdminEditUserId = null;
}
 
// ────────────────────────────────────────────────────────────────────────────
// Выход
function logout() {
    localStorage.removeItem('acessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '../index.html';
}
 
// Удаление департамента
function deleteDepartment(departmentId, departmentName) {
    if (!confirm(`Вы уверены, что хотите удалить департамент "${departmentName}"?\n\nВсе сотрудники будут откреплены от департамента.`)) {
        return;
    }
 
    const token = localStorage.getItem('acessToken');
 
    // Запрос на бэкенд
    fetch(`${API_URL}/departament/${departmentId}`, {
        method: 'DELETE',
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
            showSuccessModal('Департамент удален!', `Департамент "${departmentName}" успешно удален из системы.`);
            setTimeout(() => {
                loadDepartments();
            }, 1500);
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
        // Демо режим
        showSuccessModal('Департамент удален!', `Департамент "${departmentName}" успешно удален из системы.`);
        setTimeout(() => {
            loadDepartments();
        }, 1500);
    });
}
 
// Загрузка заявок на вступление
async function loadRequests(page = 0) {
    pageRequests = page;
    const token = localStorage.getItem('acessToken');
    const list = document.getElementById('requestsList');
    list.innerHTML = '<div class="empty-state"><p>Загрузка...</p></div>';
 
    try {
        const response = await fetch(
            `${API_URL}/profile/admin/departament-requests?page=${page}&size=${PAGE_SIZE_REQUESTS}`,
            {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
            }
        );
        const result = await response.json();
        // result: { content: [...], page, size, totalElements, totalPages }
        updateRequestsBadge(result.totalElements);
        displayRequests(result.content);
        renderPagination('requestsPagination', page, result.totalPages, 'loadRequests');
    } catch (error) {
        console.error('Ошибка загрузки заявок:', error);
        list.innerHTML = '<div class="empty-state"><p>Ошибка загрузки заявок</p></div>';
    }
}
 
// Отображение заявок
function displayRequests(requests) {
    const list = document.getElementById('requestsList');
 
    if (requests.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <p>Нет новых заявок</p>
            </div>
        `;
        return;
    }
 
    list.innerHTML = requests.map(req => {
        const headStatus = req.requestStatus;
        let status;
 
        if (headStatus === 'APPROVED') {
            status = "Одобрено главой отдела";
        } else if (headStatus === 'DECLINED') {
            status = "Откланено главой отдела";
        } else {
            status = "В ожидании просмотра главы"
        }
 
 
        return `
            <div class="request-card">
                <div class="request-info">
                    <div class="request-header">
                        <div class="request-user">${req.userName}</div>
                        <div class="request-status ${status}">
                            ${status}
                        </div>
                    </div>
                    <div class="request-details">
                        <div class="request-detail-item">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                            </svg>
                            Департамент: ${req.departmentName}
                        </div>
                        <div class="request-detail-item">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                            Позиция: ${req.position}
                        </div>
                    </div>
                </div>
                <div class="request-actions">
                    <button class="btn-small" onclick="viewProfile('${req.userId}')" style="margin-right: 8px;">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="display: inline-block; vertical-align: middle; margin-right: 4px;">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        Профиль
                    </button>
                    <button class="btn-approve" onclick="approveRequest('${req.userId}', '${req.userName}', '${req.departmentName}')">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        Принять
                    </button>
                    <button class="btn-approve" onclick="makeHead('${req.userId}', '${req.departmentName}')">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3-1.567-3-3.5S10.343 1 12 1s3 1.567 3 3.5S13.657 8 12 8zM5 22c0-3.866 3.582-7 8-7s8 3.134 8 7"/>
                        </svg>
                        Назначить главой
                    </button>
                    <button class="btn-reject" onclick="rejectRequest('${req.userId}', '${req.userName}')">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                        Отклонить
                    </button>
                </div>
            </div>
        `;
    }).join('');
}
 
// Обновление счетчика заявок
function updateRequestsBadge(count) {
    const badge = document.getElementById('requestsBadge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
}
 
async function makeHead(userId, departmentName) {
    const token = localStorage.getItem('acessToken');
 
    try {
        const response = await fetch(`${API_URL}/user/admin/makeHead/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        })
 
        let data;
 
        try {
            data = await response.json();
        } catch {
            data = { message: 'Ошибка ответа сервера' };
        }
 
        if (!response.ok) {
            console.error('Ошибка от сервера:', data);
            throw new Error(data.message);
        }
 
        showSuccessModal('Пользователь успешно назначен главой отдела', '');
            setTimeout(() => {
                loadRequests();
            }, 1500);
 
    } catch (error) {
        console.error('Ошибка:', error);
        showErrorModal({ message: error.message });
    }
 
 
 
 
    // fetch(`${API_URL}/user/admin/makeHead/${userId}`, {
    //     method: "PUT",
    //     headers: {
    //         'Authorization': 'Bearer ' + token,
    //         "Content-Type": "application/json"
    //     }
    // })
    // .then(response => {
    //     if (!response.ok) {
    //         throw new Error("Ошибка запроса: " + response.status);
    //     }
 
    //     return;
    // })
    // .then(() => {
    //     showSuccessModal('Пользователь успешно назначен главой отдела', '');
    //     return timeout(2000);
    // })
    // .then(() => {
    //     loadRequests();
    // })
    // .catch(err => {
    //     console.error(err);
    //     showErrorModal("Ошибка");
    // });
}
 
// Одобрение заявки
function approveRequest(userId, userName, departmentName) {
    const token = localStorage.getItem('acessToken');
 
    // Запрос на бэкенд
    fetch(`${API_URL}/user/admin/approveRequest/${userId}`, {
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
            showSuccessModal('Заявка одобрена!', `${userName} добавлен в департамент "${departmentName}".`);
            setTimeout(() => {
                loadRequests();
            }, 1500);
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
        // Демо режим
        showSuccessModal('Заявка одобрена!', `${userName} добавлен в департамент "${departmentName}".`);
        setTimeout(() => {
            loadRequests();
        }, 1500);
    });
}
 
// Отклонение заявки
async function rejectRequest(requestId, userName) {
    if (!confirm(`Отклонить заявку от ${userName}?`)) {
        return;
    }
 
    const token = localStorage.getItem('acessToken');
 
    // Запрос на бэкенд
    fetch(`${API_URL}/user/admin/declineRequest/${requestId}`, {
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
            setTimeout(() => {
                loadRequests();
            }, 1500);
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