# PromoHive - Global Promo Network

## Project Overview

PromoHive is a comprehensive global promotional network platform that connects users with tasks, rewards, and referral opportunities. The platform features:

- **User Management**: Role-based access control (Admin/User)
- **Task Management**: Create, manage, and track tasks with various types
- **Wallet System**: Manage user balances and withdrawals
- **Referral Program**: Track referrals and earn bonuses
- **Admin Dashboard**: Comprehensive analytics and management tools
- **Transaction Management**: Track all financial transactions
- **Multi-level System**: User progression through levels with increasing benefits

## Technology Stack

- **Frontend**: React 19 + Tailwind CSS 4 + shadcn/ui
- **Backend**: Express 4 + tRPC 11
- **Database**: MySQL/TiDB via Supabase
- **Authentication**: Manus OAuth
- **Charts**: Recharts for analytics
- **ORM**: Drizzle ORM

## Project Structure

```
manawarat_app/
├── client/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── pages/          # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── ManageTasks.tsx
│   │   │   ├── ManageUsers.tsx
│   │   │   ├── ManageWallets.tsx
│   │   │   ├── ManageLevels.tsx
│   │   │   ├── TaskDetail.tsx
│   │   │   └── UserWallet.tsx
│   │   ├── components/     # Reusable components
│   │   ├── lib/            # Utilities and helpers
│   │   ├── App.tsx         # Main router
│   │   └── index.css       # Global styles
│   └── index.html
├── server/
│   ├── routers.ts          # tRPC procedures
│   ├── db.ts               # Database queries
│   └── _core/              # Core infrastructure
├── drizzle/
│   └── schema.ts           # Database schema
├── storage/                # S3 storage helpers
└── package.json
```

## Database Schema

The application includes 13 main tables:

1. **users** - User accounts and profiles
2. **tasks** - Task definitions and metadata
3. **task_assignments** - User task assignments
4. **task_proofs** - Proof submissions for tasks
5. **transactions** - Financial transactions
6. **wallets** - Cryptocurrency wallets
7. **referrals** - Referral tracking
8. **levels** - User membership levels
9. **notifications** - User notifications
10. **audit_logs** - System audit trail
11. **kiwiwall_offers** - Kiwiwall offer cache
12. **user_levels** - User level assignments
13. **withdrawal_requests** - Withdrawal request tracking

## Setup Instructions

### Prerequisites

- Node.js 18+
- pnpm or npm
- Supabase account
- Manus account for OAuth

### 1. Environment Setup

Create a `.env.local` file in the project root:

```env
# Database
DATABASE_URL=mysql://user:password@host:3306/manawarat

# OAuth
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# Secrets
JWT_SECRET=your_jwt_secret_key
OWNER_OPEN_ID=your_owner_id
OWNER_NAME=Your Name

# API Keys
BUILT_IN_FORGE_API_KEY=your_api_key
BUILT_IN_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your_frontend_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im

# App Configuration
VITE_APP_TITLE=PromoHive - Global Promo Network
VITE_APP_LOGO=/promohive-logo.svg
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your_website_id
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Database Setup

```bash
# Push schema to database
pnpm db:push

