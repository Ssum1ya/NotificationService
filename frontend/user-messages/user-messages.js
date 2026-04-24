// API базовый URL
const API_BASE_URL = 'http://localhost:8000/api'; // Замените на ваш URL

// Текущий выбранный диалог
let currentChatId = null;
let currentChatUser = null;

// Проверка авторизации при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadMessagesList();
    loadUsers();
    setupNewMessageForm();
});

// Проверка авторизации
function checkAuth() {
    const token = localStorage.getItem('acessToken');
    if (!token) {
        window.location.href = '../index.html';
        return;
    }
}

// Загрузка списка диалогов
async function loadMessagesList() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE_URL}/messages/dialogs`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const dialogs = await response.json();
            displayMessagesList(dialogs);
            updateUnreadCount(dialogs);
        } else {
            // Используем демо-данные
            displayDemoMessagesList();
        }
    } catch (error) {
        console.error('Ошибка загрузки диалогов:', error);
        // Демо-данные
        displayDemoMessagesList();
    }
}

// Отображение демо-списка диалогов
function displayDemoMessagesList() {
    const demoDialogs = [
        {
            id: 1,
            userId: 2,
            userName: 'Петр Петров',
            userPosition: 'Менеджер проектов',
            lastMessage: 'Привет! Как продвигается работа над проектом?',
            timestamp: '10:30',
            unread: true
        },
        {
            id: 2,
            userId: 3,
            userName: 'Анна Сидорова',
            userPosition: 'Дизайнер',
            lastMessage: 'Отправила тебе макеты для просмотра',
            timestamp: 'Вчера',
            unread: true
        },
        {
            id: 3,
            userId: 4,
            userName: 'Сергей Смирнов',
            userPosition: 'Тестировщик',
            lastMessage: 'Спасибо за помощь!',
            timestamp: '15 апр',
            unread: false
        }
    ];
    
    displayMessagesList(demoDialogs);
    updateUnreadCount(demoDialogs);
}

// Отображение списка диалогов
function displayMessagesList(dialogs) {
    const messagesList = document.getElementById('messagesList');
    
    if (!dialogs || dialogs.length === 0) {
        messagesList.innerHTML = `
            <div class="empty-state" style="padding: 40px 20px;">
                <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin-bottom: 12px; opacity: 0.3;">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                <p style="font-size: 14px;">Нет диалогов</p>
            </div>
        `;
        return;
    }
    
    messagesList.innerHTML = dialogs.map(dialog => `
        <div class="message-item ${dialog.unread ? 'unread' : ''}" onclick="openChat(${dialog.userId}, '${dialog.userName}', '${dialog.userPosition}')">
            <div class="message-avatar">${getInitials(dialog.userName)}</div>
            <div class="message-info">
                <div class="message-top">
                    <span class="message-name">${dialog.userName}</span>
                    <span class="message-time">${dialog.timestamp}</span>
                </div>
                <div class="message-preview">${dialog.lastMessage}</div>
            </div>
            ${dialog.unread ? '<div class="unread-indicator"></div>' : ''}
        </div>
    `).join('');
}

// Получение инициалов
function getInitials(name) {
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2).toUpperCase();
}

// Обновление счетчика непрочитанных
function updateUnreadCount(dialogs) {
    const unreadCount = dialogs.filter(d => d.unread).length;
    const badge = document.getElementById('messagesBadge');
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

// Фильтрация диалогов
function filterMessages() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const items = document.querySelectorAll('.message-item');
    
    items.forEach(item => {
        const name = item.querySelector('.message-name').textContent.toLowerCase();
        const preview = item.querySelector('.message-preview').textContent.toLowerCase();
        
        if (name.includes(searchText) || preview.includes(searchText)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Открытие чата
async function openChat(userId, userName, userPosition) {
    currentChatId = userId;
    currentChatUser = { name: userName, position: userPosition };
    
    // Обновить активный элемент списка
    document.querySelectorAll('.message-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    event.currentTarget.classList.remove('unread');
    
    // Загрузить сообщения
    await loadChatMessages(userId);
    
    // Показать чат
    const chatContainer = document.getElementById('chatContainer');
    chatContainer.innerHTML = `
        <div class="chat-header">
            <div class="chat-avatar">${getInitials(userName)}</div>
            <div class="chat-user-info">
                <h3>${userName}</h3>
                <p>${userPosition}</p>
            </div>
        </div>
        <div class="chat-messages" id="chatMessages">
            <!-- Сообщения будут загружены здесь -->
        </div>
        <div class="chat-input-container">
            <form class="chat-input-form" id="chatInputForm">
                <div class="chat-input-wrapper">
                    <textarea class="chat-input" id="chatInput" placeholder="Введите сообщение..." rows="1"></textarea>
                </div>
                <button type="submit" class="send-button">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                    </svg>
                </button>
            </form>
        </div>
    `;
    
    // Настроить форму отправки
    setupChatInputForm();
}

// Загрузка сообщений чата
async function loadChatMessages(userId) {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE_URL}/messages/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const messages = await response.json();
            displayChatMessages(messages);
        } else {
            // Используем демо-данные
            displayDemoChatMessages(userId);
        }
    } catch (error) {
        console.error('Ошибка загрузки сообщений:', error);
        displayDemoChatMessages(userId);
    }
}

// Отображение демо-сообщений
function displayDemoChatMessages(userId) {
    const demoMessages = {
        2: [
            { id: 1, text: 'Привет! Как продвигается работа над проектом?', sent: false, timestamp: '10:25', userName: 'Петр Петров' },
            { id: 2, text: 'Привет! Все идет по плану, завтра должен быть готов первый прототип.', sent: true, timestamp: '10:30', userName: 'Вы' }
        ],
        3: [
            { id: 1, text: 'Отправила тебе макеты для просмотра', sent: false, timestamp: 'Вчера 15:30', userName: 'Анна Сидорова' },
            { id: 2, text: 'Отлично, посмотрю в ближайшее время!', sent: true, timestamp: 'Вчера 16:00', userName: 'Вы' }
        ],
        4: [
            { id: 1, text: 'Можешь помочь с тестированием новой функции?', sent: false, timestamp: '15 апр 12:00', userName: 'Сергей Смирнов' },
            { id: 2, text: 'Конечно, давай ссылку', sent: true, timestamp: '15 апр 12:15', userName: 'Вы' },
            { id: 3, text: 'Спасибо за помощь!', sent: false, timestamp: '15 апр 14:30', userName: 'Сергей Смирнов' }
        ]
    };
    
    const messages = demoMessages[userId] || [];
    displayChatMessages(messages);
}

// Отображение сообщений в чате
function displayChatMessages(messages) {
    const chatMessages = document.getElementById('chatMessages');
    
    if (!messages || messages.length === 0) {
        chatMessages.innerHTML = `
            <div class="empty-state">
                <p>Нет сообщений. Начните диалог!</p>
            </div>
        `;
        return;
    }
    
    chatMessages.innerHTML = messages.map(msg => `
        <div class="chat-message ${msg.sent ? 'sent' : 'received'}">
            <div class="chat-message-avatar">${getInitials(msg.userName)}</div>
            <div class="chat-message-content">
                <div class="chat-message-bubble">${msg.text}</div>
                <div class="chat-message-time">${msg.timestamp}</div>
            </div>
        </div>
    `).join('');
    
    // Прокрутить вниз
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Настройка формы отправки сообщения в чате
function setupChatInputForm() {
    const form = document.getElementById('chatInputForm');
    const input = document.getElementById('chatInput');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const messageText = input.value.trim();
        if (!messageText) return;
        
        await sendMessage(currentChatId, messageText);
        
        input.value = '';
        input.focus();
    });
    
    // Автоматическое изменение высоты textarea
    input.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
}

// Отправка сообщения
async function sendMessage(userId, text) {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE_URL}/messages/send`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                recipientId: userId,
                message: text
            })
        });

        if (response.ok) {
            // Перезагрузить сообщения
            await loadChatMessages(userId);
            await loadMessagesList();
        } else {
            const data = await response.json();
            showErrorModal('Ошибка', data.message || 'Не удалось отправить сообщение');
        }
    } catch (error) {
        console.error('Ошибка отправки сообщения:', error);
        // Эмуляция успешной отправки для демо
        const chatMessages = document.getElementById('chatMessages');
        const newMessage = document.createElement('div');
        newMessage.className = 'chat-message sent';
        newMessage.innerHTML = `
            <div class="chat-message-avatar">${getInitials('Вы')}</div>
            <div class="chat-message-content">
                <div class="chat-message-bubble">${text}</div>
                <div class="chat-message-time">Только что</div>
            </div>
        `;
        chatMessages.appendChild(newMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Загрузка списка пользователей для нового сообщения
async function loadUsers() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const users = await response.json();
            populateUserSelect(users);
        } else {
            // Демо-данные
            populateDemoUserSelect();
        }
    } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
        populateDemoUserSelect();
    }
}

