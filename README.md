# Sprinkles — AI-Powered Personal Communication Coach

Sprinkles is a production-ready, AI-powered Personal Communication Coach designed to help students master spoken English, build presentation confidence, expand academic and corporate vocabulary, correct pronunciation mistakes, and prepare for career-defining interviews. 

It functions as an active AI mentor that monitors student progress and updates personalized learning plans dynamically.

---

## 🏗️ Architecture & Core Design

This project adopts **Clean Architecture** principles to separate business logic from framework details, database adapters, and external APIs. This ensures high testability, scalability, and code maintainability as features are added.

### Folder Structure

```
src/
├── app/                       # Next.js 16 App Router (Views, API Routes, Layouts)
│   ├── api/                   # HTTP API route endpoints (Auth Callback)
│   ├── auth/                  # Pages for credential entry (Sign In, Sign Up, Error)
│   ├── layout.tsx             # Root template loading fonts, navbar, and footer
│   └── page.tsx               # Animated marketing landing page
├── components/                # UI Presentation Layer
│   ├── shared/                # App-wide shared elements (Navbar, Footer)
│   └── ui/                    # Base design primitives (e.g. shadcn components)
├── core/                      # Domain & Business Rules (Pure TypeScript, Zero external deps)
│   ├── entities/              # Models representing application core structures
│   │   ├── plan.ts            # LearningPlan schemas
│   │   ├── progress.ts        # StudentProgress scores & goals
│   │   ├── speech.ts          # SpeechAttempt metrics
│   │   └── user.ts            # User profile data
│   ├── repositories/          # Interface specifications for data access operations
│   └── services/              # Interface specifications for third-party systems (AI, Auth)
├── infrastructure/            # Adapter & Implementation Layer
│   ├── database/              # Prisma concrete repository instances
│   │   ├── prisma.ts          # Singleton Prisma Client constructor
│   │   └── prisma-*-repository.ts # Implementations of core repositories
│   └── services/              # External service adapters (OpenRouter integrations)
├── lib/                       # Framework integrations and utilities
│   ├── supabase/              # Supabase SSR cookie wrappers (client, server, middleware)
│   └── utils.ts               # Tailored clsx & twMerge class utility
├── proxy.ts                   # Next.js 16 Request Filter (Formerly Middleware)
└── styles/                    # Styling definitions (globals.css Tailwind configuration)
```

---

## ⚙️ Technology Stack

*   **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Database ORM**: [Prisma ORM (v6)](https://www.prisma.io/)
*   **Database Engine**: [PostgreSQL (Supabase)](https://supabase.com/)
*   **Auth Management**: [Supabase Authentication (Google OAuth + Email)](https://supabase.com/docs/guides/auth)
*   **AI Integration**: [OpenRouter API](https://openrouter.ai/) (Pre-wired for Gemini completions)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Setup & Onboarding Guide

Follow these steps to establish a fully compiled local environment:

### 1. Clone the Project & Install Dependencies
First, execute a dependency install:
```bash
npm install
```

### 2. Configure Environment Variables
Copy the environment variables template and configure the values:
```bash
cp .env.example .env
```
Fill in the respective credentials:
*   `DATABASE_URL` / `DIRECT_URL`: Supabase Transaction Pooler and Direct migration strings.
*   `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public client integration keys.
*   `OPENROUTER_API_KEY`: API authorization key for LLM prompting.

### 3. Generate the Prisma Client
Generate the TypeScript bindings for the client:
```bash
npx prisma generate
```

### 4. Push Schema to Database (Optional)
If your database schema needs to sync up with Supabase:
```bash
npx prisma db push
```

### 5. Launch the Local Dev Server
Fire up the local hot-reloader:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) inside your web browser.

---

## 💅 Formatting & Style Enforcement

Strict formatting guidelines are enforced via ESLint flat configs and Prettier rules to keep codebases uniform:

```bash
# Analyze files for syntax warnings and formatting errors
npm run lint

# Auto-correct formatting and stylistic inconsistencies
npx eslint --fix
```

Rules include:
*   Semicolons required, double-quotes preferred.
*   Automated Tailwind class sorting via `prettier-plugin-tailwindcss`.
*   Unused imports are prevented by default.
