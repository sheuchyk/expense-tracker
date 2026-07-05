# Архитектура

## Общая схема

Монорепозиторий на npm workspaces с двумя воркспейсами:

```
┌─────────────────────┐        HTTP / JSON        ┌─────────────────────┐
│  frontend (Next.js) │ ────────────────────────▶ │  backend (NestJS)   │
│  React 19 + FSD     │   Authorization: Bearer   │  CQRS + Prisma      │
└─────────────────────┘                           └─────────┬───────────┘
                                                            │ Prisma
                                                            ▼
                                                    ┌───────────────┐
                                                    │ PostgreSQL 16 │
                                                    └───────────────┘
```

- Frontend — `http://localhost:3000`
- Backend — `http://localhost:3001/api`
- Swagger UI — `http://localhost:3001/api/docs`

## Backend — NestJS

### Слои и модули

```
src/
├── main.ts                # bootstrap: /api prefix, ValidationPipe, Swagger, порт 3001
├── app.module.ts          # композиция: ConfigModule + PrismaModule + feature-модули
├── prisma/                # PrismaModule + PrismaService (единая точка доступа к БД)
├── auth/                  # controller + JwtStrategy + guards + decorators + DTO
├── user/                  # CQRS: commands/, queries/, dto/, repository
├── category/              # CQRS + controller
└── transaction/           # CQRS + controller
```

### Стек паттернов

| Паттерн | Реализация |
|---------|------------|
| **Модульность** | NestJS `@Module` — DI-контейнер и композиция |
| **CQRS** | `@nestjs/cqrs` — commands/queries разделены, каждый handler — отдельный класс |
| **Repository** | `<feature>.repository.ts` инкапсулирует Prisma-доступ, handlers работают через репозиторий |
| **DTO + Validation** | `class-validator` + `class-transformer`, глобальный `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`) |
| **Auth** | Passport JWT — `JwtStrategy`, `JwtAuthGuard`, декоратор `@CurrentUser()` |
| **Config** | `@nestjs/config` (`isGlobal: true`), `DATABASE_URL`, `JWT_SECRET` в `.env` |
| **API-документация** | `@nestjs/swagger` — `@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`, `@ApiProperty` |

### Схема CQRS-модуля

Каждый feature-модуль (`user`, `category`, `transaction`) построен по одинаковой структуре:

```
<feature>/
├── <feature>.controller.ts     # HTTP-слой, отправляет команды/запросы в CommandBus/QueryBus
├── <feature>.module.ts         # регистрирует controller, repository, handlers, ImportsModule
├── <feature>.repository.ts     # Prisma-доступ, единственный слой, читающий/пишущий в БД
├── dto/                        # DTO с валидацией и Swagger-декораторами
├── commands/                   # write-intents (CreateXCommand, UpdateXCommand, DeleteXCommand)
│   └── handlers/               # CommandHandler-ы — бизнес-логика записи
└── queries/                    # read-intents (GetXByIdQuery, GetXListQuery)
    └── handlers/               # QueryHandler-ы — бизнес-логика чтения
```

**Поток запроса:**

```
HTTP → Controller → CommandBus/QueryBus → Handler → Repository → Prisma → PostgreSQL
                                             │
                                             └─► возвращает результат обратно по цепочке
```

### Auth-слой

- `AuthController` (`/api/auth`) — публичные `register`/`login`, защищённый `me`.
- `AuthService` — хеширование пароля (`bcrypt`), выпуск JWT (`@nestjs/jwt`).
- `JwtStrategy` (`passport-jwt`) — извлекает bearer-токен, кладёт `{ id, email }` в `req.user`.
- `JwtAuthGuard` — декоратор для защиты маршрутов.
- `@CurrentUser()` — параметр-декоратор, достаёт пользователя из request.

## Frontend — Next.js + FSD

Frontend следует методологии [Feature Slice Design](https://feature-sliced.design/). Слои сверху вниз:

```
src/
├── app/         # Next.js App Router — тонкие route-файлы, импортируют views/
├── views/       # FSD «pages»: home, login, register (переименованы из pages, чтобы не конфликтовать с Next.js Pages Router)
├── widgets/     # Составные UI-блоки: main-menu, recent-transactions, user-profile
├── features/    # Функциональные слайсы (auth, transactions) — ui/, api/, model/
├── entities/    # Бизнес-сущности (user, category, transaction) — model/, ui/
└── shared/      # Инфраструктура без бизнес-логики — api/, ui/ (shadcn), lib/
```

**Правила импортов:**

- Импорты идут строго вниз: `app → views → widgets → features → entities → shared`.
- Слайсы одного слоя не импортируют друг друга (например, `features/auth` не может импортировать `features/transactions`).
- Файлы в `src/app/` — тонкие: только импорт и рендер соответствующего view.

### Технологии frontend-слоёв

| Слой | Используется |
|------|--------------|
| UI-примитивы | shadcn/ui (`button`, `card`, `form`, `input`, `label`) + Radix UI |
| Формы | `react-hook-form` + `zod` через `@hookform/resolvers` |
| Стили | Tailwind CSS 4, CSS-переменные в `globals.css`, маппинг в `tailwind.config.ts` |
| Утилиты | `clsx`, `tailwind-merge`, `class-variance-authority` (в `shared/lib/utils.ts` — helper `cn()`) |
| HTTP | базовый `fetch`-обёртка в `shared/api/base.ts` |

## Взаимодействие frontend ↔ backend

- Frontend отправляет запросы на `http://localhost:3001/api/*`.
- Аутентификация — `Authorization: Bearer <JWT>`. Токен получается на `POST /api/auth/login` и хранится клиентом (см. `features/auth/model/session.ts`).
- Все защищённые эндпоинты требуют валидный JWT — controller-ы помечены `@UseGuards(JwtAuthGuard)`.

## Ключевые архитектурные решения

1. **CQRS для доменных модулей** — разделение чтения и записи даёт чистые границы, упрощает тестирование handler-ов и открывает путь к разным моделям чтения в будущем.
2. **Repository pattern** — controller/handler никогда не обращается к Prisma напрямую; это упрощает миграцию БД и мок-тестирование.
3. **FSD на frontend** — жёсткое направление импортов предотвращает циклы и хаос при росте кода.
4. **Global `ValidationPipe` + DTO** — любой невалидный ввод отсекается ещё до попадания в бизнес-логику.
5. **Swagger как источник правды по API** — декораторы прямо на контроллерах и DTO, `/api/docs` всегда актуален.
