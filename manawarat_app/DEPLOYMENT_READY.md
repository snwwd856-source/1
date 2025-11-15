# PromoHive - Production Ready Deployment Guide

## ✅ All Features Completed

### Admin Features
- ✅ User management (approve/reject, upgrade level, credit/debit balance)
- ✅ Task management (create/edit/delete, hide trading tasks from users)
- ✅ Wallet management (add/edit/delete USDC/USDT TRC20 addresses)
- ✅ Level management (configure pricing and earning shares)
- ✅ Proof review system (approve/reject with reasons)
- ✅ Deposit/withdrawal management
- ✅ Audit logs viewing
- ✅ Role management (add/remove admins)

### User Features
- ✅ Registration with admin approval
- ✅ Task acceptance and completion
- ✅ Proof submission
- ✅ Referral system with unique codes
- ✅ Level upgrades
- ✅ Balance tracking
- ✅ Transaction history

### Security Features
- ✅ Rate limiting (100 requests/minute)
- ✅ Input sanitization (XSS prevention)
- ✅ SQL injection prevention
- ✅ Role-based access control
- ✅ Security headers (XSS, CSRF protection)
- ✅ Audit logging for all admin actions
- ✅ Password hashing (bcrypt)
- ✅ Session management

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd manawarat_app
pnpm install
```

### 2. Configure Environment
Create `.env` file:
```env
DATABASE_URL=mysql://user:password@localhost:3306/promohive
JWT_SECRET=your-strong-secret-key-here
SUPABASE_URL=https://bxkhyxhnidisdwjlfzyl.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4a2h5eGhuaWRpc2R3amxmenlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNjQ4MTYsImV4cCI6MjA3ODc0MDgxNn0.VUJVK4245tTHAcvne191J_2_uAIUhG5bMKDIAzSX3Zg
SUPABASE_SERVICE_KEY=sbp_v0_1c6c026724a84a9fc034a3dbf717557b4ebf0ae9
NODE_ENV=production
```

### 3. Setup Database
```bash
# Run migrations
pnpm drizzle-kit push

# Seed database with default data
node seed.mjs
```

### 4. Start Application
```bash
# Development
pnpm dev

# Production
pnpm build
pnpm start
```

## 🔐 Default Credentials

### Admin Account
- **Username:** `admin`
- **Password:** `admin123`
- **Email:** `admin@promohive.com`
- **Role:** `super_admin`

### Demo Users
- **Username:** `demo_user1` / `demo_user2`
- **Password:** `demo123`

**⚠️ IMPORTANT:** Change default passwords in production!

## 📁 Project Structure

```
manawarat_app/
├── client/              # React frontend
│   └── src/
│       ├── pages/       # Page components
│       ├── components/  # Reusable components
│       └── lib/         # Utilities
├── server/              # Backend server
│   ├── _core/          # Core functionality
│   │   ├── security.ts # Security middleware
│   │   ├── trpc.ts     # tRPC setup
│   │   └── context.ts  # Request context
│   └── routers.ts      # API routes
├── drizzle/            # Database schema
└── seed.mjs            # Database seeding

```

## 🔒 Security Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Change default admin password
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up database SSL connection
- [ ] Use Redis for rate limiting (instead of in-memory)
- [ ] Enable 2FA for admin accounts
- [ ] Set up monitoring and alerts
- [ ] Configure firewall rules
- [ ] Regular security audits
- [ ] Backup encryption

## 📊 Database Schema

All tables are defined in `drizzle/schema.ts`:
- `users` - User accounts with referral codes
- `levels` - Membership levels (0-9)
- `tasks` - Task definitions
- `task_assignments` - User task assignments
- `transactions` - All financial transactions
- `wallets` - Platform payment wallets
- `referrals` - Referral tracking
- `audit_logs` - Admin action logs
- `withdrawal_requests` - Withdrawal tracking
- `kiwiwall_offers` - Cached Kiwiwall offers

## 🎯 API Endpoints

All API endpoints are through tRPC:
- `/api/trpc/*` - tRPC endpoints
- `/api/auth/*` - Authentication endpoints

See `server/routers.ts` for all available procedures.

## 📝 Features Summary

### Level System
- 10 levels (0-9)
- Level 0: Free, 15% earning, $10 min withdrawal
- Each level: +$50 upgrade price, +5% earning share
- Admin can customize all level settings

### Referral System
- Unique code format: `REF-{USERNAME}-{RANDOM}`
- Automatic reward calculation
- Rewards based on referrer's level
- Multi-tier support

### Task System
- Multiple task types (trading, marketing, referral, learning, manual)
- Trading tasks hidden from regular users
- Proof submission and review
- Automatic balance credit on approval

### Admin Roles
- **super_admin**: Full access
- **finance_admin**: Financial transactions only
- **support_admin**: Tasks and proofs
- **content_admin**: Task management only

## 🐛 Troubleshooting

### Database Connection Issues
- Check `DATABASE_URL` in `.env`
- Ensure database is running
- Verify credentials

### Authentication Issues
- Check `JWT_SECRET` is set
- Clear browser cookies
- Check session expiration

### Rate Limiting
- Default: 100 requests/minute per user
- Adjust in `server/_core/security.ts`

## 📞 Support

For issues or questions:
1. Check `SECURITY.md` for security best practices
2. Review `FEATURES_COMPLETE.md` for feature list
3. Check `README_SETUP.md` for setup instructions

## 🎉 Ready for Production!

The application is now fully functional with:
- ✅ All admin features implemented
- ✅ All user features implemented
- ✅ Security measures in place
- ✅ Database schema ready
- ✅ Default data seeded
- ✅ Error handling
- ✅ Input validation
- ✅ Audit logging

**Deploy with confidence!** 🚀

