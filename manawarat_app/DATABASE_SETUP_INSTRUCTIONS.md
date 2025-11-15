# Database Setup Instructions

## Quick Start

1. **Create Database**
   ```sql
   CREATE DATABASE promohive CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   USE promohive;
   ```

2. **Run SQL Script**
   ```bash
   mysql -u your_username -p promohive < database_setup.sql
   ```
   Or import via phpMyAdmin / MySQL Workbench

3. **Generate Password Hashes (Optional)**
   ```bash
   node generate_password_hashes.js
   ```
   Then update the hashes in `database_setup.sql` if needed.

## What's Included

### Tables Created:
- ✅ `users` - User accounts
- ✅ `levels` - Membership levels (0-9)
- ✅ `wallets` - Payment wallets
- ✅ `tasks` - Task definitions
- ✅ `task_assignments` - User task assignments
- ✅ `transactions` - Financial transactions
- ✅ `referrals` - Referral tracking
- ✅ `loans` - Smart loaning system
- ✅ `audit_logs` - Admin action logs
- ✅ `notifications` - User notifications
- ✅ `disputes` - Dispute resolution
- ✅ `support_tickets` - Support tickets
- ✅ `support_messages` - Support messages
- ✅ `badges` - Achievement badges
- ✅ `user_badges` - User badge achievements
- ✅ `kiwiwall_offers` - Kiwiwall offers cache
- ✅ `withdrawal_requests` - Withdrawal requests
- ✅ `admin_roles` - Admin role permissions

### Initial Data:
- ✅ 10 Levels (Level 0 to Level 9)
- ✅ Admin user (admin / admin123)
- ✅ 2 Demo users (demo_user1, demo_user2 / demo123)
- ✅ 2 Default wallets (USDT/USDC TRC20)

## Default Credentials

### Admin Account
- **Username:** `admin`
- **Password:** `admin123`
- **Email:** `admin@promohive.com`
- **Role:** `super_admin`
- **Level:** 9

### Demo Users
- **Username:** `demo_user1` / `demo_user2`
- **Password:** `demo123`
- **Email:** `user1@demo.com` / `user2@demo.com`
- **Role:** `user`
- **Level:** 0 / 1

⚠️ **IMPORTANT:** Change these passwords in production!

## Level Structure

| Level | Upgrade Price | Earning Share | Min Withdrawal |
|-------|--------------|---------------|----------------|
| 0     | $0           | 15%           | $10            |
| 1     | $50          | 30%           | $50            |
| 2     | $100         | 45%           | $100           |
| 3     | $150         | 50%           | $150           |
| 4     | $200         | 55%           | $200           |
| 5     | $250         | 60%           | $250           |
| 6     | $300         | 65%           | $300           |
| 7     | $350         | 70%           | $350           |
| 8     | $400         | 75%           | $400           |
| 9     | $450         | 80%           | $450           |

## Customization

### Update Wallet Addresses
Edit the `INSERT INTO wallets` section in `database_setup.sql`:
```sql
INSERT INTO `wallets` (`chain`, `currency`, `address`, `label`, `is_active`, `created_by`) VALUES
('TRC20', 'USDT', 'YOUR_ACTUAL_USDT_ADDRESS', 'Main USDT Wallet', 1, 1),
('TRC20', 'USDC', 'YOUR_ACTUAL_USDC_ADDRESS', 'Main USDC Wallet', 1, 1);
```

### Generate New Password Hashes
```bash
# Install bcrypt if needed
pnpm install bcrypt

# Generate hashes
node generate_password_hashes.js
```

### Update Admin Email
```sql
UPDATE users SET email = 'your-email@domain.com' WHERE username = 'admin';
```

## Verification

After running the script, verify:

```sql
-- Check tables
SHOW TABLES;

-- Check levels
SELECT * FROM levels ORDER BY id;

-- Check admin user
SELECT username, email, role, level_id FROM users WHERE username = 'admin';

-- Check wallets
SELECT * FROM wallets;
```

## Troubleshooting

### Error: Table already exists
- Drop existing tables first: `DROP DATABASE promohive; CREATE DATABASE promohive;`
- Or use `CREATE TABLE IF NOT EXISTS` (already included)

### Error: Foreign key constraint
- Make sure to run the script in order
- Check that referenced tables exist

### Password hash issues
- Generate new hashes using `generate_password_hashes.js`
- Ensure bcrypt is installed: `pnpm install bcrypt`

## Next Steps

1. ✅ Database setup complete
2. ✅ Update wallet addresses
3. ✅ Change default passwords
4. ✅ Configure environment variables
5. ✅ Start the application

## Support

For issues or questions:
- Check `README.md` for general setup
- Check `SECURITY.md` for security best practices
- Review `database_setup.sql` for table structure

