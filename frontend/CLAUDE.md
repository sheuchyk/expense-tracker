# Frontend — CLAUDE.md

Guidance for the Next.js frontend workspace. See the [root CLAUDE.md](../CLAUDE.md) for monorepo-wide conventions.

## Overview

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript 5
- **Styling**: Tailwind CSS 4 with PostCSS
- **Forms**: `react-hook-form` + `zod` (via `@hookform/resolvers`)
- **UI primitives**: Radix UI (`@radix-ui/react-label`, `@radix-ui/react-slot`) + shadcn/ui
- **Icons**: `lucide-react`
- **Class utilities**: `clsx`, `tailwind-merge`, `class-variance-authority`

## Development Commands

Run from the project root (recommended) or from `frontend/`:

```bash
npm run dev:frontend          # from root — Next.js dev server on http://localhost:3000
npm run build:frontend        # production build
npm --workspace frontend run lint
```

## Configuration

- **Default port**: 3000
- **Path alias**: `@/*` maps to `src/*` (see `tsconfig.json`)
- **Root layout**: `src/app/layout.tsx` — sets Russian locale (`<html lang="ru">`)
- **Global styles / design tokens**: `src/app/globals.css` (CSS variables), mapped in `tailwind.config.ts`

## Backend API

Frontend calls the backend at `http://localhost:3001/api/*`. Use the shared fetch wrapper in `src/shared/api/` (`base.ts`) rather than raw `fetch`.

## Architecture — Feature Slice Design (FSD)

The frontend follows [Feature Slice Design](https://feature-sliced.design/). Layers from high-level to low-level:

```
src/
  app/         # Next.js App Router routes (thin wrappers — import from views/)
    login/           # /login route → renders views/login
    register/        # /register route → renders views/register
    layout.tsx       # root layout (lang="ru")
    page.tsx         # home route → renders views/home

  views/       # FSD pages layer — full page components composed from widgets/features
               # (named "views" to avoid conflict with Next.js Pages Router)
    home/            # authenticated dashboard
    login/           # login page
    register/        # registration page

  widgets/     # Complex self-contained UI blocks combining multiple features/entities
    main-menu/
    recent-transactions/
    user-profile/

  features/    # User-facing functionality slices
    auth/            # login/register — ui/, api/authApi.ts, model/session.ts
    transactions/    # api/transactionsApi.ts

  entities/    # Business entities (types, models, entity-level UI)
    user/            # model/
    category/        # model/
    transaction/     # model/

  shared/      # Reusable infrastructure — no business logic
    api/             # base fetch wrapper (base.ts)
    ui/              # shadcn/ui components (button, card, form, input, label)
    lib/             # utility functions (utils.ts with cn())
```

**Key rules:**

- Imports flow strictly downward: `app → views → widgets → features → entities → shared`
- No cross-slice imports within the same layer (e.g. `features/auth` must not import `features/transactions`)
- `src/app/` route files stay thin: they only import and render the matching `src/views/` component
- shadcn/ui components live in `shared/ui/<component-name>/index.tsx`

## UI Components — shadcn/ui

shadcn/ui components are manually maintained in `src/shared/ui/`. Currently available:

- `button`, `card`, `form`, `input`, `label`

CSS design tokens (colors, radius) are defined as CSS variables in `globals.css` and mapped in `tailwind.config.ts`. When adding a new shadcn component, keep the folder pattern `shared/ui/<name>/index.tsx`.

## Forms

Use `react-hook-form` with `zod` schemas resolved through `@hookform/resolvers/zod`. Compose fields with the `Form` primitive from `shared/ui/form`.

## Notes

- Tailwind CSS v4 uses the new PostCSS plugin (`@tailwindcss/postcss`).
- ESLint uses flat config (`eslint.config.mjs`) and runs via `eslint .` (`next lint` was removed in Next 16) — resolve warnings before opening a PR.
