# PromoHive Installation & Deployment Guide

## 📦 Package Contents

The `manawarat_app_complete.zip` contains:

```
manawarat_app/
├── client/                 # React frontend
├── server/                 # Express backend & tRPC
├── drizzle/               # Database schema & migrations
├── storage/               # S3 storage helpers
├── shared/                # Shared types & constants
├── package.json           # Dependencies
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
├── SETUP_GUIDE.md         # Quick start guide
├── README_DEPLOYMENT.md   # Detailed documentation
├── .env.example           # Environment variables template
└── todo.md               # Project features checklist
```

## 🚀 Quick Installation (5 minutes)

### 1. Extract & Navigate
```bash
unzip manawarat_app_complete.zip
cd manawarat_app
```

### 2. Install Dependencies
```bash
npm install -g pnpm  # If not already installed
pnpm install
```

### 3. Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
nano .env.local
```

### 4. Setup Database
```bash
pnpm db:push
```

### 5. Start Development
```bash
pnpm dev
```

Visit: http://localhost:3000

---

## 📋 Prerequisites

### Required Software
- **Node.js** 18+ (https://nodejs.org/)
- **pnpm** (npm install -g pnpm)
- **Git** (for version control)

### Required Accounts
1. **Supabase** (https://supabase.com)
   - Create project
   - Get connection string

2. **Manus** (https://manus.im)
   - Create OAuth app
   - Get App ID and credentials

### System Requirements
- **RAM**: 2GB minimum (4GB recommended)
- **Storage**: 500MB for installation
- **Network**: Stable internet connection

---

## 🔧 Detailed Setup

### Step 1: Database Setup

#### Using Supabase (Recommended)

1. Create account at https://supabase.com
2. Create new project
3. Go to Settings → Database
4. Copy connection string
5. Add to `.env.local`:
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/postgres
   ```

#### Using Local MySQL

```bash
# Install MySQL
brew install mysql  # macOS
# or
sudo apt-get install mysql-server  # Linux

# Create database
mysql -u root -p
CREATE DATABASE manawarat;
EXIT;

# Add to .env.local
DATABASE_URL=mysql://root:password@localhost:3306/manawarat
```

### Step 2: OAuth Configuration

1. Go to https://manus.im
2. Create account and login
3. Create new OAuth application
4. Set redirect URI: `http://localhost:3000/api/oauth/callback`
5. Copy credentials to `.env.local`:
   ```env
   VITE_APP_ID=your_app_id
   OAUTH_SERVER_URL=https://api.manus.im
   VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
   ```

### Step 3: Environment Variables

Create `.env.local`:

```env
# Database
DATABASE_URL=mysql://user:password@host:3306/manawarat

# OAuth
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# Security
JWT_SECRET=generate_random_32_char_string
OWNER_OPEN_ID=your_user_id
OWNER_NAME=Your Name

# API Keys
BUILT_IN_FORGE_API_KEY=your_api_key
BUILT_IN_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your_frontend_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im

# Application
VITE_APP_TITLE=PromoHive - Global Promo Network
VITE_APP_LOGO=/promohive-logo.svg
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your_website_id
```

### Step 4: Database Migration

```bash
# Generate migrations
pnpm db:generate

# Push to database
pnpm db:push

# Verify (opens Drizzle Studio)
pnpm db:studio
```

### Step 5: Start Development

```bash
pnpm dev
```

Expected output:
```
[vite] ✨ new dependencies optimized
Server running on http://localhost:3000/
```

---

## 👤 Admin Setup

### Make Yourself Admin

1. Login at http://localhost:3000
2. Update database:

```bash
# Option 1: Using Drizzle Studio
pnpm db:studio
# Find your user and change role to 'admin'

# Option 2: Using SQL
mysql -u root -p manawarat
UPDATE users SET role = 'admin' WHERE openId = 'your_open_id';
```

### First Admin Tasks

1. ✅ Create admin account
2. ✅ Add payment wallets
3. ✅ Configure user levels
4. ✅ Create first tasks
5. ✅ Set up notifications

---

## 🏗️ Project Structure

