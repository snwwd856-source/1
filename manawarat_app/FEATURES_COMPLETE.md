# PromoHive - Complete Features List

## ✅ Completed Features

### 1. Admin Dashboard & Roles
- ✅ Live statistics dashboard (total users, active tasks, pending proofs, revenue, withdrawals)
- ✅ Role-based access control:
  - **super_admin**: Full access to all features
  - **finance_admin**: Manage transactions, withdrawals, deposits only
  - **support_admin**: Manage tasks, proofs, user support
  - **content_admin**: Create, edit, delete tasks only
- ✅ Admin actions:
  - Accept/reject new users
  - Upgrade/downgrade user levels
  - Credit/debit user balances
  - Create/edit/delete tasks
  - Add/edit/delete wallet addresses (USDC/USDT TRC20)
  - Approve/reject task proofs
  - Approve/reject deposits and withdrawals
  - Add/remove other admins
  - View audit logs

### 2. User Accounts & Referral System
- ✅ Unique referral code format: `REF-{USERNAME}-{RANDOM}`
  - Example: `REF-USER123-X5B8`
- ✅ Automatic referral tracking and reward calculation
- ✅ Referral rewards based on referrer's level:
  - Level 0: 15% of task value
  - Level 1: 30% of task value
  - And so on...
- ✅ User registration with admin approval workflow
- ✅ KYC status tracking (pending, approved, rejected)

### 3. Task Management System
- ✅ Task types:
  - Trading contracts (hidden from regular users, admin only)
  - Marketing tasks (share, comment, like)
  - Referral tasks
  - Learning tasks
  - Manual tasks (unlimited)
- ✅ Task workflow:
  1. Admin creates task
  2. User accepts task
  3. User completes task
  4. User uploads proof
  5. Admin reviews proof
  6. System auto-credits balance on approval
- ✅ Task statuses with color coding:
  - 🟢 New/Accepted
  - 🟡 In Progress
  - 🔵 Proof Pending
  - 🟣 Approved
  - 🔴 Rejected
- ✅ Task fields:
  - Title, description, type
  - Level eligibility
  - Reward amount (USD)
  - Proof type (image, video, link, text)
  - Time limit (optional)
  - Slots/quantity
  - Repeatable flag

### 4. Wallet & Payment System
- ✅ Multiple wallet support:
  - USDC/USDT on TRC20
  - Other chains (ERC20, BEP20, Polygon)
- ✅ Admin wallet management (add, edit, delete)
- ✅ Deposit flow:
  - Admin can approve manual deposits
  - Transaction tracking
- ✅ Withdrawal flow:
  - User requests withdrawal
  - Finance admin reviews
  - Approve/deny with reason
  - Transaction ID tracking
- ✅ All transactions recorded with audit trail

### 5. Level System
- ✅ 10 levels (0-9) with configurable pricing:
  - **Level 0**: $0 upgrade, 15% earning, $10 min withdrawal
  - **Level 1**: $50 upgrade, 30% earning, $50 min withdrawal
  - **Level 2**: $100 upgrade, 45% earning, $100 min withdrawal
  - Each level increases by 5% earning share
- ✅ Admin can customize:
  - Upgrade price per level
  - Earning share percentage
  - Minimum withdrawal amount
  - Level name and description

### 6. Referral Commission System
- ✅ Automatic referral reward calculation
- ✅ Multi-tier referral support
- ✅ Example rules:
  - Level 0 invites 5 Level 0 users → earns $2.20 total
  - Level 1 invites 5 users who buy Level 1 → earns $70
- ✅ Referral tracking in database

### 7. Kiwiwall Integration
- ✅ Offer fetching from Kiwiwall
- ✅ Automatic reward calculation based on user level:
  - Lowest level: 10% of offer value
  - Highest level: 70% of offer value
  - Remainder goes to admin/platform
- ✅ Offer completion tracking

### 8. Proof Review System
- ✅ Users upload proof (image/video/link/text)
- ✅ Admin review interface
- ✅ Approve/reject with reason
- ✅ Automatic balance credit on approval
- ✅ Referral reward processing on approval

### 9. Smart Loan System
- ✅ Loan tracking (issued, repaid, defaulted)
- ✅ Collateral support
- ✅ Time limits and penalties
- ✅ Admin can configure loan rules

### 10. Audit Logging
- ✅ Complete audit trail for all admin actions
- ✅ Logs include:
  - Admin ID
  - Action type
  - Target type and ID
  - Metadata
  - Timestamp
  - IP address (optional)

### 11. Notifications System
- ✅ Notification types:
  - Task invitations
  - Proof review results
  - Deposits/withdrawals
  - Referral rewards
  - Level upgrades
  - System notifications
- ✅ Read/unread status tracking

### 12. Security Features
- ✅ Two-factor authentication support (2FA)
- ✅ Session management
- ✅ Role-based access control
- ✅ Audit logging
- ✅ Password hashing (bcrypt)

## 📊 Database Schema

All tables are properly defined in `drizzle/schema.ts`:
- `users` - User accounts
- `levels` - Membership levels
- `tasks` - Task definitions
- `task_assignments` - User task assignments
- `transactions` - All financial transactions
- `wallets` - Platform payment wallets
- `referrals` - Referral tracking
- `loans` - Smart loaning system
- `audit_logs` - Admin action logs
- `notifications` - User notifications
- `withdrawal_requests` - Withdrawal tracking
- `kiwiwall_offers` - Cached Kiwiwall offers

## 🔧 Configuration

### Environment Variables
- `DATABASE_URL` - MySQL database connection
- `JWT_SECRET` - Session token secret
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_KEY` - Supabase service key

### Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@promohive.com`
- **Role**: `super_admin`

### Demo User Credentials
- **Username**: `demo_user1` or `demo_user2`
- **Password**: `demo123`

## 🚀 Setup Instructions

1. Install dependencies: `pnpm install`
2. Configure `.env` file (see `README_SETUP.md`)
3. Run migrations: `pnpm drizzle-kit push`
4. Seed database: `node seed.mjs`
5. Start dev server: `pnpm dev`

## 📝 Notes

- All UI text is in English only
- All amounts stored in cents (integers) to avoid float errors
- Referral codes follow format: `REF-{USERNAME}-{RANDOM}`
- Trading tasks are hidden from regular users (admin only)
- System automatically credits balance when proof is approved
- Referral rewards calculated automatically based on referrer's level

## 🎯 Next Steps (Optional Enhancements)

- [ ] Visual referral tree component
- [ ] Advanced analytics and reports
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Leaderboards and badges
- [ ] In-app support chat
- [ ] Task timer warnings
- [ ] Automated Kiwiwall offer fetching