# Generate migrations
pnpm db:generate
```

### 4. Start Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Features

### User Features

- **Task Browsing**: Browse available tasks by type and reward
- **Task Completion**: Submit proofs for task completion
- **Wallet Management**: View balance and transaction history
- **Withdrawal Requests**: Request withdrawals to crypto wallets
- **Referral System**: Share referral codes and earn bonuses
- **Level Progression**: Advance through levels for better benefits
- **Profile Management**: Update personal information

### Admin Features

- **Dashboard**: Real-time analytics and statistics
- **Task Management**: Create, edit, and delete tasks
- **User Management**: View and manage user accounts
- **Wallet Management**: Configure payment wallets
- **Level Configuration**: Set level requirements and benefits
- **Proof Review**: Approve or reject task proofs
- **Withdrawal Management**: Approve or deny withdrawal requests
- **Audit Logs**: Track all system activities

## API Endpoints

### Authentication
- `POST /api/oauth/callback` - OAuth callback handler
- `POST /api/trpc/auth.me` - Get current user
- `POST /api/trpc/auth.logout` - Logout user

### Tasks
- `POST /api/trpc/tasks.list` - List available tasks
- `POST /api/trpc/tasks.getById` - Get task details
- `POST /api/trpc/tasks.create` - Create new task (admin)
- `POST /api/trpc/tasks.update` - Update task (admin)
- `POST /api/trpc/tasks.delete` - Delete task (admin)

### User
- `POST /api/trpc/user.getProfile` - Get user profile
- `POST /api/trpc/user.updateProfile` - Update profile
- `POST /api/trpc/user.getReferralCode` - Get referral code
- `POST /api/trpc/user.getReferralStats` - Get referral statistics

### Wallet
- `POST /api/trpc/wallets.list` - List wallets (admin)
- `POST /api/trpc/wallets.create` - Create wallet (admin)
- `POST /api/trpc/wallets.update` - Update wallet (admin)
- `POST /api/trpc/wallets.delete` - Delete wallet (admin)

### Transactions
- `POST /api/trpc/transactions.getHistory` - Get transaction history
- `POST /api/trpc/transactions.requestWithdrawal` - Request withdrawal
- `POST /api/trpc/transactions.approveWithdrawal` - Approve withdrawal (admin)
- `POST /api/trpc/transactions.denyWithdrawal` - Deny withdrawal (admin)

## Deployment

### Using Manus Platform

1. **Save Checkpoint**: Create a checkpoint in the development environment
2. **Publish**: Click the "Publish" button in the Management UI
3. **Configure Domain**: Set up your custom domain in Settings → Domains
4. **Enable SSL**: Enable SSL in database settings

### Manual Deployment (Docker)

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

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_URL=mysql://user:password@host:3306/manawarat
JWT_SECRET=your_secure_random_secret
# ... other environment variables
```

## Configuration

### Wallet Configuration

Add payment wallets in the admin panel:

1. Go to Admin Dashboard → Manage Wallets
2. Click "Add Wallet"
3. Select chain (TRC20, ERC20, BEP20, Polygon)
4. Enter wallet address
5. Set as active

### Level Configuration

Configure user levels in the admin panel:

1. Go to Admin Dashboard → Manage Levels
2. Click "Edit" on any level
3. Set upgrade price, earning share, and minimum withdrawal
4. Save changes

### Task Configuration

Create tasks in the admin panel:

1. Go to Admin Dashboard → Manage Tasks
2. Click "Create Task"
3. Fill in task details (title, description, reward, type)
4. Set proof type (image, video, link, text)
5. Configure time limit and slots
6. Save task

## Security Considerations

1. **Authentication**: All endpoints use Manus OAuth for secure authentication
2. **Authorization**: Role-based access control (RBAC) for admin functions
3. **Data Protection**: All sensitive data is encrypted in transit (HTTPS)
4. **Audit Logging**: All admin actions are logged for compliance
5. **Rate Limiting**: Implement rate limiting for API endpoints
6. **Input Validation**: All inputs are validated server-side

## Performance Optimization

1. **Caching**: Implement Redis caching for frequently accessed data
2. **Database Indexing**: Add indexes on frequently queried columns
3. **CDN**: Use CDN for static assets
4. **Compression**: Enable gzip compression for responses
5. **Lazy Loading**: Implement lazy loading for images and components

## Monitoring and Logging

1. **Error Tracking**: Implement Sentry for error tracking
2. **Analytics**: Track user behavior and platform metrics
3. **Logging**: Log all transactions and admin actions
4. **Alerts**: Set up alerts for critical events

## Troubleshooting

### Database Connection Issues

```bash
# Test database connection
pnpm db:push

# Check environment variables
echo $DATABASE_URL
```

### OAuth Issues

1. Verify OAuth credentials in `.env.local`
2. Check redirect URI in OAuth provider settings
3. Clear browser cookies and try again

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Rebuild
pnpm build
```

## Support and Documentation

- **API Documentation**: See `server/routers.ts` for tRPC procedure definitions
- **Component Documentation**: Check component files for usage examples
- **Database Schema**: See `drizzle/schema.ts` for table definitions

## License

This project is proprietary and confidential.

## Contact

For support, please contact the development team.
