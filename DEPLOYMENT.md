# Deployment

GitLab Pages hosts only the frontend static files. The Nest backend must be deployed as a separate Node service, and the frontend must be built with the public backend API URL.

## 1. Deploy the database

Create a PostgreSQL database on any public provider, for example:

- Render PostgreSQL
- Railway PostgreSQL
- Neon
- Supabase PostgreSQL

Copy the external connection string and use it as `DATABASE_URL`.

## 2. Deploy the backend

Deploy the `backend/` directory as a Node or Docker service.

Recommended backend environment variables:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-gitlab-pages-url
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAME_SITE=none
```

If OAuth login is enabled, also set provider credentials and callbacks:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://your-backend-url/api/auth/google/callback

GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_CALLBACK_URL=https://your-backend-url/api/auth/github/callback

YANDEX_CLIENT_ID=...
YANDEX_CLIENT_SECRET=...
YANDEX_CALLBACK_URL=https://your-backend-url/api/auth/yandex/callback
```

The existing `backend/Dockerfile` runs:

```sh
npx prisma migrate deploy && node dist/main.js
```

So database migrations are applied automatically when the backend container starts.

## 3. Connect GitLab Pages frontend to the backend

In GitLab, add a CI/CD variable:

```env
VITE_API_BASE_URL=https://your-backend-url/api
```

Then run the pipeline again from the `project` branch. The frontend will call the deployed backend instead of `http://localhost:3000/api`.

## 4. Check the deployed app

Open:

- Frontend: `https://your-gitlab-pages-url`
- Backend health/API docs: `https://your-backend-url/api/docs`

If login works locally but not in production, check these first:

- `FRONTEND_URL` exactly matches the GitLab Pages origin, without a trailing path typo.
- `VITE_API_BASE_URL` points to the backend and ends with `/api`.
- `AUTH_COOKIE_SECURE=true`.
- `AUTH_COOKIE_SAME_SITE=none`.
- Backend CORS response includes the GitLab Pages URL.
