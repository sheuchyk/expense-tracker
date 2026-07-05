# API Reference

Все эндпоинты доступны под префиксом **`/api`** и живут на `http://localhost:3001`.

- Формат тела запроса/ответа — JSON.
- Защищённые эндпоинты требуют заголовок `Authorization: Bearer <JWT>`.
- Глобальный `ValidationPipe` включён с `whitelist`, `forbidNonWhitelisted`, `transform`. Невалидные поля → `400 Bad Request`.
- Интерактивная спецификация: **`http://localhost:3001/api/docs`** (Swagger UI).

## Auth — `/api/auth`

### POST `/api/auth/register`

Регистрация нового пользователя.

**Body** (`RegisterDto`):

| Поле | Тип | Правила |
|------|-----|---------|
| `name` | string | обязательно |
| `email` | string | обязательно, валидный email, уникален |
| `password` | string | обязательно, min length 6 |

**Ответ:** созданный пользователь + JWT.

**Ошибки:** `400` — валидация; `409` — email занят.

---

### POST `/api/auth/login`

Вход, возвращает JWT.

**Body** (`LoginDto`):

| Поле | Тип | Правила |
|------|-----|---------|
| `email` | string | валидный email |
| `password` | string | — |

**Ответ:** `{ user, accessToken }`.

**Ошибки:** `400` — валидация; `401` — неверные креденшалы.

---

### GET `/api/auth/me` 🔒

Данные текущего пользователя (по JWT).

**Auth:** JWT.
**Ответ:** `{ id, name, email, createdAt, updatedAt }`.

**Ошибки:** `401` — JWT отсутствует/невалиден.

---

## Categories — `/api/categories` 🔒

Все эндпоинты требуют JWT. Категории строго скоуплены к текущему пользователю.

### POST `/api/categories`

Создать категорию.

**Body** (`CreateCategoryDto`):

| Поле | Тип | Правила |
|------|-----|---------|
| `name` | string | 1–64 символа |
| `color` | string | hex `#RRGGBB` (regex `^#[0-9a-fA-F]{6}$`) |
| `icon` | string | не пустая |

**Ответ:** `201` — созданная категория.

---

### GET `/api/categories`

Список категорий текущего пользователя.

**Ответ:** `Category[]`.

---

### GET `/api/categories/:id`

Категория по id.

**Path:** `id` — положительное целое.
**Ответ:** `Category`.
**Ошибки:** `404` — не найдено / не принадлежит пользователю.

---

### PATCH `/api/categories/:id`

Обновить категорию. Все поля опциональны — обновляются только присланные.

**Body** (`UpdateCategoryDto`): `name?`, `color?`, `icon?` — те же правила, что в `CreateCategoryDto`.

**Ответ:** обновлённая `Category`.

---

### DELETE `/api/categories/:id`

Удалить категорию.

**Ответ:** удалённая `Category`.
**Ошибки:** `404` — не найдено; ограничение БД `onDelete: Restrict` не даст удалить категорию, если к ней привязаны транзакции.

---

## Transactions — `/api/transactions` 🔒

Все эндпоинты требуют JWT. Транзакции скоуплены к текущему пользователю.

### POST `/api/transactions`

Создать транзакцию.

**Body** (`CreateTransactionDto`):

| Поле | Тип | Правила |
|------|-----|---------|
| `amount` | number | > 0, до 2 знаков после запятой |
| `type` | `income` \| `expense` | Prisma enum `TransactionType` |
| `description` | string | ≤ 255 символов |
| `date` | string | ISO 8601 |
| `categoryId` | integer | > 0, id существующей категории пользователя |

**Ответ:** `201` — созданная транзакция.

---

### GET `/api/transactions`

Список транзакций с пагинацией и агрегированными итогами (income/expense/balance) под применённый фильтр.

**Query** (`QueryTransactionsDto`, все опциональны):

| Параметр | Тип | Диапазон | По умолчанию |
|----------|-----|----------|--------------|
| `month` | integer | 1–12 | — |
| `year` | integer | 1970–2100 | текущий год, если задан `month` |
| `page` | integer | 1–10 000 | 1 |
| `limit` | integer | 1–100 | 10 |

**Ответ (`GetTransactionsResult`):**

```jsonc
{
  "items": [ /* Transaction[] */ ],
  "summary": { "income": 0, "expense": 0, "balance": 0 },
  "pagination": { "page": 1, "limit": 10, "total": 0, "pages": 0 }
}
```

**Ошибки:** `400` — параметры вне диапазона.

---

### GET `/api/transactions/:id`

Транзакция по id.

**Ответ:** `Transaction`.
**Ошибки:** `404` — не найдено / не принадлежит пользователю.

---

### PATCH `/api/transactions/:id`

Обновить транзакцию. Все поля опциональны.

**Body** (`UpdateTransactionDto`): `amount?`, `type?`, `description?`, `date?`, `categoryId?` — те же правила, что в create.

**Ответ:** обновлённая `Transaction`.

---

### DELETE `/api/transactions/:id`

Удалить транзакцию.

**Ответ:** удалённая `Transaction`.

---

## Общие коды ошибок

| Код | Когда |
|-----|-------|
| `400 Bad Request` | Ошибка валидации DTO / query-параметров |
| `401 Unauthorized` | Отсутствует/невалидный JWT, неверные креденшалы на login |
| `403 Forbidden` | Попытка доступа к чужому ресурсу (в отдельных случаях — трактуется как `404`) |
| `404 Not Found` | Ресурс не найден или не принадлежит текущему пользователю |
| `409 Conflict` | Уникальное ограничение (например, `email`) |
| `500 Internal Server Error` | Непредвиденная ошибка |
