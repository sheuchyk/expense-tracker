# План: Модуль транзакций (TransactionModule)

## Context

Проект — expense tracker (NestJS + Prisma + PostgreSQL). Уже есть `User`, JWT-авторизация и модуль категорий (`backend/src/category/`), построенный на CQRS. Сейчас нет центрального модуля для учёта доходов и расходов.

Задача — создать `TransactionModule` по образцу `category/`: модель данных `Transaction`, CRUD-эндпоинты под `/api/transactions` с JWT-защитой и scoping по `userId`, а `GET /transactions` дополнительно фильтрует по `month`/`year` и возвращает **список транзакций + сводку** (доходы, расходы, баланс).

Решения по уточнениям:
- `GET /transactions` → `{ transactions: [...], summary: { totalIncome, totalExpense, balance } }`.
- Проверку владения `categoryId` НЕ делаем (доверяем DTO).

Реальная структура модулей — `backend/src/<name>/` (не `src/modules/categories/`, как в промпте). Следуем фактическому паттерну `backend/src/category/`.

## Паттерн (из `backend/src/category/`)

- `*.module.ts` — `imports: [CqrsModule]`, controller, `providers: [Repository, ...CommandHandlers, ...QueryHandlers]`.
- Контроллер: `@UseGuards(JwtAuthGuard)` + `@Controller('transactions')`, инжектит `CommandBus`/`QueryBus`, берёт `@CurrentUser() user: { id: number }`, использует `ParseIntPipe` для `:id`.
- Команды/запросы — простые классы с `public readonly` полями; хендлеры в `commands/handlers/` и `queries/handlers/` с barrel-файлами `index.ts` (`CommandHandlers`, `QueryHandlers`).
- Repository инжектит `PrismaService` (модуль `PrismaModule` — `@Global`, импортировать не нужно).
- DTO — `class-validator`; глобальный `ValidationPipe` уже настроен в `main.ts` (`whitelist`, `forbidNonWhitelisted`, `transform: true`).
- `Prisma` client типы импортируются из `@prisma/client`.

## Шаги реализации

### 1. Prisma-схема — `backend/prisma/schema.prisma`
- Добавить enum:
  ```prisma
  enum TransactionType {
    income
    expense
  }
  ```
- Добавить модель `Transaction` (поля из промпта): `id`, `amount Decimal @db.Decimal(12, 2)`, `type TransactionType`, `description String`, `date DateTime`, `categoryId Int`, `userId Int`, `createdAt`, `updatedAt`. Связи `user` (onDelete: Cascade) и `category` (onDelete: Restrict). Индексы `@@index([userId])`, `@@index([categoryId])`, `@@map("transactions")`.
- Добавить обратные связи: `transactions Transaction[]` в `User` и в `Category`.

### 2. Структура `backend/src/transaction/` (зеркало `category/`)

```
transaction/
  transaction.module.ts
  transaction.controller.ts
  transaction.repository.ts
  dto/
    create-transaction.dto.ts
    update-transaction.dto.ts
    query-transactions.dto.ts          # month/year фильтр
  commands/
    create-transaction.command.ts
    update-transaction.command.ts
    delete-transaction.command.ts
    handlers/
      index.ts
      create-transaction.handler.ts
      update-transaction.handler.ts
      delete-transaction.handler.ts
  queries/
    get-transactions.query.ts           # userId + month/year
    get-transaction-by-id.query.ts
    handlers/
      index.ts
      get-transactions.handler.ts
      get-transaction-by-id.handler.ts
```