// Заполнение демо-списка пользователей
function populateDemoUserSelect() {
    const demoUsers = [
        { id: 2, name: 'Петр Петров', position: 'Менеджер проектов' },
        { id: 3, name: 'Анна Сидорова', position: 'Дизайнер' },
        { id: 4, name: 'Сергей Смирнов', position: 'Тестировщик' },
        { id: 5, name: 'Мария Иванова', position: 'Аналитик' },
        { id: 6, name: 'Дмитрий Козлов', position: 'Разработчик' }
    ];
    
    populateUserSelect(demoUsers);
}

// Заполнение списка пользователей
function populateUserSelect(users) {
    const select = document.getElementById('recipientSelect');
    
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.name} - ${user.position}`;
        select.appendChild(option);
    });
}

// Модальное окно нового сообщения
function openNewMessageModal() {
    document.getElementById('newMessageModal').classList.add('active');
}

function closeNewMessageModal() {
    document.getElementById('newMessageModal').classList.remove('active');
    document.getElementById('newMessageForm').reset();
}

// Настройка формы нового сообщения
function setupNewMessageForm() {
    const form = document.getElementById('newMessageForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const recipientId = document.getElementById('recipientSelect').value;
        const messageText = document.getElementById('messageText').value.trim();
        
        if (!recipientId || !messageText) {
            showErrorModal('Ошибка', 'Пожалуйста, заполните все поля');
            return;
        }
        
        await sendNewMessage(recipientId, messageText);
    });
}

// Отправка нового сообщения
async function sendNewMessage(recipientId, text) {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE_URL}/messages/send`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                recipientId: recipientId,
                message: text
            })
        });

        if (response.ok) {
            closeNewMessageModal();
            showSuccessModal('Успешно', 'Сообщение отправлено');
            await loadMessagesList();
        } else {
            const data = await response.json();
            showErrorModal('Ошибка', data.message || 'Не удалось отправить сообщение');
        }
    } catch (error) {
        console.error('Ошибка отправки сообщения:', error);
        // Эмуляция успеха для демо
        closeNewMessageModal();
        showSuccessModal('Успешно', 'Сообщение отправлено');
        setTimeout(() => {
            loadMessagesList();
        }, 1000);
    }
}

// Выход из системы
function logout() {
    localStorage.removeItem('token');
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
