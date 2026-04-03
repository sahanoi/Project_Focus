# Focus FTP — Architecture & Stack

## Tech Stack
| Layer | Technology |
|---|---|
| **Frontend** | React 18 + TypeScript |
| **Styling** | Tailwind CSS 3 |
| **State** | Zustand (persisted to localStorage) |
| **Backend** | None (local-first; browser persistence only) |
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
│   ├── ARCHITECTURE.md        # This file
│   ├── PRODUCT.md             # Merged product: vision, entry flow, MVP screens, RPG/code map, dashboard UX goals
│   ├── CHANGELOG.md           # Version history
│   ├── DEPLOYMENT.md          # Deployment guide
│   └── archive/               # Historical notes (e.g. legacy agent notes, old SaaS memo)
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
│   │   ├── layout/        # AppLayout, Sidebar
│   │   ├── onboarding/    # 7-day new user journey
│   │   ├── settings/      # Settings page
│   │   └── stats/         # Analytics & charts
│   ├── contexts/          # React contexts (AuthContext)
│   ├── data/              # Static data (missions, dummyData)
│   ├── lib/               # Local auth helpers (`localAuth`, `authTypes`)
│   ├── store/             # Zustand stores
│   ├── test/              # Test setup & mocks
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Pure utility functions
├── vercel.json            # Vercel SPA routing config
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## Data Flow
```
User Action → Zustand Store (optimistic update)
                    ↓
              localStorage (source of truth via persist middleware)
```

## Authentication Flow
```
App.tsx → AuthProvider → session check
  ├── No session → Auth.tsx (sign in / sign up)
  └── Session exists → fetchAllData() → Dashboard
```
