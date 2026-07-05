# Expense Tracker

Приложение для учёта личных доходов и расходов: аутентификация пользователей, категории и транзакции с фильтрацией по датам и типам.

Проект организован как **монорепозиторий** на npm workspaces с двумя воркспейсами — `frontend` (Next.js) и `backend` (NestJS + Prisma + PostgreSQL).

## Стек

| Слой | Технология | Версия |
|------|------------|--------|
| Frontend Framework | Next.js (App Router) | 16 |
| UI | React | 19 |
| Стили | Tailwind CSS | 4 |
| UI-компоненты | shadcn/ui + Radix UI | — |
| Формы | react-hook-form + zod | 7 / 4 |
| Backend Framework | NestJS | 11 |
| Паттерн | CQRS (`@nestjs/cqrs`) | 11 |
| ORM | Prisma | 6 |
| БД | PostgreSQL | 16 |
| Аутентификация | Passport JWT + bcrypt | — |
| API-документация | Swagger (`@nestjs/swagger`) | 11 |
| Язык | TypeScript | 5 |

## Требования

- Node.js 20+ и npm 10+
- PostgreSQL 14+ (локально или через `docker-compose.yml` из репозитория)
- Docker (опционально — для запуска PostgreSQL)

## Быстрый старт

### 1. Установка зависимостей

Из корня репозитория:

```bash
npm install
```

Одна команда установит зависимости для обоих воркспейсов (`frontend` и `backend`).

### 2. Переменные окружения

В каталоге `backend/` создайте файл `.env` (или `.env.local`):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/expence_tracker"
JWT_SECRET="change-me-to-a-long-random-string"
```

> Значения соответствуют настройкам PostgreSQL из `docker-compose.yml`.

### 3. Запуск базы данных

Проще всего — через Docker Compose из корня:

```bash
docker compose up -d
```

Поднимется PostgreSQL 16 на `localhost:5432` (пользователь `postgres`, пароль `postgres`, БД `expence_tracker`).

### 4. Миграции и Prisma Client

```bash
npm run prisma:generate    # сгенерировать Prisma Client
npm run prisma:migrate     # применить миграции (prisma migrate dev)
```

### 5. Dev-серверы

В отдельных терминалах:

```bash
npm run dev:backend        # NestJS → http://localhost:3001 (API prefix /api)
npm run dev:frontend       # Next.js → http://localhost:3000
```

После запуска доступно:

- Приложение — <http://localhost:3000>
- Swagger UI — <http://localhost:3001/api/docs>

## Полезные команды

```bash
npm run build:frontend     # прод-сборка Next.js
npm run build:backend      # прод-сборка NestJS
npm --workspace backend run start:prod   # запуск скомпилированного backend

npm run lint               # ESLint по обоим воркспейсам
npm run format             # Prettier по всему репозиторию
```

## Структура проекта

```
expense-tracker-my/
├── backend/                    # NestJS API (workspace)
│   ├── prisma/
│   │   └── schema.prisma       # модели User / Category / Transaction
│   ├── src/
│   │   ├── main.ts             # bootstrap: /api prefix, ValidationPipe, Swagger
│   │   ├── app.module.ts
│   │   ├── prisma/             # PrismaModule + PrismaService
│   │   ├── auth/               # controller, JWT strategy, guards, decorators, DTO
│   │   ├── user/               # CQRS: commands/, queries/, dto/, repository
│   │   ├── category/           # CQRS + controller
│   │   └── transaction/        # CQRS + controller
│   └── CLAUDE.md
│
├── frontend/                   # Next.js App Router (workspace)
│   ├── src/
│   │   ├── app/                # маршруты (login/, register/, layout.tsx, page.tsx)
│   │   ├── views/              # FSD «pages»: home, login, register
│   │   ├── widgets/            # main-menu, recent-transactions, user-profile
│   │   ├── features/           # auth (ui/api/model), transactions (api)
│   │   ├── entities/           # user, category, transaction (model)
│   │   └── shared/             # api (base fetch), ui (shadcn), lib (utils)
│   └── CLAUDE.md
│
├── docker-compose.yml          # PostgreSQL 16 для локальной разработки
├── package.json                # npm workspaces + общие скрипты
├── CLAUDE.md                   # общие инструкции для Claude Code
└── README.md
```

Frontend следует методологии [Feature Slice Design](https://feature-sliced.design/). Backend — модульный NestJS с CQRS: каждый feature-модуль содержит `commands/handlers`, `queries/handlers`, `dto/`, `<feature>.repository.ts` и `<feature>.controller.ts`.

## Основные эндпоинты

Все эндпоинты доступны под префиксом `/api`. Защищённые маршруты требуют заголовка `Authorization: Bearer <JWT>`.

### Auth — `/api/auth`

| Метод | Путь | Описание | Auth |
|-------|------|----------|------|
| POST | `/api/auth/register` | Регистрация нового пользователя | — |
| POST | `/api/auth/login` | Вход, возвращает JWT | — |
| GET  | `/api/auth/me` | Данные текущего пользователя | JWT |

### Categories — `/api/categories`

| Метод | Путь | Описание | Auth |
|-------|------|----------|------|
| POST   | `/api/categories`      | Создать категорию                | JWT |
| GET    | `/api/categories`      | Список категорий пользователя    | JWT |
| GET    | `/api/categories/:id`  | Получить категорию по id         | JWT |
| PATCH  | `/api/categories/:id`  | Обновить категорию               | JWT |
| DELETE | `/api/categories/:id`  | Удалить категорию                | JWT |

### Transactions — `/api/transactions`

| Метод | Путь | Описание | Auth |
|-------|------|----------|------|
| POST   | `/api/transactions`     | Создать транзакцию                | JWT |
| GET    | `/api/transactions`     | Список транзакций пользователя    | JWT |
| GET    | `/api/transactions/:id` | Получить транзакцию по id         | JWT |
| PATCH  | `/api/transactions/:id` | Обновить транзакцию               | JWT |
| DELETE | `/api/transactions/:id` | Удалить транзакцию                | JWT |

Полная актуальная спецификация с телами запросов и ответов доступна в Swagger UI: <http://localhost:3001/api/docs>.

## Разработка

- Работайте по [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow): ветка от `master`, PR → squash merge.
- Коммиты — по [Conventional Commits](https://www.conventionalcommits.org/) (`feat`, `fix`, `docs`, `refactor`, `chore`, …).
- После изменения методов backend — обновляйте JSDoc; для DTO и контроллеров — Swagger-декораторы.

Подробнее — в [`CLAUDE.md`](CLAUDE.md), [`frontend/CLAUDE.md`](frontend/CLAUDE.md), [`backend/CLAUDE.md`](backend/CLAUDE.md).
