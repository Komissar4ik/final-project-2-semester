# T-Nexus

**Автор:** Поляков Глеб Витальевич 
**Курс:** курсовая работа на курсе "Т-Академия Фронтенда"  
**Название веб-приложения:** T-Nexus

T-Nexus - социальная сеть для публикации постов, поиска пользователей, подписок, комментариев и сохранения интересных публикаций.

## Ссылки

- Frontend: https://final-project-2-semester-a480c1.edu-gitlab.ru
- Backend API: https://nexus-social-backend.onrender.com/api
- Swagger: https://nexus-social-backend.onrender.com/api/docs

Render Free может усыплять backend, поэтому первый запрос после простоя иногда выполняется дольше.

## Задача

Создать аналог X (Запрещенный в РФ) для разработчиков, чтобы они смогли делиться своим опытом, решениями и знаниями

## Целевая аудитория

Пользователи, которым нужен простой сервис для публикации коротких постов, поиска людей и общения

## Возможности

- регистрация и вход по email/password;
- OAuth-авторизация через Google, GitHub и Яндекс;
- создание постов с текстом и изображениями;
- просмотр ленты постов;
- лайки и комментарии;
- сохранение постов в закладки;
- поиск по постам и пользователям;
- подписки на пользователей;
- редактирование профиля и загрузка аватара;
- трендовые хэштеги;
- мобильная версия;
- Swagger-документация API.

## Маршруты

- `/` - стартовая страница;
- `/auth` - авторизация и регистрация;
- `/app/feed` - лента;
- `/app/users` - пользователи;
- `/app/settings` - настройки;
- `/app/profile/:id` - динамическая страница профиля;
- `/app/post/:id` - динамическая страница поста.

## Тестовый аккаунт

```text
Email: student@example.com
Password: password123
```

Также можно зарегистрировать нового пользователя через форму регистрации.

## Стек

- Frontend: React, TypeScript, Vite, React Router, Zustand, Tailwind CSS.
- Backend: Node.js, NestJS, TypeScript, Prisma ORM, PostgreSQL, JWT, Swagger.
- Инфраструктура: GitLab CI/CD, GitLab Pages, Render, Docker Compose.

## Запуск локально

Установить зависимости:

```bash
npm install
npm --prefix backend install
```

Создать `.env` на основе `.env.example`.

Сгенерировать Prisma Client и применить миграции:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Запустить backend:

```bash
npm run dev:backend
```

Запустить frontend в отдельном терминале:

```bash
npm run dev:frontend
```

Локальные адреса:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api
- Swagger: http://localhost:3000/api/docs

## Запуск через Docker

```bash
docker compose up --build
```

Адреса:

- Приложение: http://localhost
- Swagger: http://localhost/api/docs

Остановить:

```bash
docker compose down
```

## Проверка проекта

```bash
npm run lint
npm run lint:backend
npm test
npm run test:coverage
npm run validate
```

## CI/CD

В проекте настроен GitLab CI/CD. Pipeline запускает линтинг, Jest-тесты, проверку покрытия, сборку frontend/backend и деплой frontend в GitLab Pages.

Backend деплоится отдельно на Render.

## Данные

Пользовательские данные хранятся удаленно в PostgreSQL. Основные сущности: `User`, `Profile`, `Post`, `Comment`, `Like`, `Follow`.

## Code style

В проекте используется TypeScript, ESLint, Jest, DTO-валидация на backend, модульная структура NestJS и компонентная структура React.

```
