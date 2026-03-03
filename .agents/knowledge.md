# Focus FTP — AI Knowledge Bank

> This file contains critical user preferences and project context. The AI should read this before acting in new chats.

## User Preferences
*   **Email for Git Commits / Deployments:** `xsahan.oi@gmail.com`
*   **Username / Handle:** `xsaha` (GitHub: `sahanoi`)
*   **Action Style:** One-shot the backend tasks when requested; prefer executing complete phases rather than asking step-by-step unless clarifying requirements.
*   **Design Preference:** "Premium Dusk Purple" aesthetic, glassmorphism, darker tones, avoiding basic template looks. High-quality UI/UX is critical.
*   **Architecture & Project Structure:** Clean, professional full-stack solo dev directory structure. Temp files should be aggressively cleaned.
*   **Dependencies to favor:** Vite, React, Zustand, Supabase, Tailwind CSS, Framer Motion.

## Project Context (Focus FTP)
*   **Goal:** A sharp, hard, fun gamified habit tracker.
*   **Backend:** Supabase (Auth, Postgres DB mapped to `habits`, `habit_completions`, `profiles`, `goals`, `routines`).
*   **Frontend:** React SPA built with Vite.
*   **Deployment:** Vercel (Auto-deployed from GitHub repo).
*   **Key Logic Details:**
    *   `profiles` table uses a `stats` JSONB column.
    *   `habitStore` is the central Zustand state, persisting locally and syncing to Supabase.

*When starting a new chat session, acknowledge reading this Knowledge Bank to ensure alignment.*
