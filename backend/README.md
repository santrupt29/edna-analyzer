# Backend (Express + Supabase)

## Setup
1. Copy `.env.example` to `.env` and fill values.
2. Install deps (already installed): `npm i`
3. Start dev server: `npm run dev`
4. Health check: `GET /health`

## Auth Routes
- POST `/auth/signup` { email, password }
- POST `/auth/login` { email, password }
- POST `/auth/logout` { access_token }
