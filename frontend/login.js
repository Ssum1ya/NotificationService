const API_URL = 'http://localhost:8080';

// Обработчик для кнопки регистрации
document.getElementById('loginButton').addEventListener('click', async(e) => {
    e.preventDefault();

    const form = document.getElementById('loginForm');
    const formData = new FormData(form);

    const login = formData.get('login')
    const password = formData.get('password')

    const data = {
        login: login,
        password: password
    };

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
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

        const result = await response.json();
        localStorage.setItem('token', result.accessToken);
        console.log('Токен сохранён:', result.accessToken);
        alert('Успешно');
        window.location.href = '/lobby';

    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка: ' + error.message);
    }
});