FROM python:3.11-slim

WORKDIR /app

# Устанавливаем переменные окружения
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Копируем зависимости
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь код
COPY . .

# Проверяем, что файлы скопировались
RUN ls -la

CMD ["python", "-u", "main.py"]