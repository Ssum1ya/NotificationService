let currentStep = 1;
const totalSteps = 3;

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

// Обработка отправки формы
document.getElementById('profileForm').addEventListener('submit', function(e) {
    e.preventDefault();

    if (!validateStep(currentStep)) {
        return;
    }

    // Сбор данных формы
    const formData = {
        lastName: document.getElementById('lastName').value,
        firstName: document.getElementById('firstName').value,
        middleName: document.getElementById('middleName').value,
        messenger: document.getElementById('messenger').value,
        position: document.getElementById('position').value,
        grade: document.getElementById('grade').value,
        department: document.getElementById('department').value
    };

    console.log('Данные профиля:', formData);

    // Красивое отображение данных
    let message = 'Профиль успешно заполнен!\n\n';
    message += `ФИО: ${formData.lastName} ${formData.firstName} ${formData.middleName || ''}\n`;
    message += `Связь: ${document.getElementById('messenger').selectedOptions[0].text}\n`;
    message += `Позиция: ${document.getElementById('position').selectedOptions[0].text}\n`;
    message += `Grade: ${document.getElementById('grade').selectedOptions[0].text}\n`;
    message += `Департамент: ${document.getElementById('department').selectedOptions[0].text}`;

    alert(message);

    // Здесь можно добавить отправку данных на сервер
    // После успешной отправки можно перенаправить на другую страницу
    // window.location.href = 'index.html';
});
