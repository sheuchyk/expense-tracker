# План: модуль Category (категории трат)

## Контекст

В проекте уже реализованы модули `auth` (JWT) и `user` (CQRS-паттерн с `CommandBus`/`QueryBus`, см. [auth-cqrs.md](./auth-cqrs.md)). Нужен новый модуль `category` для категорий трат пользователя: сущность с полями `id`, `name`, `color`, `icon`, `userId` (FK к User), сервис CRUD, контроллер под `JwtAuthGuard`, валидация через `class-validator`. Взаимодействие с User-модулем — через CQRS (QueryBus → `GetUserByIdQuery`), без прямой зависимости от `UserRepository`. Архитектура полностью повторяет паттерн `user`-модуля.

## Чек-лист задач

### 1. Prisma — модель Category
- [ ] Добавить связь `categories Category[]` в модель `User` в `backend/prisma/schema.prisma`
- [ ] Добавить модель `Category` (id, name, color, icon, userId, createdAt, updatedAt, FK с `onDelete: Cascade`, `@@index([userId])`, `@@map("categories")`)
- [ ] Запустить миграцию: `npm run prisma:migrate` (название `add_category`)
- [ ] Сгенерировать клиент: `npm run prisma:generate`

```prisma
model Category {
  id     Int    @id @default(autoincrement())
  name   String
  color  String
  icon   String
  userId Int
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@map("categories")
}
```

### 2. DTO с `class-validator`
- [ ] `backend/src/category/dto/create-category.dto.ts`: `name` (`@IsString`, `@MinLength(1)`, `@MaxLength(64)`), `color` (`@IsString`, `@Matches(/^#[0-9a-fA-F]{6}$/)`), `icon` (`@IsString`, `@MinLength(1)`)
- [ ] `backend/src/category/dto/update-category.dto.ts`: те же поля с `@IsOptional()` (без `@nestjs/mapped-types`, чтобы не плодить зависимости)

Глобальный `ValidationPipe` уже подключён в `src/main.ts` — донастройка не нужна.

### 3. Repository
- [ ] `backend/src/category/category.repository.ts` — инжектится `PrismaService` (он `@Global()`):
  - `create(userId, dto)` → `prisma.category.create`
  - `findAllByUser(userId)` → `prisma.category.findMany({ where: { userId } })`
  - `findByIdForUser(id, userId)` → `prisma.category.findFirst({ where: { id, userId } })`
  - `update(id, userId, dto)` → `prisma.category.update` (после проверки владения)
  - `delete(id, userId)` → `prisma.category.delete`

Проверка владения (id + userId) выполняется в хендлерах, при отсутствии — `NotFoundException`.

### 4. Commands + Handlers
- [ ] `commands/create-category.command.ts` + `commands/handlers/create-category.handler.ts`
  - В хендлере **взаимодействие с User-модулем через CQRS**: `await this.queryBus.execute(new GetUserByIdQuery(userId))`, если `null` → `NotFoundException('User not found')`
  - Затем `categoryRepository.create(userId, dto)`
- [ ] `commands/update-category.command.ts` + handler — проверка владения через `findByIdForUser`, затем update
- [ ] `commands/delete-category.command.ts` + handler — проверка владения, затем delete
- [ ] `commands/handlers/index.ts` — экспорт массива `CommandHandlers`

### 5. Queries + Handlers
- [ ] `queries/get-categories-by-user.query.ts` + handler → `findAllByUser`
- [ ] `queries/get-category-by-id.query.ts` (id + userId) + handler → `findByIdForUser`, `NotFoundException` если нет
- [ ] `queries/handlers/index.ts` — экспорт массива `QueryHandlers`

### 6. Controller `backend/src/category/category.controller.ts`
- [ ] Префикс `categories` (итоговый путь — `/api/categories` из-за глобального префикса в `main.ts`)
- [ ] Класс под `@UseGuards(JwtAuthGuard)`
- [ ] `userId` через `@CurrentUser()` (`backend/src/auth/decorators/current-user.decorator.ts`)
- [ ] `:id` через `ParseIntPipe`
- [ ] Эндпоинты:

| Метод | Маршрут | Действие |
|------|---------|----------|
| `POST`   | `/`     | `commandBus.execute(new CreateCategoryCommand(user.id, dto))` |
| `GET`    | `/`     | `queryBus.execute(new GetCategoriesByUserQuery(user.id))` |
| `GET`    | `/:id`  | `queryBus.execute(new GetCategoryByIdQuery(id, user.id))` |
| `PATCH`  | `/:id`  | `commandBus.execute(new UpdateCategoryCommand(id, user.id, dto))` |
| `DELETE` | `/:id`  | `commandBus.execute(new DeleteCategoryCommand(id, user.id))` |

### 7. Module `backend/src/category/category.module.ts`
- [ ] `imports: [CqrsModule, UserModule]` — `UserModule` нужен, чтобы `QueryBus` видел `GetUserByIdHandler` (он зарегистрирован в `UserModule` и `UserModule` экспортирует `CqrsModule`)
- [ ] `controllers: [CategoryController]`
- [ ] `providers: [CategoryRepository, ...CommandHandlers, ...QueryHandlers]`

### 8. Регистрация в `AppModule`
- [ ] Добавить `CategoryModule` в `imports` в `backend/src/app.module.ts`

## Переиспользуемое (не дублировать)

- `PrismaService` — `backend/src/prisma/prisma.service.ts` (глобальный)
- `JwtAuthGuard` — `backend/src/auth/guards/jwt-auth.guard.ts`
- `CurrentUser` декоратор — `backend/src/auth/decorators/current-user.decorator.ts` (возвращает `{ id, email }`)
- `GetUserByIdQuery` — `backend/src/user/queries/get-user-by-id.query.ts`
- Глобальный `ValidationPipe` уже в `main.ts`

## Структура модуля

```
backend/src/category/
  commands/
    create-category.command.ts
    update-category.command.ts
    delete-category.command.ts
    handlers/
      create-category.handler.ts
      update-category.handler.ts
      delete-category.handler.ts
      index.ts
  queries/
    get-categories-by-user.query.ts
    get-category-by-id.query.ts
    handlers/
      get-categories-by-user.handler.ts
      get-category-by-id.handler.ts
      index.ts
  dto/
    create-category.dto.ts
    update-category.dto.ts
  category.repository.ts
  category.controller.ts
  category.module.ts
```

## Верификация

- [ ] `npm run prisma:migrate` — миграция применяется, таблица `categories` создаётся с FK на `users`
- [ ] `npm run build:backend` — компиляция без ошибок
- [ ] `npm run lint` — без ошибок
- [ ] `npm run dev:backend` + ручные проверки (curl/Postman):
  - [ ] Получить JWT через `/api/auth/login`
  - [ ] `POST /api/categories` с валидным телом → 201, в ответе `userId` текущего юзера
  - [ ] `POST` без авторизации → 401
  - [ ] `POST` с невалидным `color` (не hex) → 400
  - [ ] `GET /api/categories` → массив только своих категорий
  - [ ] `GET /api/categories/:id` чужой категории → 404
  - [ ] `PATCH /api/categories/:id` своей → 200; чужой → 404
  - [ ] `DELETE /api/categories/:id` → 200/204; повторный → 404
- [ ] Проверить через Prisma Studio / `psql`, что при удалении пользователя его категории удаляются (`onDelete: Cascade`)
