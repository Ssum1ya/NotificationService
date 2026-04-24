// API базовый URL
const API_URL = 'http://localhost:8080';

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
function getUserUserIdFromToken(token) {
    const payload = parseJWT(token);
    return payload ? payload.userId : null;
}

// Проверка авторизации при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadProfileData();
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

// Загрузка данных профиля
async function loadProfileData() {
    const token = localStorage.getItem('acessToken');
    const userId = getUserUserIdFromToken(token);

    try {
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
            // Демо-данные
            displayDemoProfile();
        });
    } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
        // Демо-данные
        displayDemoProfile();
    }
}

// Отображение демо-профиля
function displayDemoProfile() {
    const demoProfile = {
        firstName: 'Иван',
        lastName: 'Иванов',
        middleName: 'Иванович',
        birthDate: '15.03.1990',
        gender: 'Мужской',
        email: 'ivan.ivanov@example.com',
        phone: '+7 (999) 123-45-67',
        address: 'г. Москва, ул. Примерная, д. 1, кв. 10',
        position: 'Разработчик',
        department: 'Разработка',
        startDate: '01.01.2020',
        role: 'User'
    };
    
    displayProfile(demoProfile);
}

// Отображение профиля
function displayProfile(profile) {
    // Личная информация
    document.getElementById('firstName').textContent = profile.name || 'Не указано';
    document.getElementById('lastName').textContent = profile.lastName || 'Не указано';
    document.getElementById('middleName').textContent = profile.surname || 'Не указано';
    
    // Контактная информация
    document.getElementById('communication').textContent = profile.communication || 'Не указано';
    document.getElementById('username').textContent = profile.username || 'Не указано';
    
    // Рабочая информация
    document.getElementById('position').textContent = profile.position || 'Не указано';
    document.getElementById('department').textContent = profile.department || 'Не указано';
    document.getElementById('grade').textContent = profile.grade || 'Не указано';
}

// Загрузка количества непрочитанных сообщений
async function loadUnreadMessages() {
    const token = localStorage.getItem('token');
    
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

// Выход из системы
function logout() {
    localStorage.removeItem('acessToken');
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
