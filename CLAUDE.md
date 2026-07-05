# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

For workspace-specific guidance, see:
- [`frontend/CLAUDE.md`](frontend/CLAUDE.md) — Next.js frontend (FSD architecture, shadcn/ui)
- [`backend/CLAUDE.md`](backend/CLAUDE.md) — NestJS backend (modules, Prisma, Swagger, JSDoc)

## Project Overview

Expense tracker application built as a **monorepo** using npm workspaces:
- **Frontend**: Next.js 16 with React 19 and TypeScript, styled with Tailwind CSS
- **Backend**: NestJS 11 API server with Prisma 6 ORM and PostgreSQL database

## Technology Stack

| Layer | Tech | Version |
|-------|------|---------|
| Frontend Framework | Next.js | 16.0.0 |
| UI Library | React | 19.0.0 |
| Styling | Tailwind CSS | 4.0.0 |
| Backend Framework | NestJS | 11.0.0 |
| CQRS | @nestjs/cqrs | 11.0.3 |
| ORM | Prisma | 6.0.0 |
| Database | PostgreSQL | (via DATABASE_URL env) |
| Auth | Passport JWT | 4.0.1 |
| API Docs | Swagger (`@nestjs/swagger`) | 11.4.5 |
| Language | TypeScript | 5.0.0 |

## Repository Layout

```
expense-tracker-my/
  backend/            # NestJS API (workspace)
  frontend/           # Next.js app (workspace)
  docker-compose.yml  # Local PostgreSQL
  package.json        # Root workspace scripts
```

## Development Setup

### Prerequisites
- Node.js and npm installed
- PostgreSQL running locally (see `docker-compose.yml`) or accessible via `DATABASE_URL`

### Installing Dependencies
```bash
npm install  # Installs dependencies for both workspaces
```

## Common Commands

All commands are run from the **project root** and use npm workspaces.

### Frontend
```bash
npm run dev:frontend          # Start Next.js dev server (port 3000)
npm run build:frontend        # Build frontend for production
```

### Backend
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

3. **Access the app**: Open `http://localhost:3000` in your browser.
   - Swagger UI: `http://localhost:3001/api/docs`

## Communication Between Workspaces

Frontend calls the backend API at `http://localhost:3001/api/*`. All backend endpoints are mounted under the `/api` prefix (set in `backend/src/main.ts`). JWT bearer tokens are used for authenticated routes.

## TypeScript Configuration

Both workspaces use strict TypeScript settings with:
- Strict mode enabled
- Source maps for debugging
- Proper module resolution
- Decorator support (required for NestJS)

## Branching — GitHub Flow

The project follows [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow):

**Rules:**
- `master` is the default and always-deployable branch. Never commit directly to `master`.
- Every change (feature, fix, refactor, docs) starts from a fresh branch created off the latest `master`.
- Branch names use the pattern `<type>/<short-kebab-case-description>`, where `<type>` matches a Conventional Commit type (`feat`, `fix`, `docs`, `refactor`, `chore`, etc.).
  - Examples: `feat/main-screen`, `fix/auth-token-expiry`, `refactor/transactions-cqrs`.
- Keep branches short-lived and focused on a single change. Push early and often.
- Open a Pull Request into `master` as soon as the branch is ready for review (draft PRs are fine for work-in-progress).
- Merge only after review and green CI. Prefer **squash merge** to keep `master` history linear and aligned with Conventional Commits.
- Delete the branch after merge (locally and on the remote).

**Typical workflow:**
```bash
git checkout master
git pull
git checkout -b feat/<short-name>
# ...work, commit (see Commit Conventions below)...
git push -u origin feat/<short-name>
# open PR → review → squash merge → delete branch
```

**Pull Request format:**

- **Title** follows Conventional Commits: `feat(scope): short imperative subject` (≤ 72 chars).
- **Body** uses this template:

```markdown
## Summary
- <what was implemented — one bullet per logical area>
- <endpoints added / changed, if any>

## Changes
- **Backend**: <key backend changes>
- **Frontend**: <key frontend changes>

## Test plan
- [ ] <step to manually verify the happy path>
- [ ] <edge case or regression check>
```

- Target branch is always `master`.
- Prefer squash merge; the squash commit message must also follow Conventional Commits.

## Commit Conventions

Commits follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>
```

**Types:**
- `feat` — a new feature
- `fix` — a bug fix
- `docs` — documentation only
- `style` — formatting, no code change
- `refactor` — code change that neither fixes a bug nor adds a feature
- `perf` — performance improvement
- `test` — adding or fixing tests
- `build` — build system or dependencies
- `chore` — other changes that don't modify src or test files

**Rules:**
- `scope` is optional and names the affected module/area (e.g. `transactions`, `auth`, `prisma`).
- `subject` is in the imperative mood, lowercase, no trailing period.
- Keep the subject under ~72 characters; add a body for extra context, separated by a blank line.

**Examples:**
```
feat(transactions): add transaction CRUD module with CQRS
fix(auth): reject expired JWT tokens
docs: document commit conventions
```

## Notes

- Frontend uses Tailwind CSS v4 with PostCSS
- Backend uses experimental decorators required by NestJS
- The monorepo structure allows independent optimization of frontend and backend
