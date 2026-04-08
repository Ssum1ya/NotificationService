const API_URL = 'http://localhost:8080';

// Обработчик для кнопки регистрации
document.getElementById('registerBtn').addEventListener('click', async(e) => {
    e.preventDefault();

    const form = document.getElementById('registerForm');
    const formData = new FormData(form);

    const login = formData.get('login')
    const password = formData.get('password')
    const password2 = formData.get('password2')

    try {
        if (!(password === password2)) {
            throw new Error('Пароли не совпадают');
        }
    } catch {
        alert('Пароли не совпадают');
    }


    const data = {
        login: login,
        password: password
    };

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Ошибка регистрации');
        }

        alert('Регистрация успешна! Перенаправление...');
        window.location.href = '/lobby';

    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка: ' + error.message);
    }
});