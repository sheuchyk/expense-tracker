# База данных

- **СУБД:** PostgreSQL 16 (см. `docker-compose.yml`)
- **ORM:** Prisma 6
- **Схема:** [`backend/prisma/schema.prisma`](../../backend/prisma/schema.prisma)
- **Подключение:** переменная окружения `DATABASE_URL` в `backend/.env`

## Enum-ы

### `TransactionType`

Значения: `income` | `expense`. Используется в поле `Transaction.type`.

---

## Таблица `users`

Prisma-модель `User`. Один пользователь владеет своими категориями и транзакциями.

| Поле | Тип (Prisma) | Тип (PostgreSQL) | Ограничения | Назначение |
|------|--------------|------------------|-------------|------------|
| `id` | `Int` | `serial` | PK, `@default(autoincrement())` | Первичный ключ. |
| `name` | `String` | `text` | not null | Отображаемое имя пользователя. |
| `email` | `String` | `text` | `@unique`, not null | Логин, уникальный. |
| `password` | `String` | `text` | not null | Хеш пароля (`bcrypt`), никогда не хранится в открытом виде. |
| `createdAt` | `DateTime` | `timestamp` | `@default(now())` | Момент регистрации. |
| `updatedAt` | `DateTime` | `timestamp` | `@updatedAt` | Автообновляется при изменении записи. |

**Связи:**
- `categories: Category[]` — one-to-many.
- `transactions: Transaction[]` — one-to-many.

---

## Таблица `categories`

Prisma-модель `Category`. Категория расходов/доходов, принадлежит конкретному пользователю.

| Поле | Тип (Prisma) | Тип (PostgreSQL) | Ограничения | Назначение |
|------|--------------|------------------|-------------|------------|
| `id` | `Int` | `serial` | PK, `@default(autoincrement())` | Первичный ключ. |
| `name` | `String` | `text` | not null, 1–64 символа (валидация DTO) | Название категории. |
| `color` | `String` | `text` | not null, hex `#RRGGBB` (валидация DTO) | Цвет для UI. |
| `icon` | `String` | `text` | not null | Идентификатор иконки (lucide). |
| `userId` | `Int` | `integer` | FK → `users.id`, `onDelete: Cascade`, индекс `@@index([userId])` | Владелец категории. |
| `createdAt` | `DateTime` | `timestamp` | `@default(now())` | Дата создания. |
| `updatedAt` | `DateTime` | `timestamp` | `@updatedAt` | Дата последнего изменения. |

**Связи:**
- `user: User` — many-to-one, каскадное удаление вместе с пользователем.
- `transactions: Transaction[]` — one-to-many.

**Индексы:** `@@index([userId])` — быстрый список категорий пользователя.

---

## Таблица `transactions`

Prisma-модель `Transaction`. Одна финансовая операция пользователя.

| Поле | Тип (Prisma) | Тип (PostgreSQL) | Ограничения | Назначение |
|------|--------------|------------------|-------------|------------|
| `id` | `Int` | `serial` | PK, `@default(autoincrement())` | Первичный ключ. |
| `amount` | `Decimal` | `numeric(12, 2)` | not null, > 0 (валидация DTO) | Сумма операции. Precision 12, scale 2 — до 9 999 999 999.99. |
| `type` | `TransactionType` | enum | not null | `income` или `expense`. |
| `description` | `String` | `text` | not null, ≤ 255 (валидация DTO) | Пользовательское описание. |
| `date` | `DateTime` | `timestamp` | not null | Дата операции (задаётся пользователем, не то же самое, что `createdAt`). |
| `categoryId` | `Int` | `integer` | FK → `categories.id`, `onDelete: Restrict`, индекс `@@index([categoryId])` | Категория операции. |
| `userId` | `Int` | `integer` | FK → `users.id`, `onDelete: Cascade`, индекс `@@index([userId])` | Владелец операции. |
| `createdAt` | `DateTime` | `timestamp` | `@default(now())` | Когда запись создана. |
| `updatedAt` | `DateTime` | `timestamp` | `@updatedAt` | Когда запись изменена. |

**Связи:**
- `user: User` — many-to-one, каскадное удаление вместе с пользователем.
- `category: Category` — many-to-one, `onDelete: Restrict` — категорию нельзя удалить, пока к ней привязаны транзакции.

**Индексы:** `@@index([userId])`, `@@index([categoryId])` — ускоряют фильтрацию и агрегирующие запросы (списки, суммы за период).

---

## Правила каскадов

| Родитель → Ребёнок | Правило | Смысл |
|---------------------|---------|-------|
| `User → Category` | `Cascade` | Удаление пользователя чистит его категории. |
| `User → Transaction` | `Cascade` | Удаление пользователя чистит его транзакции. |
| `Category → Transaction` | `Restrict` | Нельзя удалить категорию с транзакциями — сначала перепривяжите или удалите операции. |

---

## Инварианты

- Пароль — только в виде хеша `bcrypt`, минимум 6 символов до хеширования (валидация DTO).
- `email` уникален (Prisma `@unique`).
- `amount` строго положительный (валидация DTO); знак операции определяет `type`, а не `amount`.
- Транзакция всегда привязана к категории того же пользователя — проверяется в handler-е (валидация уровня приложения, не в схеме БД).
- `date` — момент операции, задаётся пользователем; для внутренних меток времени используйте `createdAt` / `updatedAt`.

---

## Соглашения по именованию

- Модели Prisma — в PascalCase (`User`, `Category`, `Transaction`).
- Имена таблиц в БД — snake_case во множественном числе через `@@map("users")`, `@@map("categories")`, `@@map("transactions")`.
- Enum-ы — lowercase (`income`, `expense`) для совместимости с JSON-полями и UI.
