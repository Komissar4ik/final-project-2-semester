# Nexus Social

Прототип социальной сети для курсовой работы на курсе "Т-Академия Фронтенда".

Приложение демонстрирует базовую fullstack-архитектуру: React frontend общается с NestJS backend через REST API, backend хранит данные в PostgreSQL через Prisma, авторизация выдает внутреннюю JWT-сессию в HTTP-only cookie, а собранный frontend отдается через Nginx.

## Возможности

- регистрация и вход по email/password;
- учебный OAuth/OpenID Connect callback для Google, GitHub и Яндекс ID;
- JWT-сессия в HTTP-only cookie;
- просмотр пользователей и профилей;
- редактирование профиля;
- публикации с изображениями;
- комментарии;
- лайки;
- подписки;
- загрузка аватара через `multipart/form-data`;
- Swagger-документация API.

## Архитектура

Схема архитектуры: [Excalidraw](https://excalidraw.com/#json=HHboGUAB7mwVEkBYiylls,2hGihBeK_R4OB1LnF9enNA).

Основной поток:

1. Пользователь открывает React-приложение.
2. Frontend отправляет JSON-запросы на REST API backend.
3. Backend валидирует DTO через `class-validator`, работает с БД через Prisma и PostgreSQL.
4. После входа backend выставляет HTTP-only cookie `access_token`.
5. Защищенные endpoints проверяются NestJS guard.
6. Изображения и аватары загружаются как `multipart/form-data` и сохраняются в `backend/uploads`.
7. В production-сценарии Nginx отдает frontend static и проксирует `/api/*` на backend.

## Стек

Frontend:

- React;
- TypeScript;
- Vite;
- React Router;
- Fetch API;
- Zustand;
- React Hook Form.

Backend:

- Node.js;
- NestJS;
- TypeScript;
- Prisma ORM;
- PostgreSQL;
- class-validator;
- Swagger / OpenAPI.

Infrastructure:

- Docker Compose;
- Nginx;
- multipart uploads через NestJS static assets.

## Локальный запуск без Docker

Требования:

- Node.js 22;
- npm;
- PostgreSQL.

1. Установить зависимости:

```bash
npm install
npm --prefix backend install
```

2. Создать `.env` в корне проекта на основе `.env.example` и указать `DATABASE_URL`.

3. Применить миграции Prisma:

```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Запустить backend:

```bash
npm run dev:backend
```

5. В отдельном терминале запустить frontend:

```bash
npm run dev:frontend
```

Адреса:

- frontend: `http://localhost:5173`;
- backend API: `http://localhost:3000/api`;
- Swagger: `http://localhost:3000/api/docs`.

## Запуск через Docker Compose

Docker Compose поднимает PostgreSQL, NestJS backend и Nginx со собранным frontend.

```bash
docker compose up --build
```

После запуска:

- приложение: `http://localhost`;
- Swagger: `http://localhost/api/docs`;
- PostgreSQL снаружи: `localhost:5432`.

Backend-контейнер перед стартом выполняет:

```bash
npx prisma migrate deploy
```

Это применяет уже созданные миграции из `backend/prisma/migrations`.

Остановить контейнеры:

```bash
docker compose down
```

Остановить и удалить volumes с данными:

```bash
docker compose down -v
```

## Nginx

Конфигурация находится в `nginx/default.conf`.

Что делает Nginx:

- отдает файлы из `/usr/share/nginx/html`;
- поддерживает React Router через `try_files $uri $uri/ /index.html`;
- проксирует `/api/*` на `http://backend:3000/api/*`;
- проксирует `/uploads/*` на backend, чтобы работали аватары и изображения;
- разрешает загрузки до `10m`.

## Переменные окружения

Основные переменные описаны в `.env.example`.

Фактически используемые переменные:

- `VITE_API_BASE_URL` - базовый URL API для frontend;
- `NODE_ENV` - окружение backend;
- `PORT` - порт backend;
- `DATABASE_URL` - строка подключения Prisma к PostgreSQL;
- `JWT_SECRET` - секрет подписи JWT;
- `JWT_EXPIRES_IN` - срок жизни JWT;
- `AUTH_COOKIE_SECURE` - выставлять ли cookie только по HTTPS;
- `FRONTEND_URL` - разрешенный origin для CORS;
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` - настройки Google OAuth;
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL` - настройки GitHub OAuth;
- `YANDEX_CLIENT_ID`, `YANDEX_CLIENT_SECRET`, `YANDEX_CALLBACK_URL` - настройки Яндекс ID.

Для Docker Compose используются значения из `docker-compose.yml`:

- `DATABASE_URL=postgresql://postgres:postgres@postgres:5432/nexus_social?schema=public`;
- `FRONTEND_URL=http://localhost`;
- `AUTH_COOKIE_SECURE=false`.

`AUTH_COOKIE_SECURE=false` нужен для локальной проверки по HTTP. Для публичного HTTPS-развертывания значение нужно заменить на `true`, а `JWT_SECRET` заменить на секретное значение.

Для локального запуска без Docker callback URLs должны указывать на backend:

```env
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback
YANDEX_CALLBACK_URL=http://localhost:3000/api/auth/yandex/callback
```

Для Docker/Nginx-запуска callback URLs должны указывать на внешний адрес Nginx:

```env
GOOGLE_CALLBACK_URL=http://localhost/api/auth/google/callback
GITHUB_CALLBACK_URL=http://localhost/api/auth/github/callback
YANDEX_CALLBACK_URL=http://localhost/api/auth/yandex/callback
```

## Проверка API

1. Открыть Swagger:

```text
http://localhost:3000/api/docs
```

или при Docker-запуске:

```text
http://localhost/api/docs
```

2. Проверить основные сценарии:

- `POST /api/auth/register`;
- `POST /api/auth/login`;
- `GET /api/auth/google`;
- `GET /api/auth/github`;
- `GET /api/auth/yandex`;
- `GET /api/auth/google/callback`;
- `GET /api/auth/github/callback`;
- `GET /api/auth/yandex/callback`;
- `GET /api/auth/me`;
- `GET /api/users`;
- `PATCH /api/profiles/me`;
- `POST /api/profiles/me/avatar`;
- `POST /api/posts`;
- `POST /api/posts/upload-image`;
- `POST /api/posts/{postId}/comments`;
- `POST /api/posts/{postId}/likes`;
- `POST /api/users/{userId}/follow`.

Для protected endpoints нужно сначала выполнить login/register, чтобы backend выставил cookie `access_token`.

## Тестовые данные

Можно зарегистрировать пользователя через форму приложения или Swagger:

```json
{
  "email": "student@example.com",
  "displayName": "Student",
  "password": "password123"
}
```

В UI также есть вход через Google, GitHub и Яндекс ID. Кнопки ведут на backend endpoints `/api/auth/google`, `/api/auth/github` и `/api/auth/yandex`; после callback backend создает или обновляет локального пользователя, выставляет HTTP-only cookie `access_token` и возвращает пользователя на `/app/feed`.

## Полезные команды

Frontend:

```bash
npm run dev:frontend
npm run build:frontend
npm run lint
```

Backend:

```bash
npm run dev:backend
npm run build:backend
npm run lint:backend
npm run prisma:generate
npm run prisma:migrate
```

Docker:

```bash
docker compose up --build
docker compose down
docker compose down -v
```

## Альтернативы и обоснование выбора

### Vite vs Webpack

Выбран Vite, потому что он проще для учебного React-проекта, быстро запускает dev server и требует меньше конфигурации. Webpack гибче для сложных production-сборок, но для курсового прототипа добавляет лишнюю настройку.

### PostgreSQL vs MongoDB

Выбран PostgreSQL, потому что социальная сеть содержит связанные сущности: пользователи, профили, публикации, комментарии, лайки и подписки. Реляционная модель и Prisma хорошо подходят для таких связей. MongoDB можно было бы использовать для более свободной схемы документов, но здесь структура данных достаточно стабильна.

### JWT / HTTP-only cookie vs Redis sessions

Выбрана JWT-сессия в HTTP-only cookie: это проще для курсового проекта, не требует отдельного Redis и защищает токен от прямого доступа из JavaScript. Redis sessions удобнее для production-систем, где нужно централизованно отзывать сессии и хранить состояние, но для прототипа это усложнение не обязательно.

## Этап 11: `feature/nginx-deploy-config`

Цель: подготовка к развертыванию.

Созданы или изменены файлы:

- `Dockerfile`;
- `backend/Dockerfile`;
- `docker-compose.yml`;
- `nginx/default.conf`;
- `.dockerignore`;
- `backend/.dockerignore`;
- `.env.example`;
- `backend/src/auth/auth.controller.ts`;
- `README.md`.

Реализовано:

- production-сборка frontend через Vite;
- отдача frontend static через Nginx;
- fallback для React Router;
- proxy `/api/*` на backend;
- proxy `/uploads/*` на backend;
- Dockerfile для NestJS backend;
- автоматический `prisma migrate deploy` при старте backend-контейнера;
- Docker Compose для PostgreSQL, backend и frontend/Nginx;
- настройка `AUTH_COOKIE_SECURE` для локального HTTP-запуска.

Как проверить:

```bash
docker compose up --build
```

Затем открыть:

- `http://localhost`;
- `http://localhost/api/docs`.

## Этап 12: `feature/docs-and-final-polish`

Цель: финальная документация.

Созданы или изменены файлы:

- `README.md`.

Реализовано:

- описание архитектуры;
- описание выбранного стека;
- ссылка на Excalidraw-схему;
- инструкции локального запуска;
- инструкции Docker-запуска;
- инструкции проверки Swagger;
- тестовые данные;
- сравнение альтернатив: Vite/Webpack, PostgreSQL/MongoDB, JWT cookie/Redis sessions;
- список команд для проверки куратором.

Как проверить:

```bash
npm run build:frontend
npm run build:backend
docker compose config
```
