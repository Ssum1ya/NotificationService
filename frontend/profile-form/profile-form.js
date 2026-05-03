const API_URL = 'http://localhost:8080';

let currentStep = 1;
const totalSteps = 3;

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

// Переход к следующему шагу
function nextStep() {
    // Проверка заполнения обязательных полей текущего шага
    if (!validateStep(currentStep)) {
        return;
    }

    if (currentStep < totalSteps) {
        // Отметить текущий шаг как завершенный
        document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.add('completed');

        currentStep++;
        updateStep();
    }
}

// Переход к предыдущему шагу
function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStep();
    }
}

// Обновление отображения шагов
function updateStep() {
    // Скрыть все шаги
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });

    // Показать текущий шаг
    document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.add('active');

    // Обновить прогресс-бар
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        const stepNumber = index + 1;
        if (stepNumber === currentStep) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else if (stepNumber < currentStep) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else {
            step.classList.remove('active', 'completed');
        }
    });
}

// Валидация полей текущего шага
function validateStep(step) {
    const currentStepElement = document.querySelector(`.form-step[data-step="${step}"]`);
    const requiredInputs = currentStepElement.querySelectorAll('[required]');

    let isValid = true;
    requiredInputs.forEach(input => {
        if (!input.value.trim()) {
            input.focus();
            alert('Пожалуйста, заполните все обязательные поля');
            isValid = false;
            return false;
        }
    });

    return isValid;
}

document.addEventListener("DOMContentLoaded", async () => {
    const select = document.getElementById("department");
    const token = localStorage.getItem('acessToken');

    try {
        // запрос на бэк
        const response = await fetch(`${API_URL}/departament/user-select-profile`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error("Ошибка загрузки данных");
        }

        const departments = await response.json();

        // очищаем select
        select.innerHTML = '<option value="">Выберите департамент</option>';

        // заполняем список
        departments.forEach(dep => {
            const option = document.createElement("option");
            option.value = dep.name;
            option.id = dep.id;
            option.textContent = dep.name;
            select.appendChild(option);
        });

    } catch (error) {
        console.error(error);
        select.innerHTML = '<option value="">Ошибка загрузки</option>';
    }
});

const messengerSelect = document.getElementById("messenger");
const stepDescription = document.getElementById("stepDescription");
const usernameLabel = document.getElementById("usernameLabel");
const usernameInput = document.getElementById("username");

messengerSelect.addEventListener("change", () => {
    console.log("Выбран мессенджер:", messengerSelect.value);
    const value = messengerSelect.value;

    let text = "Введите username";

    if (value === "") {
        text = "Введите контактные данные";
    }
    else if (value === "telegram") {
        text = "Введите username";
    } else if (value === "email") {
        text = "Введите почту";
    } else if (value === "vk") {
        text = "Введите id аккаунта";
    }

    // меняем всё сразу
    // stepDescription.textContent = text;
    usernameLabel.innerHTML = `${text}<span class="required">*</span>`;
    usernameInput.placeholder = text;
});

// Обработка отправки формы
document.getElementById('profileForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!validateStep(currentStep)) {
        return;
    }

    const token = localStorage.getItem('acessToken');

    // Сбор данных формы
    const formData = {
        lastName: document.getElementById('lastName').value,
        name: document.getElementById('firstName').value,
        surname: document.getElementById('middleName').value,
        communication: document.getElementById('messenger').value,
        position: document.getElementById('position').value,
        grade: document.getElementById('grade').value,
        departament: document.getElementById('department').value,
        username: document.getElementById('username').value
    };

    const response = await fetch(`${API_URL}/profile`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    });

    if (!response.ok) {
        const error = await response.json();
        showErrorModal(error);
        return;
    }

    showSuccessModal('Успешно!');
    timeout(2000).then(() => {
        window.location.href = '../index.html';
    });
});
