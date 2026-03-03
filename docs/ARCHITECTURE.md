# Focus FTP — Architecture & Stack

## Tech Stack
| Layer | Technology |
|---|---|
| **Frontend** | React 18 + TypeScript |
| **Styling** | Tailwind CSS 3 |
| **State** | Zustand (persisted to localStorage + Supabase) |
| **Backend** | Supabase (Auth, PostgreSQL, RLS) |
| **Hosting** | Vercel |
| **Build** | Vite 5 |
| **Testing** | Vitest + Testing Library |
| **Animation** | Framer Motion |

## Directory Structure
```
Project F/
├── .env                  # Local secrets (gitignored)
├── .env.example          # Safe-to-commit template
├── docs/                 # Project documentation
│   ├── ARCHITECTURE.md   # This file
│   ├── CHANGELOG.md      # Version history
│   └── DEPLOYMENT.md     # Deployment guide
├── public/               # Static assets (if any)
├── src/
│   ├── App.tsx            # Root component + auth gate
│   ├── main.tsx           # Entry point
│   ├── index.css          # Global styles + Tailwind
│   ├── components/        # UI components
│   │   ├── auth/          # Auth screens
│   │   ├── dashboard/     # Main dashboard & gamification
│   │   ├── goals/         # S.M.A.R.T. goal wizard
│   │   ├── habits/        # Habit CRUD & detail views
│   │   ├── layout/        # Header, AppLayout, Nav
│   │   ├── onboarding/    # 7-day new user journey
│   │   ├── settings/      # Settings page
│   │   └── stats/         # Analytics & charts
│   ├── contexts/          # React contexts (AuthContext)
│   ├── data/              # Static data (missions, dummyData)
│   ├── lib/               # External service clients (Supabase)
│   ├── store/             # Zustand stores
│   ├── test/              # Test setup & mocks
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Pure utility functions
├── supabase/
│   └── migrations/        # SQL migration files (ordered)
├── vercel.json            # Vercel SPA routing config
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## Data Flow
```
User Action → Zustand Store (optimistic) → Supabase (async persist)
                    ↓                              ↓
              localStorage (offline cache)    PostgreSQL (source of truth)
```

## Authentication Flow
```
App.tsx → AuthProvider → session check
  ├── No session → Auth.tsx (sign in / sign up)
  └── Session exists → fetchAllData() → Dashboard
```
