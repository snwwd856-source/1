# PromoHive - Global Promo Network

A modern, secure platform for task management, referrals, and earning opportunities.

![PromoHive Logo](./client/public/promohive-logo.png)

## 🚀 Features

### Admin Dashboard
- **User Management**: Approve/reject users, upgrade levels, manage balances
- **Task Management**: Create, edit, delete tasks (trading tasks hidden from users)
- **Wallet Management**: Add/edit/delete USDC/USDT TRC20 wallet addresses
- **Level Management**: Configure pricing and earning shares for 10 levels
- **Proof Review**: Approve/reject task completion proofs
- **Financial Management**: Handle deposits and withdrawals
- **Audit Logs**: Complete tracking of all admin actions
- **Role-Based Access**: Super Admin, Finance Admin, Support Admin, Content Admin

### User Features
- **Task System**: Accept and complete various task types
- **Referral Network**: Unique referral codes with automatic rewards
- **Level System**: 10 levels with increasing earning potential
- **Balance Tracking**: Real-time balance and transaction history
- **Proof Submission**: Upload proof for task completion
- **Visual Referral Tree**: See your referral network

### Security
- ✅ Rate limiting (100 requests/minute)
- ✅ Input sanitization (XSS prevention)
- ✅ SQL injection prevention
- ✅ Role-based access control
- ✅ Security headers
- ✅ Audit logging
- ✅ Password hashing (bcrypt)

## 📋 Prerequisites

- Node.js 18+ and pnpm
- MySQL database
- Supabase account (optional, for advanced features)

## 🛠️ Installation

### 1. Clone and Install

```bash
cd manawarat_app
pnpm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/promohive

# Security
JWT_SECRET=your-strong-secret-key-change-in-production

# Supabase (already configured)
SUPABASE_URL=https://bxkhyxhnidisdwjlfzyl.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4a2h5eGhuaWRpc2R3amxmenlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNjQ4MTYsImV4cCI6MjA3ODc0MDgxNn0.VUJVK4245tTHAcvne191J_2_uAIUhG5bMKDIAzSX3Zg
SUPABASE_SERVICE_KEY=sbp_v0_1c6c026724a84a9fc034a3dbf717557b4ebf0ae9

# App
NODE_ENV=development
VITE_APP_TITLE=PromoHive - Global Promo Network
```

### 3. Database Setup

```bash
# Run migrations
pnpm drizzle-kit push

# Seed database with default data
node seed.mjs
```

### 4. Start Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

## 🔐 Default Credentials

### Admin Account
- **Username:** `admin`
- **Password:** `admin123`
- **Email:** `admin@promohive.com`
- **Role:** `super_admin`

### Demo Users
- **Username:** `demo_user1` / `demo_user2`
- **Password:** `demo123`

**⚠️ IMPORTANT:** Change these passwords immediately in production!

## 📊 Level System

The platform includes 10 membership levels:

| Level | Upgrade Price | Earning Share | Min Withdrawal |
|-------|--------------|---------------|----------------|
| 0     | $0           | 15%           | $10            |
| 1     | $50          | 30%           | $50            |
| 2     | $100         | 45%           | $100           |
| 3     | $150         | 50%           | $150           |
| ...   | ...          | +5% per level | ...            |
| 9     | $450         | 80%           | $450           |

## 🔗 Referral System

Each user gets a unique referral code:
- Format: `REF-{USERNAME}-{RANDOM}`
- Example: `REF-USER123-X5B8`
- Automatic reward calculation based on referrer's level
- Multi-tier referral support

## 🎯 Task Types

- **Trading**: Hidden from regular users (admin only)
- **Marketing**: Social media tasks
- **Referral**: Invite new users
- **Learning**: Educational tasks
- **Manual**: Custom tasks (unlimited)
- **Survey**: Survey completion

## 👥 Admin Roles

- **super_admin**: Full access to all features
- **finance_admin**: Manage transactions, withdrawals, deposits only
- **support_admin**: Manage tasks, proofs, user support
- **content_admin**: Create, edit, delete tasks only

## 📁 Project Structure

```
manawarat_app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   └── lib/           # Utilities
│   └── public/            # Static assets (logo, etc.)
├── server/                # Backend server
│   ├── _core/            # Core functionality
│   │   ├── security.ts   # Security middleware
│   │   └── trpc.ts       # tRPC setup
│   └── routers.ts        # API routes
├── drizzle/              # Database schema
└── seed.mjs              # Database seeding
```

## 🔒 Security Features

- Rate limiting per user/IP
- Input sanitization
- SQL injection prevention
- XSS protection headers
- Role-based access control
- Complete audit logging
- Secure session management

See `SECURITY.md` for detailed security information.

## 📚 Documentation

- `README_SETUP.md` - Detailed setup instructions
- `FEATURES_COMPLETE.md` - Complete feature list
- `SECURITY.md` - Security best practices
- `DEPLOYMENT_READY.md` - Production deployment guide

## 🚀 Production Deployment

1. Set strong `JWT_SECRET` in environment
2. Change default admin password
3. Enable HTTPS/SSL
4. Configure database SSL
5. Set up monitoring
6. Enable backups

See `DEPLOYMENT_READY.md` for complete deployment checklist.

## 🐛 Troubleshooting

### Database Connection
- Verify `DATABASE_URL` is correct
- Check database is running
- Ensure credentials are valid

### Authentication Issues
- Check `JWT_SECRET` is set
- Clear browser cookies
- Verify session expiration

## 📝 License

All rights reserved - PromoHive © 2024

## 🎉 Ready to Use!

The application is fully functional and ready for deployment. All features are implemented, tested, and secured.

For support or questions, refer to the documentation files in the project root.

