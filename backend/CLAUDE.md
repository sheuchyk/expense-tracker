# Backend — CLAUDE.md

Guidance for the NestJS backend workspace. See the [root CLAUDE.md](../CLAUDE.md) for monorepo-wide conventions.

## Overview

- **Framework**: NestJS 11 (modular, dependency-injected)
- **Pattern**: CQRS via `@nestjs/cqrs` for `transaction`, `category`, `user` modules (commands + queries with dedicated handlers)
- **ORM**: Prisma 6 targeting PostgreSQL
- **Auth**: Passport JWT (`passport-jwt`) with `@nestjs/jwt`; passwords hashed with `bcrypt`
- **Validation**: `class-validator` + `class-transformer` (global `ValidationPipe` with `whitelist`, `forbidNonWhitelisted`, `transform`)
- **API Docs**: Swagger via `@nestjs/swagger` — served at `/api/docs`
- **Config**: `@nestjs/config` with `ConfigModule.forRoot({ isGlobal: true })`

## Development Commands

Run from the project root (recommended) or from `backend/`:

```bash
npm run dev:backend           # from root — NestJS in watch mode on http://localhost:3001
npm run build:backend         # production build
npm run start:prod            # run compiled backend from dist/
npm --workspace backend run lint

# Prisma
npm run prisma:generate
npm run prisma:migrate        # runs prisma migrate dev inside backend workspace
```

## Environment Configuration

Create a `.env.local` (or `.env`) in the `backend/` directory:

```
DATABASE_URL=postgresql://user:password@localhost:5432/expense_tracker
JWT_SECRET=<your-secret>
```

A ready-to-use local PostgreSQL is defined in the root `docker-compose.yml`.

## Bootstrapping

`src/main.ts` bootstraps the NestJS app:
- Global prefix `/api` — all endpoints live under `http://localhost:3001/api/*`
- Global `ValidationPipe` (whitelist, forbidNonWhitelisted, transform)
- Swagger with `.addBearerAuth()` — UI at `/api/docs`
- Listens on port **3001**

## Module Layout

```
src/
  app.module.ts         # composes ConfigModule + Prisma + feature modules
  main.ts               # bootstrap (global prefix, validation, Swagger)

  prisma/               # PrismaModule + PrismaService (shared DB access)

  auth/                 # AuthController, AuthService, JWT strategy & guards, decorators, DTOs
  user/                 # CQRS module (commands/, queries/, dto/, user.repository.ts)
  category/             # CQRS module (commands/, queries/, dto/, category.repository.ts, controller)
  transaction/          # CQRS module (commands/, queries/, dto/, transaction.repository.ts, controller)
```

Each CQRS-enabled feature module follows the same layout:

```
<feature>/
  <feature>.controller.ts     # HTTP layer — dispatches commands/queries
  <feature>.module.ts         # NestJS module wiring
  <feature>.repository.ts     # Prisma access encapsulated behind a repository
  dto/                        # DTOs with class-validator + Swagger decorators
  commands/                   # write intents
    handlers/                 # CommandHandler implementations
  queries/                    # read intents
    handlers/                 # QueryHandler implementations
```

## Data Model (Prisma)

Defined in `prisma/schema.prisma`:

- **User** — `id`, `name`, `email` (unique), `password` (bcrypt hash), timestamps; has many `Category`, `Transaction`.
- **Category** — `id`, `name`, `color`, `icon`, `userId`; belongs to `User`; has many `Transaction`.
- **Transaction** — `id`, `amount` (`Decimal(12, 2)`), `type` (`income` | `expense` enum), `description`, `date`, `categoryId`, `userId`.

Cascade rules:
- `User → Category` / `User → Transaction`: `onDelete: Cascade`
- `Category → Transaction`: `onDelete: Restrict` (cannot delete a category with transactions)

## Auth

- Passport JWT strategy under `src/auth/strategies/`
- Route guards under `src/auth/guards/`
- Custom decorators under `src/auth/decorators/` (e.g. `@CurrentUser()`)
- Passwords hashed with `bcrypt` before persistence

## Документация

- **JSDoc**: после изменения методов (сервисов, репозиториев, handlers) — обновляй JSDoc над сигнатурой.
- **Swagger**: для DTO и контроллеров — добавляй/обновляй декораторы (`@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiProperty`, `@ApiBearerAuth` и т.п.), чтобы `/api/docs` оставался точным.

## Notes

- Experimental decorators are required by NestJS (already enabled in `tsconfig.json`).
- Do not access Prisma directly from controllers — go through the feature repository.
- New endpoints must ship with DTOs (validated) and Swagger decorators in the same PR.
