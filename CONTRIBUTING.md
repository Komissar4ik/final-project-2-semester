# Contribution Guide

Документ фиксирует рабочие правила проекта для code-style, именования коммитов и проверки изменений перед merge.

## Ветки

Для учебных этапов используется префикс `feature/`:

- `feature/auth`;
- `feature/posts`;
- `feature/nginx-deploy-config`;
- `feature/docs-and-final-polish`.

Исправления можно выносить в ветки `fix/<short-name>`.

## Коммиты

Коммиты именуются в стиле Conventional Commits:

```text
feat(auth): add google oauth flow
fix(posts): validate post ownership before update
test(auth): cover oauth user linking
docs(readme): add deployment instructions
chore(ci): add gitlab pages pipeline
```

Допустимые типы:

- `feat` - новая функциональность;
- `fix` - исправление ошибки;
- `test` - тесты;
- `docs` - документация;
- `chore` - инфраструктура, зависимости, CI;
- `refactor` - изменение структуры без нового поведения.

## Code Review

Каждая крупная задача оформляется через merge request или pull request.

Перед merge проверяется:

- код проходит lint;
- unit-тесты проходят;
- coverage не ниже порогов Jest;
- frontend и backend собираются;
- изменения не смешивают несвязанные задачи;
- секреты не попадают в репозиторий.

## Code Style

Основные правила:

- TypeScript strict-style без `any`, если можно описать тип;
- NestJS код разделяется на modules, controllers, services, DTO, guards;
- React код разделяется на pages, components, api, store;
- DTO валидируются через `class-validator`;
- формат API - JSON, uploads - `multipart/form-data`;
- секреты хранятся в `.env`, пример - в `.env.example`.

## Локальная проверка

Перед отправкой merge request:

```bash
npm run validate
```

Команда запускает lint, Jest coverage и сборку frontend/backend.
