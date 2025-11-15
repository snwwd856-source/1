# Supabase Setup Instructions

This document provides instructions for setting up PromoHive with Supabase as the database backend.

## Prerequisites

1. A Supabase account (free tier available at [supabase.com](https://supabase.com))
2. A Supabase project created
3. Project URL and API keys from your Supabase project

## Environment Variables

Add the following environment variables to your `.env` file:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

You can find these values in your Supabase project dashboard:
1. Go to your Supabase project
2. Click on "Project Settings" in the sidebar
3. Click on "API"
4. Copy the "Project URL" and "anon" public key
5. For the service key, click on "Service Role" and copy that key

## Setting Up the Database

### Option 1: Run the Migration Script (Recommended)

1. Make sure you have set the environment variables mentioned above
2. Run the migration script:

```bash
pnpm db:migrate:supabase
```

This will create all the necessary tables and insert the initial data.

### Option 2: Manual Setup

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the sidebar
3. Copy and paste the contents of [supabase/001_init_schema.sql](file:///c:/Users/SANAD/Downloads/promohive_complete/manawarat_app/supabase/001_init_schema.sql) into the editor
4. Click "Run" to execute the SQL

## Default Credentials

After running the migration, you'll have the following default accounts:

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

## Customization

### Update Wallet Addresses

After migration, update the wallet addresses in the `wallets` table with your actual USDT/USDC addresses:

```sql
UPDATE wallets SET address = 'YOUR_ACTUAL_USDT_ADDRESS' WHERE currency = 'USDT';
UPDATE wallets SET address = 'YOUR_ACTUAL_USDC_ADDRESS' WHERE currency = 'USDC';
```

### Generate New Password Hashes

To generate new password hashes for your users:

```bash
# Generate hashes
node generate_password_hashes.js
```

Then update the password hashes in the `users` table.

## Verification

After setting up the database, verify the setup by:

1. Checking that all tables were created
2. Verifying the initial data was inserted
3. Testing the connection with the application

## Troubleshooting

### Error: Connection refused

- Check that your Supabase project URL is correct
- Verify your internet connection
- Ensure your Supabase project is not paused

### Error: Invalid API key

- Double-check your anon and service keys
- Make sure you're using the correct keys for the correct operations

### Error: Permission denied

- Ensure you're using the service key for administrative operations
- Check that your Supabase project has the necessary permissions enabled

## Next Steps

1. ✅ Supabase database setup complete
2. ✅ Update wallet addresses
3. ✅ Change default passwords
4. ✅ Configure environment variables
5. ✅ Start the application

For issues or questions:
- Check the main [README.md](file:///c:/Users/SANAD/Downloads/promohive_complete/manawarat_app/README.md) for general setup
- Check [SECURITY.md](file:///c:/Users/SANAD/Downloads/promohive_complete/manawarat_app/SECURITY.md) for security best practices