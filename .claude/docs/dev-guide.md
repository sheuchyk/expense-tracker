# Dev Guide

Практические рецепты: как добавить backend-модуль, frontend-фичу и Prisma-миграцию. Стиль и правила — см. [architecture.md](architecture.md), корневой [CLAUDE.md](../../CLAUDE.md) и файлы CLAUDE.md в воркспейсах.

---

## 1. Добавить backend-модуль (CQRS)

Пример: новый ресурс `Budget`. Все backend-модули (`user`, `category`, `transaction`) построены по этой же схеме — используйте их как эталон.

### 1.1. Создать ветку

```bash
git checkout master && git pull
git checkout -b feat/budgets-module
```

### 1.2. Обновить схему Prisma

`backend/prisma/schema.prisma`:

```prisma
model Budget {
  id        Int      @id @default(autoincrement())
  amount    Decimal  @db.Decimal(12, 2)
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@map("budgets")
}
```

Добавьте обратную связь в `User`:

```prisma
budgets Budget[]
```

Сгенерируйте клиент и миграцию (см. раздел 3).

### 1.3. Каркас модуля

Из `backend/`:

```bash
npx nest g module budget --no-spec
npx nest g controller budget --no-spec
```

Или создайте руками. Итоговая структура:

```
backend/src/budget/
├── budget.controller.ts
├── budget.module.ts
├── budget.repository.ts
├── dto/
│   ├── create-budget.dto.ts
│   └── update-budget.dto.ts
├── commands/
│   ├── create-budget.command.ts
│   ├── update-budget.command.ts
│   ├── delete-budget.command.ts
│   └── handlers/
│       ├── create-budget.handler.ts
│       ├── update-budget.handler.ts
│       └── delete-budget.handler.ts
└── queries/
    ├── get-budget-by-id.query.ts
    ├── get-budgets.query.ts
    └── handlers/
        ├── get-budget-by-id.handler.ts
        └── get-budgets.handler.ts
```

### 1.4. Написать код по чек-листу

- **DTO** — `class-validator` + Swagger-декораторы (`@ApiProperty`), JSDoc над классом.
- **Repository** — единственная точка доступа к Prisma для этого модуля.
- **Command / Query** — простые POJO-классы: конструктор с полями, никакой логики.
- **Handler** — реализует `ICommandHandler` / `IQueryHandler`, инжектит `BudgetRepository`, содержит бизнес-логику.
- **Controller** — только маршрутизация: инжектит `CommandBus`/`QueryBus`, вызывает `execute(new XxxCommand(...))`. Обязательно:
  - `@UseGuards(JwtAuthGuard)` (если ресурс приватный),
  - `@CurrentUser()` для скоупа по пользователю,
  - `@ApiTags(...)`, `@ApiBearerAuth()`, `@ApiOperation`, `@ApiResponse`,
  - JSDoc над методом (`@param`, `@returns`, `@throws`).

### 1.5. `budget.module.ts`

```ts
@Module({
  imports: [CqrsModule, PrismaModule],
  controllers: [BudgetController],
  providers: [
    BudgetRepository,
    CreateBudgetHandler,
    UpdateBudgetHandler,
    DeleteBudgetHandler,
    GetBudgetByIdHandler,
    GetBudgetsHandler,
  ],
})
export class BudgetModule {}
```

### 1.6. Подключить модуль

`backend/src/app.module.ts`:

```ts
imports: [
  // ...,
  BudgetModule,
],
```

### 1.7. Проверить

```bash
npm run dev:backend
# curl -H "Authorization: Bearer <JWT>" http://localhost:3001/api/budgets
# открыть http://localhost:3001/api/docs — новые эндпоинты должны появиться
```

### 1.8. Обновить документацию

- `.claude/docs/api.md` — эндпоинты и DTO.
- `.claude/docs/database.md` — новая таблица.
- Swagger — автоматически, если декораторы проставлены.

---

## 2. Добавить frontend-фичу (FSD)

Пример: экран «Список бюджетов» с формой создания.

### 2.1. Определить, где что живёт

| Что | Где | Почему |
|-----|-----|--------|
| Тип `Budget`, model | `src/entities/budget/model/` | Бизнес-сущность |
| API-клиент | `src/features/budgets/api/budgetsApi.ts` | Feature-специфичный HTTP |
| Форма создания, список | `src/features/budgets/ui/` | UI фичи |
| Хук / стор фичи | `src/features/budgets/model/` | Состояние формы, кэш |
| Виджет для дашборда | `src/widgets/budgets-overview/ui/` | Комбинирует entity + feature |
| Страница | `src/views/budgets/` | Компонует виджеты/фичи |
| Route | `src/app/budgets/page.tsx` | Тонкий импорт из `views/` |

