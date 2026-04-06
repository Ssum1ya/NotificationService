# Этап 1: Сборка приложения
FROM gradle:8.14-jdk17 AS builder
WORKDIR /app

# Копируем gradle файлы для кэширования зависимостей
COPY build.gradle* ./
COPY settings.gradle* ./
RUN gradle dependencies --no-daemon

# Копируем исходный код и собираем JAR
COPY src ./src
RUN gradle bootJar --no-daemon

# Этап 2: Запуск приложения
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Копируем собранный JAR из этапа сборки
COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080
CMD ["java", "-jar", "app.jar"]