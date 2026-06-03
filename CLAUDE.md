# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an expense tracker application built with a **monorepo structure** using npm workspaces, containing:
- **Frontend**: Next.js 16 with React 19 and TypeScript, styled with Tailwind CSS
- **Backend**: NestJS 11 API server with Prisma 6 ORM and PostgreSQL database

## Technology Stack

| Layer | Tech | Version |
|-------|------|---------|
| Frontend Framework | Next.js | 16.0.0 |
| UI Library | React | 19.0.0 |
| Styling | Tailwind CSS | 4.0.0 |
| Backend Framework | NestJS | 11.0.0 |
| ORM | Prisma | 6.0.0 |
| Database | PostgreSQL | (via DATABASE_URL env) |
| Language | TypeScript | 5.0.0 |

## Development Setup

### Prerequisites
- Node.js and npm installed
- PostgreSQL running locally or accessible via `DATABASE_URL` environment variable

### Environment Configuration
Create a `.env.local` file in the backend directory with:
```
DATABASE_URL=postgresql://user:password@localhost:5432/expense_tracker
```

### Installing Dependencies
```bash
npm install  # Installs dependencies for both workspaces
```

## Common Commands

All commands are run from the **project root** and use npm workspaces.

### Frontend Development
```bash
npm run dev:frontend          # Start Next.js dev server (port 3000)
npm run build:frontend        # Build frontend for production
```

### Backend Development
```bash
npm run dev:backend           # Start NestJS dev server in watch mode (port 3001)
npm run build:backend         # Build backend for production
npm run start:prod            # Run compiled backend
```

### Database
```bash
npm run prisma:generate       # Generate Prisma client
npm run prisma:migrate        # Run database migrations (in backend workspace)
```

### Linting & Formatting
```bash
npm run lint                  # Lint all workspaces (ESLint)
npm run format                # Format all files with Prettier
```

## Architecture

### Backend Structure
- **Framework**: NestJS modules provide dependency injection and structured organization
- **API Prefix**: All endpoints are under `/api` (set in `src/main.ts`)
- **Default Port**: 3001
- **Database**: PostgreSQL accessed through Prisma ORM
- **Entry Point**: `src/main.ts` bootstraps the NestJS application

### Frontend Structure
- **Framework**: Next.js 16 with App Router
- **Path Alias**: `@/*` maps to `src/` for imports (configured in `tsconfig.json`)
- **Styling**: Tailwind CSS with PostCSS
- **Default Port**: 3000
- **Layout**: Root layout in `src/app/layout.tsx` (set to Russian locale)

### Communication
Frontend makes requests to the backend API running on port 3001 with `/api` prefix (e.g., `http://localhost:3001/api/*`).

## Development Workflow

1. **Start both servers**:
   ```bash
   npm run dev:backend &     # Terminal 1
   npm run dev:frontend      # Terminal 2
   ```

2. **Set up database** (if needed):
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

3. **Access the app**: Open `http://localhost:3000` in your browser

## TypeScript Configuration

Both frontend and backend use strict TypeScript settings with:
- Strict mode enabled
- Source maps for debugging
- Proper module resolution
- Decorator support (required for NestJS)

## Frontend Architecture — Feature Slice Design (FSD)

The frontend follows [Feature Slice Design](https://feature-sliced.design/) methodology. Layers from high-level to low-level:

```
src/
  app/         # Next.js App Router routes (thin wrappers only — import from pages/)
  views/       # FSD pages layer — full page components composed from widgets/features
               # (named "views" instead of "pages" to avoid Next.js Pages Router conflict)
  widgets/     # Complex self-contained UI blocks combining multiple features/entities
  features/    # User-facing functionality slices (e.g. features/auth)
               #   ui/       — React components for this feature
               #   api/      — API calls specific to this feature
               #   model/    — state, stores, hooks, types
  entities/    # Business entities (e.g. entities/user)
               #   model/    — types, stores, selectors
               #   ui/       — entity display components
  shared/      # Reusable infrastructure, no business logic
               #   api/      — base fetch wrapper (base.ts)
               #   ui/       — shadcn/ui components (button, input, card, form, label…)
               #   lib/      — utility functions (utils.ts with cn())
```

**Key rules:**
- Imports go strictly downward: `app → pages → widgets → features → entities → shared`
- No cross-slice imports within the same layer (e.g. features/auth must not import features/expenses)
- `src/app/` route files are thin: they only import and render the matching `src/pages/` component
- shadcn/ui components live in `shared/ui/<component-name>/index.tsx`

## UI Components — shadcn/ui

shadcn/ui components are manually maintained in `shared/ui/`. Available components:
- `button`, `input`, `label`, `card`, `form`

CSS design tokens (colors, radius) are defined as CSS variables in `globals.css` and mapped in `tailwind.config.ts`.

## Notes

- Frontend uses Tailwind CSS v4 with PostCSS
- Backend uses experimental decorators required by NestJS
- The monorepo structure allows independent optimization of frontend and backend