### 2.2. Правила импортов

Строго вниз: `app → views → widgets → features → entities → shared`. Внутри слоя слайсы (`features/auth`, `features/budgets`) не импортируют друг друга.

### 2.3. Каркас

```
src/features/budgets/
├── api/budgetsApi.ts       # использует base fetch из shared/api/base.ts
├── model/useBudgets.ts     # react-hook, react-query, zustand — по ситуации
└── ui/
    ├── BudgetList.tsx
    └── BudgetForm.tsx      # react-hook-form + zod + shadcn Form
```

`src/views/budgets/index.tsx` — собирает страницу из виджетов/фич.

`src/app/budgets/page.tsx`:

```tsx
import { BudgetsView } from '@/views/budgets';

export default function BudgetsPage() {
  return <BudgetsView />;
}
```

### 2.4. Формы

- Схема — `zod`.
- Резолвер — `@hookform/resolvers/zod`.
- Обёртка — `Form` из `shared/ui/form`.

### 2.5. Стили и компоненты

- Используйте существующие shadcn-компоненты из `shared/ui/`. Не переизобретайте.
- Новые общие компоненты добавляйте в `shared/ui/<name>/index.tsx`.
- CSS-переменные — в `globals.css`; никаких hex-значений «на месте».

### 2.6. Проверить

```bash
npm run dev:frontend
# открыть http://localhost:3000/budgets
npm --workspace frontend run lint
```

---

## 3. Prisma-миграции

### 3.1. Изменить схему

Отредактируйте `backend/prisma/schema.prisma`.

### 3.2. Создать миграцию (dev)

Из корня:

```bash
npm run prisma:migrate       # эквивалент prisma migrate dev в workspace backend
```

Prisma спросит имя миграции — используйте kebab-case, описывающий изменение: `add-budget-table`, `budget-add-name`, `transaction-index-date`.

Что произойдёт:
- сгенерируется папка `backend/prisma/migrations/<timestamp>-<name>/migration.sql`;
- миграция применится к локальной БД;
- Prisma Client перегенерируется.

### 3.3. Ручная генерация клиента (если нужна отдельно)

```bash
npm run prisma:generate
```

### 3.4. Правила безопасных миграций

- **Комитьте `migration.sql` вместе с изменением схемы.** Никогда не редактируйте уже применённые миграции — вместо этого создавайте новую.
- **Обратно-совместимые изменения** — добавление nullable-полей, новых таблиц/индексов. Такие миграции безопасны.
- **Разрушительные изменения** (удаление/переименование колонок, смена типа, `NOT NULL` без дефолта) — разбивайте на несколько шагов: сначала добавить, потом бэкфилл, потом удалить старое.
- **Не редактируйте базу вручную** — только через миграции.
- **Индексы** — добавляйте, если увидели фильтр/сортировку по колонке в query-handler.

### 3.5. Продакшен

```bash
npx prisma migrate deploy    # применяет все pending-миграции без интерактива
```

### 3.6. Сброс локальной БД

Только в dev, только осознанно (**удаляет данные**):

```bash
npx prisma migrate reset     # выполняется из backend/
```

---

## 4. Общие правила PR

- Ветка от `master`: `feat/<name>` | `fix/<name>` | `docs/<name>` | `refactor/<name>` | `chore/<name>`.
- Коммиты — Conventional Commits (`feat(budgets): add module` и т. п.).
- Перед PR:
  - `npm run lint` — зелёный.
  - `npm run format` — Prettier применён.
  - Backend: обновлены JSDoc и Swagger-декораторы для изменённых методов/DTO/контроллеров.
  - Frontend: проверили страницу вручную (dev-server).
  - Обновили `.claude/docs/*.md`, если поменяли контракты, схему БД или архитектуру.
- Merge — squash в `master`, ветку удалить.

---

## 5. Быстрые команды

| Что | Команда |
|-----|---------|
| Установить всё | `npm install` |
| Запустить БД | `docker compose up -d` |
| Prisma Client | `npm run prisma:generate` |
| Миграция dev | `npm run prisma:migrate` |
| Backend dev | `npm run dev:backend` |
| Frontend dev | `npm run dev:frontend` |
| Lint | `npm run lint` |
| Format | `npm run format` |
| Swagger UI | <http://localhost:3001/api/docs> |
