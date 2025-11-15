# PromoHive Setup Guide

## Quick Start (5 Minutes)

### Step 1: Extract Files
```bash
unzip manawarat_app.zip
cd manawarat_app
```

### Step 2: Install Dependencies
```bash
pnpm install
```

### Step 3: Configure Environment
Copy `.env.example` to `.env.local` and fill in your credentials:
```bash
cp .env.example .env.local
```

### Step 4: Setup Database
```bash
pnpm db:push
```

### Step 5: Start Development
```bash
pnpm dev
```

Visit `http://localhost:3000` in your browser.

---

## Detailed Setup Instructions

### Prerequisites

- **Node.js**: Version 18 or higher
  - Download: https://nodejs.org/
  - Verify: `node --version`

- **pnpm**: Package manager
  ```bash
  npm install -g pnpm
  pnpm --version
  ```

- **Supabase Account**: For database hosting
  - Sign up: https://supabase.com
  - Create a new project
  - Get connection string from project settings

- **Manus Account**: For OAuth authentication
  - Sign up: https://manus.im
  - Create OAuth application
  - Get App ID and secrets

### Step 1: Project Setup

```bash
# Extract the ZIP file
unzip manawarat_app.zip
cd manawarat_app

# Install all dependencies
pnpm install

# This will install:
# - React 19 and dependencies
# - Express and tRPC
# - Tailwind CSS and UI components
# - Database drivers
# - Development tools
```

### Step 2: Database Configuration

#### Option A: Using Supabase (Recommended)

1. Go to https://supabase.com and create an account
2. Create a new project
3. Go to Project Settings → Database
4. Copy the connection string
5. Add to `.env.local`:
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/postgres
   ```

#### Option B: Using Local MySQL

1. Install MySQL: https://dev.mysql.com/downloads/mysql/
2. Create a database:
   ```sql
   CREATE DATABASE manawarat;
   ```
3. Add to `.env.local`:
   ```env
   DATABASE_URL=mysql://root:password@localhost:3306/manawarat
   ```

### Step 3: OAuth Configuration

1. Go to https://manus.im and create an account
2. Create a new OAuth application
3. Set redirect URI to: `http://localhost:3000/api/oauth/callback`
4. Copy credentials to `.env.local`:
   ```env
   VITE_APP_ID=your_app_id
   OAUTH_SERVER_URL=https://api.manus.im
   VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
   ```

### Step 4: Environment Variables

Create `.env.local` in the project root:

```env
# Database Connection
DATABASE_URL=mysql://user:password@host:3306/manawarat

# OAuth Configuration
VITE_APP_ID=your_manus_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# Security
JWT_SECRET=generate_a_random_string_here
OWNER_OPEN_ID=your_user_id
OWNER_NAME=Your Name

# API Keys (from Manus)
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

### Step 5: Database Migration

```bash
# Generate migration files
pnpm db:generate

# Push schema to database
pnpm db:push

# Verify tables were created
pnpm db:studio  # Opens Drizzle Studio for inspection
```

### Step 6: Start Development Server

```bash
pnpm dev
```

You should see:
```
[vite] ✨ new dependencies optimized and pre-bundled
Server running on http://localhost:3000/
```

Open http://localhost:3000 in your browser.

---

## Admin Account Setup

### First Time Login

1. Open http://localhost:3000
2. Click "Login" button
3. Sign in with your Manus account
4. You'll be created as a regular user

### Promote to Admin

To make yourself an admin, update the database:

```bash
# Using Drizzle Studio
pnpm db:studio

# Or using SQL directly
mysql -u root -p manawarat
UPDATE users SET role = 'admin' WHERE openId = 'your_open_id';
```

---

## Common Tasks

### Create Your First Task

1. Login as admin
2. Go to Admin Dashboard
3. Click "Manage Tasks"
4. Click "Create Task"
5. Fill in details:
   - Title: "Complete Survey"
   - Type: "survey"
   - Reward: $5.00
   - Slots: 100
6. Click "Create Task"

### Add a Payment Wallet

1. Go to Admin Dashboard
2. Click "Manage Wallets"
3. Click "Add Wallet"
4. Select chain: TRC20
5. Enter wallet address
6. Click "Add Wallet"

### Configure User Levels

1. Go to Admin Dashboard
2. Click "Manage Levels"
3. Click "Edit" on a level
4. Update settings:
   - Upgrade Price
   - Earning Share
   - Minimum Withdrawal
5. Click "Save Changes"

---

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 pnpm dev
```

### Database Connection Error

```bash
# Verify DATABASE_URL
echo $DATABASE_URL

# Test connection
mysql -u user -p -h host -D database

# Check .env.local exists
ls -la .env.local
```

### OAuth Login Not Working

1. Verify `VITE_APP_ID` is correct
2. Check redirect URI matches: `http://localhost:3000/api/oauth/callback`
3. Clear browser cookies
4. Try incognito/private window

### Build Errors

```bash
# Clear cache
rm -rf node_modules .next dist

# Reinstall
pnpm install

# Rebuild
pnpm build
```

### TypeScript Errors

```bash
# Check TypeScript
pnpm tsc --noEmit

# Fix issues
pnpm tsc --noEmit --listFiles
```

---

## Development Workflow

### Making Changes

1. Edit files in `client/src/` or `server/`
2. Changes auto-reload (HMR)
3. Check browser console for errors
4. Use browser DevTools for debugging

### Adding New Pages

1. Create file in `client/src/pages/YourPage.tsx`
2. Add route in `client/src/App.tsx`
3. Import and add to Switch component

### Adding New API Endpoints

1. Add procedure in `server/routers.ts`
2. Use `trpc.yourProcedure.useQuery()` in components
3. Server automatically type-checks

### Database Changes

1. Edit schema in `drizzle/schema.ts`
2. Run `pnpm db:push`
3. Drizzle auto-generates migrations

---

## Production Deployment

### Using Manus Platform

1. Create checkpoint in dev environment
2. Click "Publish" button
3. Configure domain
4. Enable SSL

### Using Docker

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

Build and run:
```bash
docker build -t manawarat .
docker run -p 3000:3000 -e DATABASE_URL=... manawarat
```

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_URL=mysql://prod_user:prod_password@prod_host:3306/manawarat
JWT_SECRET=your_production_secret_key
# ... other variables
```

---

## Performance Tips

1. **Database Indexing**: Add indexes on frequently queried columns
2. **Caching**: Implement Redis for session and data caching
3. **CDN**: Use CDN for static assets
4. **Compression**: Enable gzip compression
5. **Monitoring**: Set up error tracking and analytics

---

## Support Resources

- **Documentation**: See README_DEPLOYMENT.md
- **API Reference**: Check server/routers.ts
- **Component Library**: shadcn/ui documentation
- **Database**: Drizzle ORM docs

---

## Next Steps

1. ✅ Setup complete
2. 📝 Create admin account
3. 🎯 Create first task
4. 💰 Add payment wallets
5. 🚀 Deploy to production

Happy coding! 🚀
