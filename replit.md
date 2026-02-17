# SA Government – SMME Digital Enablement Platform

## Overview

This is a full-stack web application called **"SA Government – SMME Platform"** that provides digital enablement tools for Small, Medium, and Micro Enterprises (SMMEs) in South Africa. The platform allows SMEs to register their businesses, redeem government-issued vouchers for subsidized access, generate AI-powered websites, create social media content, and produce PDF invoices.

The app follows a government portal style with South African national colors (Green #007A4D, Gold #FFB81C, Black #111111, Red #DE3831, Blue #002395) and a clean, mobile-first design.

**Key features:**
- SME business registration with POPIA consent
- Voucher system (R899/month subscription, 6-month voucher codes)
- AI-powered website builder (generates hero/about/services/contact sections)
- Social media post generator (Facebook, Instagram, LinkedIn)
- Invoice creation with PDF download
- Admin dashboard with stats and voucher management

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework:** React 18 with TypeScript, built with Vite
- **Routing:** Wouter (lightweight client-side router)
- **State Management:** TanStack React Query for server state; React hooks for local state
- **UI Components:** shadcn/ui (new-york style) built on Radix UI primitives
- **Styling:** Tailwind CSS with CSS variables for theming; custom SA government color palette defined in `client/src/index.css`
- **Forms:** react-hook-form with Zod validation via @hookform/resolvers
- **Animations:** Framer Motion for page transitions and entry animations
- **Charts:** Recharts for admin dashboard statistics
- **PDF Generation:** jsPDF for client-side invoice PDF creation
- **Path aliases:** `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend Architecture
- **Runtime:** Node.js with Express
- **Language:** TypeScript, executed via tsx
- **API Pattern:** RESTful JSON API under `/api/` prefix
- **Route Definitions:** Centralized in `shared/routes.ts` using Zod schemas for type-safe API contracts
- **Authentication:** Replit Auth via OpenID Connect (passport + express-session with PostgreSQL session store)
- **AI Integration:** OpenAI API (via Replit AI Integrations) for content generation (website copy, social posts)
- **Dev Server:** Vite dev server middleware integrated into Express for HMR during development
- **Production Build:** Vite builds frontend to `dist/public/`; esbuild bundles server to `dist/index.cjs`

### Data Storage
- **Database:** PostgreSQL via `DATABASE_URL` environment variable
- **ORM:** Drizzle ORM with PostgreSQL dialect
- **Schema Location:** `shared/schema.ts` (main schema) with model files in `shared/models/`
- **Migrations:** Drizzle Kit with `drizzle-kit push` for schema synchronization (migrations output to `./migrations`)
- **Key Tables:**
  - `users` - Authentication users (Replit Auth managed)
  - `sessions` - Express session store (PostgreSQL-backed)
  - `sme_profiles` - Business registration data, subscription status/expiry
  - `vouchers` - Voucher codes with status (active/redeemed)
  - `website_drafts` - AI-generated website content with publish status and slug
  - `social_posts` - Generated social media posts per platform
  - `invoices` - Invoice records with line items (stored as JSONB)
  - `conversations` / `messages` - Chat/AI conversation history

### Authentication & Authorization
- **Method:** Replit Auth (OpenID Connect) — no username/password
- **Session:** express-session with connect-pg-simple storing sessions in PostgreSQL `sessions` table
- **User Flow:** Unauthenticated → Landing page; Authenticated without profile → Registration; Authenticated with profile → Dashboard
- **Admin Detection:** Currently based on email containing "admin" (simplified check in frontend)
- **Auth Routes:** `/api/login`, `/api/logout`, `/api/auth/user`

### Project Structure
```
client/               # Frontend React application
  src/
    components/       # Reusable components (Layout, DashboardStats, ui/)
    hooks/            # Custom hooks (use-auth, use-sme, use-toast, use-mobile)
    pages/            # Page components (Landing, Dashboard, Admin, WebsiteBuilder, etc.)
    lib/              # Utilities (queryClient, utils, auth-utils)
server/               # Backend Express application
  index.ts            # Entry point, Express setup
  routes.ts           # API route registration
  storage.ts          # Database storage layer (IStorage interface + DatabaseStorage)
  db.ts               # Drizzle + pg Pool setup
  vite.ts             # Vite dev server integration
  static.ts           # Production static file serving
  replit_integrations/ # Replit-provided integrations
    auth/             # Replit Auth (OpenID Connect)
    chat/             # AI chat functionality
    image/            # Image generation
    audio/            # Voice/audio processing
    batch/            # Batch processing utilities
shared/               # Shared between frontend and backend
  schema.ts           # Drizzle database schema
  routes.ts           # API route definitions with Zod schemas
  models/             # Model definitions (auth.ts, chat.ts)
```

### Build System
- **Development:** `npm run dev` runs tsx to start the Express server with Vite middleware for HMR
- **Production Build:** `npm run build` runs `script/build.ts` which builds frontend with Vite and bundles server with esbuild
- **Production Start:** `npm start` runs the bundled `dist/index.cjs`
- **Database Push:** `npm run db:push` uses drizzle-kit to push schema changes

## External Dependencies

### Database
- **PostgreSQL** — Required, connected via `DATABASE_URL` environment variable. Used for all data storage and session management.

### AI Services
- **OpenAI API** (via Replit AI Integrations) — Used for website content generation, social media post generation, and chat. Configured via `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL` environment variables.

### Authentication
- **Replit Auth** (OpenID Connect) — Configured via `ISSUER_URL` (defaults to `https://replit.com/oidc`) and `REPL_ID` environment variables. Requires `SESSION_SECRET` for session encryption.

### Required Environment Variables
- `DATABASE_URL` — PostgreSQL connection string
- `SESSION_SECRET` — Secret for signing session cookies
- `REPL_ID` — Replit project identifier (auto-set in Replit)
- `AI_INTEGRATIONS_OPENAI_API_KEY` — OpenAI API key for AI features
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — OpenAI API base URL (Replit proxy)

### Key NPM Packages
- **Frontend:** React, Wouter, TanStack React Query, shadcn/ui (Radix primitives), Tailwind CSS, Framer Motion, Recharts, jsPDF, react-hook-form, Zod
- **Backend:** Express, Drizzle ORM, Passport, openid-client, connect-pg-simple, OpenAI SDK, nanoid
- **Shared:** Zod, drizzle-zod