### 3. DTO (class-validator)
- `CreateTransactionDto`: `amount` (`@IsNumber`, `@IsPositive`, `@Type(() => Number)`), `type` (`@IsEnum(TransactionType)`), `description` (`@IsString @MaxLength(255)`), `date` (`@IsDateString`), `categoryId` (`@IsInt @IsPositive @Type(() => Number)`).
- `UpdateTransactionDto`: все поля через `@IsOptional` (как `update-category.dto.ts`).
- `QueryTransactionsDto`: `month?` (`@IsOptional @IsInt @Min(1) @Max(12) @Type(() => Number)`), `year?` (`@IsOptional @IsInt @Type(() => Number)`). `TransactionType` импортировать из `@prisma/client`.

### 4. Repository — `transaction.repository.ts`
По образцу `category.repository.ts`:
- `create(userId, dto)` — `prisma.transaction.create`, `date: new Date(dto.date)`.
- `findManyByUser(userId, { month, year })` — `findMany({ where: { userId, ...dateRange }, orderBy: { date: 'desc' } })`. Когда заданы `month`/`year` — фильтр `date: { gte, lt }` по границам месяца/года (вычислять через `new Date(...)`).
- `findByIdForUser(id, userId)` — `findFirst({ where: { id, userId } })`.
- `update(id, userId, dto)`, `delete(id, userId)` — как у категорий.

### 5. Commands / Queries / Handlers
- Команды/запросы — классы с `public readonly` (см. `create-category.command.ts`).
- `CreateTransactionHandler` — без проверки категории (по решению), просто `repository.create`. (User уже гарантирован JWT-гардом — проверку существования user, как в `create-category.handler`, можно опустить, т.к. категорию мы не проверяем; для единообразия допустимо оставить минимально, но по умолчанию не добавляем.)
- `Update`/`Delete` хендлеры — сперва `findByIdForUser`, `NotFoundException('Transaction not found')` если нет, затем операция (как у категорий).
- `GetTransactionsHandler` — получает список через repository, считает `summary`: `totalIncome` = сумма `amount` где `type === income`, `totalExpense` где `expense`, `balance = totalIncome - totalExpense`. Возвращает `{ transactions, summary }`.
- `GetTransactionByIdHandler` — `findByIdForUser` + `NotFoundException`.
- barrel-файлы `index.ts` экспортируют `CommandHandlers` / `QueryHandlers`.

### 6. Контроллер — `transaction.controller.ts`
По образцу `category.controller.ts`:
- `POST /` → `CreateTransactionCommand(user.id, dto)`
- `GET /` → `GetTransactionsQuery(user.id, query)` — принимает `@Query() query: QueryTransactionsDto`
- `GET /:id` → `GetTransactionByIdQuery(id, user.id)`
- `PATCH /:id` → `UpdateTransactionCommand(id, user.id, dto)`
- `DELETE /:id` → `DeleteTransactionCommand(id, user.id)`

### 7. Регистрация модуля — `backend/src/app.module.ts`
Добавить `TransactionModule` в `imports`.

## Файлы для изменения / создания
- Изменить: `backend/prisma/schema.prisma`, `backend/src/app.module.ts`
- Создать: всё дерево `backend/src/transaction/` (см. п.2)

## Verification
1. `npm run prisma:generate` (из корня) — генерирует клиент с новой моделью/enum.
2. `npm run prisma:migrate` — миграция `add_transactions` (нужна запущенная БД; если БД нет — отметить и пропустить).
3. `npm run build:backend` — сборка должна пройти без ошибок TS (это и есть требование «после реализации запустить сборку»).
4. Ручная проверка (опц., при запущенном backend `npm run dev:backend`) с JWT-токеном:
   - `POST /api/transactions` создаёт транзакцию;
   - `GET /api/transactions?month=6&year=2026` возвращает `{ transactions, summary }` с корректными суммами;
   - `GET/PATCH/DELETE /api/transactions/:id` работают и возвращают 404 для чужого/несуществующего id.

## Ограничения (соблюдены)
- Новых зависимостей не добавляем (`@nestjs/cqrs`, `class-validator`, `class-transformer` уже есть).
- DTO — только `class-validator` / `class-transformer`.
- После реализации — сборка backend.
