const API_URL = 'http://localhost:8080';

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Функция отображения красивых ошибок
function showErrorModal(errorResponse) {
    const modal = document.getElementById('errorModal');
    const errorTitle = document.getElementById('errorTitle');
    const errorMessage = document.getElementById('errorMessage');
    const errorList = document.getElementById('errorList');

    // Устанавливаем заголовок и сообщение
    errorTitle.textContent = errorResponse.message || 'Ошибка валидации';
    errorMessage.textContent = 'Пожалуйста, исправьте следующие ошибки:';

    // Очищаем список ошибок
    errorList.innerHTML = '';

    // Добавляем ошибки в список
    if (errorResponse.fieldErrors && errorResponse.fieldErrors.length > 0) {
        errorResponse.fieldErrors.forEach(error => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${error.field}:</strong> ${error.issue}`;
            errorList.appendChild(li);
        });
    }

    // Показываем модальное окно
    modal.classList.add('show');
}

// Функция закрытия модального окна ошибок
function closeErrorModal() {
    const modal = document.getElementById('errorModal');
    modal.classList.remove('show');
}

// Функция отображения успешного уведомления
function showSuccessModal(title, message) {
    const modal = document.getElementById('successModal');
    const successTitle = document.getElementById('successTitle');
    const successMessage = document.getElementById('successMessage');

    // Устанавливаем заголовок и сообщение
    successTitle.textContent = title || 'Успешно!';
    successMessage.textContent = message || 'Операция выполнена успешно';

    // Показываем модальное окно
    modal.classList.add('show');
}

// Функция закрытия модального окна успеха
function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.classList.remove('show');
}

// Закрытие модальных окон при клике вне их
window.addEventListener('click', function(event) {
    const errorModal = document.getElementById('errorModal');
    const successModal = document.getElementById('successModal');

    if (event.target === errorModal) {
        closeErrorModal();
    }

    if (event.target === successModal) {
        closeSuccessModal();
    }
});

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const login = document.getElementById('login').value;
        const password = document.getElementById('password').value;

        const data = {
            login: login,
            password: password
        };

        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            showErrorModal(error);
            return;
        }

        const result = await response.json();
        localStorage.setItem('acessToken', result.accessToken);
        localStorage.setItem('refreshToken', result. refreshToken);

        showSuccessModal('Вход выполнен!', 'Добро пожаловать в систему');
        timeout(2000).then(() => {
            window.location.href = '/profile-form.html';
        });  
    });
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const login = document.getElementById('register-login').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            showErrorModal({
                message: 'Ошибка',
                fieldErrors: [
                    {
                        field: 'password',
                        issue: 'пароли не совпадают'
                    }
                ]
            });
            return;
        }

        const data = {
            login: login,
            password: password
        };

        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            showErrorModal(error);
            return;
        }

        showSuccessModal('Регистрация завершена!', 'Ваш аккаунт успешно создан. Теперь вы можете войти в систему.');
        timeout(2000).then(() => {
            window.location.href = '/lobby';
        });
    });
}