### Frontend (`client/src/`)
```
pages/
├── Home.tsx              # Landing page
├── AdminDashboard.tsx    # Admin overview
├── ManageTasks.tsx       # Task management
├── ManageUsers.tsx       # User management
├── ManageWallets.tsx     # Wallet configuration
├── ManageLevels.tsx      # Level settings
├── TaskDetail.tsx        # Task details & proof
└── UserWallet.tsx        # User wallet & transactions

components/
├── DashboardLayout.tsx   # Admin layout
├── AIChatBox.tsx         # Chat interface
├── Map.tsx               # Maps integration
└── ui/                   # shadcn/ui components
```

### Backend (`server/`)
```
routers.ts               # tRPC procedures
db.ts                    # Database queries
_core/
├── index.ts            # Server entry point
├── context.ts          # Request context
├── trpc.ts             # tRPC setup
├── oauth.ts            # OAuth handling
└── llm.ts              # LLM integration
```

### Database (`drizzle/`)
```
schema.ts               # Table definitions
migrations/             # Auto-generated migrations
```

---

## 🚀 Production Deployment

### Option 1: Manus Platform (Easiest)

1. Create checkpoint in dev environment
2. Click "Publish" button in UI
3. Configure domain
4. Enable SSL

### Option 2: Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]
```

Build and deploy:
```bash
docker build -t manawarat .
docker run -p 3000:3000 -e DATABASE_URL=... manawarat
```

### Option 3: Traditional VPS

```bash
# SSH into server
ssh user@your-server.com

# Clone repository
git clone your-repo.git
cd manawarat_app

# Install dependencies
pnpm install

# Build
pnpm build

# Start with PM2
npm install -g pm2
pm2 start "pnpm start" --name manawarat

# Setup Nginx reverse proxy
# Configure SSL with Let's Encrypt
```

### Environment for Production

```env
NODE_ENV=production
DATABASE_URL=mysql://prod_user:prod_password@prod_host:3306/manawarat
JWT_SECRET=your_production_secret_key_32_chars_min
# ... other variables
```

---

## 🔍 Verification Checklist

- [ ] Node.js installed: `node --version`
- [ ] pnpm installed: `pnpm --version`
- [ ] Database connected: `pnpm db:studio`
- [ ] Environment variables set: `cat .env.local`
- [ ] Dependencies installed: `pnpm install`
- [ ] Build successful: `pnpm build`
- [ ] Dev server running: `pnpm dev`
- [ ] Can login: http://localhost:3000
- [ ] Admin account created
- [ ] Database tables visible

---

## 🐛 Troubleshooting

### Port 3000 Already in Use
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 pnpm dev
```

### Database Connection Error
```bash
# Verify connection string
echo $DATABASE_URL

# Test connection
mysql -u user -p -h host -D database

# Check .env.local
cat .env.local | grep DATABASE_URL
```

### OAuth Login Fails
- Verify App ID is correct
- Check redirect URI matches
- Clear browser cookies
- Try incognito window

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules dist
pnpm install
pnpm build
```

### TypeScript Errors
```bash
# Check for errors
pnpm tsc --noEmit

# Fix issues
pnpm tsc --noEmit --listFiles
```

---

## 📚 Additional Resources

- **Setup Guide**: See `SETUP_GUIDE.md`
- **Deployment Docs**: See `README_DEPLOYMENT.md`
- **API Reference**: Check `server/routers.ts`
- **Database Schema**: See `drizzle/schema.ts`
- **Component Library**: https://ui.shadcn.com

---

## 💡 Development Tips

### Hot Reload
Changes auto-reload in browser (HMR enabled)

### Database Changes
```bash
# Edit drizzle/schema.ts
# Then run:
pnpm db:push
```

### New Pages
1. Create file in `client/src/pages/`
2. Add route in `client/src/App.tsx`
3. Import and add to Switch

### New API Endpoints
1. Add procedure in `server/routers.ts`
2. Use in components: `trpc.yourProcedure.useQuery()`

---

## 🎯 Next Steps

1. ✅ Complete installation
2. 📝 Create admin account
3. 🎯 Create first task
4. 💰 Add payment wallets
5. 📊 Configure levels
6. 🚀 Deploy to production

---

## 📞 Support

For issues or questions:
1. Check `SETUP_GUIDE.md` troubleshooting section
2. Review `README_DEPLOYMENT.md` for detailed docs
3. Check server logs: `pnpm dev` output
4. Verify environment variables

---

**Happy coding! 🚀**
