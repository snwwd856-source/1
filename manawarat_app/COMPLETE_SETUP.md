# PromoHive - Global Promo Network - Complete Setup Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Database Setup](#database-setup)
5. [Configuration](#configuration)
6. [Running the Application](#running-the-application)
7. [Demo Credentials](#demo-credentials)
8. [Features](#features)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**PromoHive** is a comprehensive global promotional network platform that enables users to:
- Complete tasks and earn rewards
- Build referral networks and earn commissions
- Manage digital wallets (USDC, USDT)
- Upgrade membership levels
- Access exclusive offers from Kiwiwall
- Participate in a gamified earning ecosystem

### Tech Stack
- **Frontend:** React 19 + Tailwind CSS 4 + TypeScript
- **Backend:** Express 4 + tRPC 11 + Node.js
- **Database:** MySQL/TiDB (Supabase)
- **Authentication:** Username/Email + Password with Admin Approval
- **Payment:** Multi-chain wallet support (TRC20, ERC20, BEP20)

---

## 📦 Prerequisites

Before you begin, ensure you have:
- **Node.js** 18+ installed
- **pnpm** package manager (or npm/yarn)
- **MySQL/TiDB** database (Supabase recommended)
- **Git** for version control
- A text editor (VS Code recommended)

### Install Node.js and pnpm
```bash
# macOS (using Homebrew)
brew install node
npm install -g pnpm

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pnpm

# Windows
# Download from https://nodejs.org/
# Then install pnpm: npm install -g pnpm
```

---

## 🚀 Installation

### 1. Clone or Extract the Project
```bash
# If you have a ZIP file
unzip manawarat_app.zip
cd manawarat_app

# Or clone from git
git clone <your-repo-url>
cd manawarat_app
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Create Environment File
```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your configuration
nano .env.local
```

### 4. Configure Environment Variables
Edit `.env.local` with the following variables:

```env
# Database Connection (Supabase)
DATABASE_URL=mysql://user:password@host:port/database

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this

# Application Configuration
VITE_APP_TITLE=PromoHive
VITE_APP_ID=your-app-id
VITE_APP_LOGO=/logo.svg

# OAuth Configuration (if using)
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# Owner Information
OWNER_NAME=Your Name
OWNER_OPEN_ID=your-open-id

# Built-in APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your-frontend-api-key

# Analytics
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your-website-id
```

---

## 🗄️ Database Setup

### 1. Create Database (Supabase)

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Copy the connection string
4. Add it to your `.env.local` as `DATABASE_URL`

### 2. Push Schema to Database
```bash
# Generate migrations and push to database
pnpm db:push
```

### 3. Seed Default Data
```bash
# Create default levels, wallets, and admin user
node seed.mjs
```

This will create:
- **10 Membership Levels** (Starter to Infinity)
- **2 Default Wallets** (USDT & USDC on TRC20)
- **Admin User** (username: `admin`, password: `admin123`)

---

## ⚙️ Configuration

### Database Schema
The application includes the following tables:
- `users` - User accounts and profiles
- `levels` - Membership levels with commissions
- `tasks` - Task definitions and assignments
- `transactions` - Financial transactions
- `wallets` - Payment wallet configurations
- `referrals` - Referral tracking
- `loans` - Smart loaning system
- `disputes` - Dispute resolution
- `support_tickets` - Support system
- `badges` - Achievement badges
- `audit_logs` - Admin action tracking
- `notifications` - User notifications
- `kiwiwall_offers` - Cached Kiwiwall offers
- `withdrawal_requests` - Withdrawal tracking

### Customization

#### Update Logo
1. Replace `/public/logo.svg` with your logo
2. Update `APP_LOGO` in `client/src/const.ts`
3. Update favicon in Management Dashboard (Settings > General)

#### Update Colors
Edit `client/src/index.css` to customize the color scheme:
```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.6%;
    --primary: 200 100% 50%;
    --primary-foreground: 0 0% 100%;
    /* ... more colors ... */
  }
}
```

#### Update Levels
Edit `seed.mjs` to customize membership levels:
```javascript
const levelData = [
  { id: 0, name: "Starter", upgradePrice: 0, earningShare: 50, minimumWithdrawal: 1000 },
  // ... more levels ...
];
```

---

## 🏃 Running the Application

### Development Mode
```bash
# Start development server (includes hot reload)
pnpm dev

# Server runs on http://localhost:3000
# Open in browser: http://localhost:3000
```

### Build for Production
```bash
# Build frontend and backend
pnpm build

# Start production server
pnpm start
```

### Database Commands
```bash
# Generate migration files
pnpm db:generate

# Apply migrations to database
pnpm db:migrate

# Push schema changes (generate + migrate)
pnpm db:push

# Open database studio (visual editor)
pnpm db:studio
```

---

## 🔐 Demo Credentials

### Admin Account
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** Super Admin (full access)

### Test User (Create via Registration)
1. Go to http://localhost:3000/register
2. Fill in registration form
3. Submit registration (pending admin approval)
4. Login as admin and approve user
5. User can now login

---

## ✨ Features

### User Features
- ✅ User registration with admin approval
- ✅ Username/Email + Password authentication
- ✅ User dashboard with task listings
- ✅ Task completion with proof submission
- ✅ Wallet management (USDC, USDT, etc.)
- ✅ Referral link generation and tracking
- ✅ Level upgrades and progression
- ✅ Transaction history
- ✅ Profile management
- ✅ KYC verification workflow

### Admin Features
- ✅ User management and approval
- ✅ Task creation and management
- ✅ Proof review and approval
- ✅ Transaction management
- ✅ Wallet configuration
- ✅ Level management
- ✅ Referral tracking
- ✅ Dispute resolution
- ✅ Support ticket management
- ✅ Admin action audit logs
- ✅ Platform statistics and reports

### Advanced Features
- ✅ Multi-tier referral commission system
- ✅ Smart loaning (task credits)
- ✅ Two-factor authentication (2FA)
- ✅ Badge and achievement system
- ✅ Leaderboards
- ✅ Dispute resolution with messaging
- ✅ In-app support chat
- ✅ Real-time notifications
- ✅ Kiwiwall offer integration
- ✅ Advanced analytics and reporting

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts and configure environment variables
```

### Deploy to Heroku
```bash
# Install Heroku CLI
brew tap heroku/brew && brew install heroku

# Login
heroku login

# Create app
heroku create manawarat-app

# Set environment variables
heroku config:set DATABASE_URL=your-database-url
heroku config:set JWT_SECRET=your-jwt-secret

# Deploy
git push heroku main
```

### Deploy to Docker
```bash
# Build Docker image
docker build -t manawarat:latest .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL=your-database-url \
  -e JWT_SECRET=your-jwt-secret \
  manawarat:latest
```

### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_URL=mysql://user:pass@host/db
JWT_SECRET=your-production-secret
VITE_APP_TITLE=PromoHive
# ... other variables
```

---

## 🔧 Troubleshooting

### Issue: "Cannot find module 'bcrypt'"
**Solution:**
```bash
pnpm add bcrypt
pnpm add -D @types/bcrypt
```

### Issue: Database connection fails
**Solution:**
1. Check `DATABASE_URL` in `.env.local`
2. Verify database credentials
3. Ensure database is accessible from your network
4. Test connection: `pnpm db:studio`

### Issue: Port 3000 already in use
**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 pnpm dev
```

### Issue: TypeScript errors
**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
pnpm install

# Rebuild
pnpm build
```

### Issue: Vite HMR errors
**Solution:**
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Restart dev server
pnpm dev
```

---

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the database schema in `drizzle/schema.ts`
3. Check server logs in `server/routers.ts`
4. Review API endpoints in `server/_core/oauth.ts`

---

## 📄 License

This project is provided as-is for the PromoHive Global Promo Network platform.

---

## 🎉 Next Steps

1. **Customize Branding**
   - Update logo in `/public`
   - Update colors in `client/src/index.css`
   - Update company name in environment variables

2. **Configure Payments**
   - Add your wallet addresses in database
   - Configure Kiwiwall API integration
   - Set up payment processing

3. **Deploy**
   - Choose hosting platform (Vercel, Heroku, Docker)
   - Configure production environment variables
   - Set up monitoring and logging

4. **Scale**
   - Monitor database performance
   - Implement caching layer (Redis)
   - Add CDN for static assets
   - Set up automated backups

---

**Happy earning! 🚀**
