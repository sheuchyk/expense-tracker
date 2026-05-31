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

## Notes

- This is a fresh project with minimal scaffolding—use this as a foundation for building features
- Frontend uses Tailwind CSS v4 with PostCSS
- Backend uses experimental decorators required by NestJS
- The monorepo structure allows independent optimization of frontend and backend
