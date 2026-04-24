const API_URL = 'http://localhost:8080';

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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

    // Загрузка заявок
    loadRequests();
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
                <button class="btn-delete" onclick="deleteDepartment'(${dept.id}', '${dept.name}')">
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
    const token = localStorage.getItem('acessToken');

    document.getElementById('employeesModalTitle').textContent = `Сотрудники: ${departmentName}`;

    // Запрос на бэкенд
    fetch(`${API_URL}/profile/admin/departament-employees/${departmentId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        displayEmployees(data, departmentId);
    })
    .catch(error => {
        console.error('Ошибка загрузки сотрудников:', error);
        // Демо данные
        displayEmployees([
            {
                id: 1,
                firstName: 'Иван',
                lastName: 'Иванов',
                position: 'Senior Developer',
                isHead: true
            },
            {
                id: 2,
                firstName: 'Петр',
                lastName: 'Петров',
                position: 'Middle Developer',
                isHead: false
            },
            {
                id: 3,
                firstName: 'Мария',
                lastName: 'Сидорова',
                position: 'Junior Developer',
                isHead: false
            }
        ], departmentId);
    });

    document.getElementById('employeesModal').classList.add('show');
}

// Отображение сотрудников
function displayEmployees(employees, departmentId) {
    const list = document.getElementById('employeesList');

    if (employees.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <p>В этом департаменте пока нет сотрудников</p>
            </div>
        `;
        return;
    }

    list.innerHTML = employees.map(emp => `
        <div class="employee-card">
            <div class="employee-info">
                <div class="employee-name">${emp.lastName} ${emp.firstName}</div>
                <div class="employee-position">${emp.position}</div>
            </div>
            ${emp.isHead ? `
                <span class="employee-badge">Глава департамента</span>
            ` : `
            `}
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
    const modals = ['addDepartmentModal', 'employeesModal', 'successModal', 'errorModal', 'profileModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    });
});

// Выход
function logout() {
    localStorage.removeItem('acessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '../index.html';
}

// Переключение между секциями
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

    // Показываем выбранную секцию
    document.getElementById(sectionName + '-section').classList.add('active');

    // Загружаем данные для секции
    if (sectionName === 'requests') {
        loadRequests();
    } else if (sectionName === 'departments') {
        loadDepartments();
    }
}

// Удаление департамента
function deleteDepartment(departmentId, departmentName) {
    if (!confirm(`Вы уверены, что хотите удалить департамент "${departmentName}"?\n\nВсе сотрудники будут откреплены от департамента.`)) {
        return;
    }

    const token = localStorage.getItem('acessToken');

    // Запрос на бэкенд
    fetch(`/api/departments/${departmentId}`, {
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
function loadRequests() {
    const token = localStorage.getItem('acessToken');

    // Запрос на бэкенд
    fetch(`${API_URL}/profile/admin/departament-requests`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        displayRequests(data);
        updateRequestsBadge(data.length);
    })
    .catch(error => {
        console.error('Ошибка загрузки заявок:', error);
        // Демо данные
        const demoRequests = [
            {
                userId: 101,
                userName: 'Петров Петр Петрович',
                departmentId: 1,
                departmentName: 'Разработка',
                position: 'Middle Developer'
            },
            {
                userId: 102,
                userName: 'Сидорова Анна Ивановна',
                departmentId: 2,
                departmentName: 'Тестирование',
                position: 'Senior QA Engineer'
            },
            {
                userId: 103,
                userName: 'Козлов Дмитрий Сергеевич',
                departmentId: 1,
                departmentName: 'Разработка',
                position: 'Junior Developer'
            }
        ];
        displayRequests(demoRequests);
        updateRequestsBadge(demoRequests.length);
    });
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