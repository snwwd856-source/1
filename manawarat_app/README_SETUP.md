# PromoHive Setup Guide

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL=mysql://user:password@localhost:3306/promohive

# JWT Secret for session management
JWT_SECRET=your-secret-key-here-change-in-production

# App Configuration
VITE_APP_ID=your-app-id
NODE_ENV=development

# OAuth Configuration (if needed)
OAUTH_SERVER_URL=
OWNER_OPEN_ID=

# Forge API (if needed)
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=

# Supabase Configuration
SUPABASE_URL=https://bxkhyxhnidisdwjlfzyl.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4a2h5eGhuaWRpc2R3amxmenlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNjQ4MTYsImV4cCI6MjA3ODc0MDgxNn0.VUJVK4245tTHAcvne191J_2_uAIUhG5bMKDIAzSX3Zg
SUPABASE_SERVICE_KEY=sbp_v0_1c6c026724a84a9fc034a3dbf717557b4ebf0ae9
```

## Default Admin Credentials

After running the seed script, you can login with:

- **Username:** `admin`
- **Password:** `admin123`
- **Email:** `admin@promohive.com`
- **Role:** `super_admin`

## Demo User Credentials

- **Username:** `demo_user1` or `demo_user2`
- **Password:** `demo123`
- **Email:** `user1@demo.com` or `user2@demo.com`

## Setup Steps

1. Install dependencies:
```bash
pnpm install
```

2. Set up your database and configure `DATABASE_URL` in `.env`

3. Run database migrations:
```bash
pnpm drizzle-kit push
```

4. Seed the database with default data:
```bash
node seed.mjs
```

5. Start the development server:
```bash
pnpm dev
```

## Level System

The system includes 10 levels (0-9):

- **Level 0:** Free, 15% earning share, $10 minimum withdrawal
- **Level 1:** $50 upgrade, 30% earning share, $50 minimum withdrawal
- **Level 2:** $100 upgrade, 45% earning share, $100 minimum withdrawal
- And so on, increasing by 5% earning share per level

## Referral System

Each user gets a unique referral code in the format: `REF-{USERNAME}-{RANDOM}`

Example: `REF-USER123-X5B8`

Referral rewards are calculated automatically based on the referrer's level.

## Admin Roles

- **super_admin:** Full access to all features
- **finance_admin:** Can manage transactions, withdrawals, deposits
- **support_admin:** Can manage tasks, proofs, user support
- **content_admin:** Can create, edit, and delete tasks

## Features

✅ User registration with admin approval
✅ Task management (trading, marketing, referral, learning, manual)
✅ Proof submission and review
✅ Wallet management (USDC/USDT TRC20)
✅ Deposit and withdrawal management
✅ Level system with configurable pricing
✅ Referral system with automatic rewards
✅ Kiwiwall integration support
✅ Audit logging for all admin actions
✅ Real-time dashboard statistics

