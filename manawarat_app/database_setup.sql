-- ============================================
-- PromoHive Database Setup Script
-- ============================================
-- This script creates all tables and inserts initial data
-- Run this script in your MySQL database to set up PromoHive
-- ============================================

-- PostgreSQL-compatible PromoHive Database Setup
-- Run this script in a PostgreSQL database (psql)

SET client_min_messages TO WARNING;

-- ============================================
-- Create ENUM types used by tables
-- ============================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kyc_status') THEN
    CREATE TYPE kyc_status AS ENUM ('pending','approved','rejected');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_status') THEN
    CREATE TYPE account_status AS ENUM ('pending_approval','active','suspended','banned');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_type') THEN
    CREATE TYPE role_type AS ENUM ('user','super_admin','finance_admin','support_admin','content_admin');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_type') THEN
    CREATE TYPE task_type AS ENUM ('survey','marketing','referral','learning','trading','manual');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'proof_type') THEN
    CREATE TYPE proof_type AS ENUM ('image','video','link','text');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
    CREATE TYPE task_status AS ENUM ('active','paused','completed','cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'assignment_status') THEN
    CREATE TYPE assignment_status AS ENUM ('accepted','in_progress','proof_pending','approved','rejected');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
    CREATE TYPE transaction_type AS ENUM ('deposit','withdrawal','credit','debit','referral_bonus','level_upgrade','loan_issued','loan_repaid');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
    CREATE TYPE transaction_status AS ENUM ('pending','completed','failed','cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reward_status') THEN
    CREATE TYPE reward_status AS ENUM ('pending','credited','cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'loan_status') THEN
    CREATE TYPE loan_status AS ENUM ('issued','repaid','defaulted','cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'dispute_status') THEN
    CREATE TYPE dispute_status AS ENUM ('open','in_progress','resolved','closed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'support_status') THEN
    CREATE TYPE support_status AS ENUM ('open','in_progress','resolved','closed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'support_priority') THEN
    CREATE TYPE support_priority AS ENUM ('low','medium','high','urgent');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE notification_type AS ENUM ('task_invitation','proof_review','deposit','withdrawal','referral','level_upgrade','system');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kiwiwall_status') THEN
    CREATE TYPE kiwiwall_status AS ENUM ('active','inactive','expired');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'withdrawal_status') THEN
    CREATE TYPE withdrawal_status AS ENUM ('pending','approved','rejected','completed','failed');
  END IF;
END $$;

-- ============================================
-- CREATE TABLES
-- ============================================

-- Users table - Core user accounts
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  email VARCHAR(320) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  phone_number VARCHAR(20),
  profile_image TEXT,
  referral_code VARCHAR(32) NOT NULL UNIQUE,
  referrer_id INT,
  level_id INT NOT NULL DEFAULT 0,
  balance_usd INT NOT NULL DEFAULT 0,
  total_earned INT NOT NULL DEFAULT 0,
  total_withdrawn INT NOT NULL DEFAULT 0,
  kyc_status kyc_status NOT NULL DEFAULT 'pending',
  kyc_email VARCHAR(320),
  kyc_phone VARCHAR(20),
  kyc_id_url TEXT,
  kyc_verified_at TIMESTAMPTZ,
  status account_status NOT NULL DEFAULT 'pending_approval',
  approved_by INT,
  approved_at TIMESTAMPTZ,
  two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  two_factor_secret TEXT,
  role role_type NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_signed_in TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_referrer_id ON users(referrer_id);
CREATE INDEX IF NOT EXISTS idx_users_level_id ON users(level_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Levels table - User membership levels
CREATE TABLE IF NOT EXISTS levels (
  id INT PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  upgrade_price INT NOT NULL,
  earning_share INT NOT NULL,
  minimum_withdrawal INT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin roles table
CREATE TABLE IF NOT EXISTS admin_roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(64) NOT NULL UNIQUE,
  permissions JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Wallets table - Platform payment wallets
CREATE TABLE IF NOT EXISTS wallets (
  id SERIAL PRIMARY KEY,
  chain VARCHAR(32) NOT NULL,
  currency VARCHAR(16) NOT NULL,
  address VARCHAR(256) NOT NULL,
  label VARCHAR(128),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallets_created_by ON wallets(created_by);
CREATE INDEX IF NOT EXISTS idx_wallets_is_active ON wallets(is_active);

-- Tasks table - Task definitions
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(256) NOT NULL,
  description TEXT NOT NULL,
  type task_type NOT NULL,
  reward_usd INT NOT NULL,
  eligibility_level INT NOT NULL DEFAULT 0,
  slots INT NOT NULL,
  active_slots INT NOT NULL DEFAULT 0,
  time_limit_minutes INT,
  proof_type proof_type NOT NULL,
  repeatable BOOLEAN NOT NULL DEFAULT FALSE,
  status task_status NOT NULL DEFAULT 'active',
  created_by INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(type);
CREATE INDEX IF NOT EXISTS idx_tasks_eligibility_level ON tasks(eligibility_level);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);

-- Task assignments - User task assignments
CREATE TABLE IF NOT EXISTS task_assignments (
  id SERIAL PRIMARY KEY,
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  status assignment_status NOT NULL DEFAULT 'accepted',
  accepted_at TIMESTAMPTZ,
  proof_url TEXT,
  proof_text TEXT,
  reviewed_by INT,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_task_assignments_task_id ON task_assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_user_id ON task_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_status ON task_assignments(status);
CREATE INDEX IF NOT EXISTS idx_task_assignments_reviewed_by ON task_assignments(reviewed_by);

-- Transactions table - All financial transactions
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  type transaction_type NOT NULL,
  amount_usd INT NOT NULL,
  currency VARCHAR(16),
  status transaction_status NOT NULL DEFAULT 'pending',
  transaction_id VARCHAR(256),
  wallet_id INT,
  related_task_id INT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_related_task_id ON transactions(related_task_id);

-- Referrals table - Referral tracking
CREATE TABLE IF NOT EXISTS referrals (
  id SERIAL PRIMARY KEY,
  referrer_id INT NOT NULL,
  referred_id INT NOT NULL,
  reward_amount INT NOT NULL,
  reward_status reward_status NOT NULL DEFAULT 'pending',
  tier INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_reward_status ON referrals(reward_status);

-- Loans table - Smart loaning system
CREATE TABLE IF NOT EXISTS loans (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  task_id INT,
  amount INT NOT NULL,
  collateral INT,
  status loan_status NOT NULL DEFAULT 'issued',
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_at TIMESTAMPTZ,
  repaid_at TIMESTAMPTZ,
  penalty_amount INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loans_user_id ON loans(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_task_id ON loans(task_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);

-- Audit logs table - Admin action tracking
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  admin_id INT NOT NULL,
  action VARCHAR(128) NOT NULL,
  target_type VARCHAR(64),
  target_id INT,
  metadata JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_type ON audit_logs(target_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Notifications table - User notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(256) NOT NULL,
  body TEXT NOT NULL,
  type notification_type NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Disputes table - Dispute resolution
CREATE TABLE IF NOT EXISTS disputes (
  id SERIAL PRIMARY KEY,
  task_assignment_id INT NOT NULL,
  user_id INT NOT NULL,
  admin_id INT,
  reason TEXT NOT NULL,
  status dispute_status NOT NULL DEFAULT 'open',
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_disputes_task_assignment_id ON disputes(task_assignment_id);
CREATE INDEX IF NOT EXISTS idx_disputes_user_id ON disputes(user_id);
CREATE INDEX IF NOT EXISTS idx_disputes_admin_id ON disputes(admin_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);

-- Support tickets table - In-app support system
CREATE TABLE IF NOT EXISTS support_tickets (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  admin_id INT,
  subject VARCHAR(256) NOT NULL,
  description TEXT NOT NULL,
  status support_status NOT NULL DEFAULT 'open',
  priority support_priority NOT NULL DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_admin_id ON support_tickets(admin_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);

-- Support messages table - Messages in support tickets
CREATE TABLE IF NOT EXISTS support_messages (
  id SERIAL PRIMARY KEY,
  ticket_id INT NOT NULL,
  sender_id INT NOT NULL,
  message TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON support_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_sender_id ON support_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON support_messages(created_at);

-- Badges table - Achievement badges
CREATE TABLE IF NOT EXISTS badges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  description TEXT,
  icon_url TEXT,
  requirement VARCHAR(256),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User badges table - User badge achievements
CREATE TABLE IF NOT EXISTS user_badges (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  badge_id INT NOT NULL,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);

-- Kiwiwall offers table - Cached Kiwiwall offers
CREATE TABLE IF NOT EXISTS kiwiwall_offers (
  id SERIAL PRIMARY KEY,
  offer_id VARCHAR(128) NOT NULL UNIQUE,
  title VARCHAR(256) NOT NULL,
  description TEXT,
  reward INT NOT NULL,
  payout INT NOT NULL,
  min_level INT NOT NULL DEFAULT 0,
  status kiwiwall_status NOT NULL DEFAULT 'active',
  external_url TEXT,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_kiwiwall_offers_status ON kiwiwall_offers(status);
CREATE INDEX IF NOT EXISTS idx_kiwiwall_offers_min_level ON kiwiwall_offers(min_level);

-- Withdrawal requests table - Withdrawal tracking
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  amount INT NOT NULL,
  wallet_id INT NOT NULL,
  status withdrawal_status NOT NULL DEFAULT 'pending',
  transaction_id VARCHAR(256),
  rejection_reason TEXT,
  approved_by INT,
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_wallet_id ON withdrawal_requests(wallet_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_approved_by ON withdrawal_requests(approved_by);

-- ============================================
-- INSERT INITIAL DATA
-- ============================================

-- Insert Levels (0-9)
INSERT INTO levels (id, name, upgrade_price, earning_share, minimum_withdrawal, description) VALUES
(0, 'Level 0', 0, 15, 1000, 'Entry level - Can earn up to $9.90, minimum withdrawal $10'),
(1, 'Level 1', 5000, 30, 5000, 'Upgrade price $50 - Earn 30% of task value'),
(2, 'Level 2', 10000, 45, 10000, 'Upgrade price $100 - Earn 45% of task value'),
(3, 'Level 3', 15000, 50, 15000, 'Upgrade price $150 - Earn 50% of task value'),
(4, 'Level 4', 20000, 55, 20000, 'Upgrade price $200 - Earn 55% of task value'),
(5, 'Level 5', 25000, 60, 25000, 'Upgrade price $250 - Earn 60% of task value'),
(6, 'Level 6', 30000, 65, 30000, 'Upgrade price $300 - Earn 65% of task value'),
(7, 'Level 7', 35000, 70, 35000, 'Upgrade price $350 - Earn 70% of task value'),
(8, 'Level 8', 40000, 75, 40000, 'Upgrade price $400 - Earn 75% of task value'),
(9, 'Level 9', 45000, 80, 45000, 'Upgrade price $450 - Earn 80% of task value')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  upgrade_price = EXCLUDED.upgrade_price,
  earning_share = EXCLUDED.earning_share,
  minimum_withdrawal = EXCLUDED.minimum_withdrawal,
  description = EXCLUDED.description;

-- Insert Admin User
-- Password: admin123 (hash shown for demo only)
INSERT INTO users (username, email, password_hash, full_name, referral_code, status, kyc_status, role, level_id, balance_usd, total_earned, total_withdrawn, two_factor_enabled, approved_by, approved_at, kyc_verified_at)
VALUES ('admin', 'admin@promohive.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Super Administrator', 'REF-ADMIN-ADMIN', 'active', 'approved', 'super_admin', 9, 0, 0, 0, false, 1, now(), now())
ON CONFLICT (username) DO UPDATE SET email = EXCLUDED.email, role = EXCLUDED.role;

-- Insert Demo Users
INSERT INTO users (username, email, password_hash, full_name, referral_code, status, kyc_status, role, level_id, balance_usd, total_earned, total_withdrawn, two_factor_enabled, approved_by, approved_at)
VALUES
('demo_user1', 'user1@demo.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Demo User 1', 'REF-DEMO_USER1-XXXXX', 'active', 'approved', 'user', 0, 0, 0, 0, false, 1, now()),
('demo_user2', 'user2@demo.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Demo User 2', 'REF-DEMO_USER2-XXXXX', 'active', 'approved', 'user', 1, 0, 0, 0, false, 1, now())
ON CONFLICT (username) DO UPDATE SET email = EXCLUDED.email, level_id = EXCLUDED.level_id;

-- Insert Default Wallets (replace addresses before production)
INSERT INTO wallets (chain, currency, address, label, is_active, created_by) VALUES
('TRC20', 'USDT', 'TQCz2bqXoYWMU7D8qAEqXKwWtMLBFRpgcW', 'Main USDT Wallet', true, 1),
('TRC20', 'USDC', 'TQCz2bqXoYWMU7D8qAEqXKwWtMLBFRpgcW', 'Main USDC Wallet', true, 1)
ON CONFLICT DO NOTHING;

-- ============================================
-- IMPORTANT NOTES
-- ============================================
--
-- 1. PASSWORD HASHES:
--    The password hashes in this file are for demo purposes.
--    To generate new hashes, run:
--    node generate_password_hashes.js
--
-- 2. WALLET ADDRESSES:
--    Replace the wallet addresses with your actual USDT/USDC addresses.
--
-- 3. REFERRAL CODES:
--    The referral codes can be customized. Format: REF-{USERNAME}-{RANDOM}
--
-- 4. SECURITY CHECKLIST:
--    [ ] Change all default passwords immediately
--    [ ] Use strong passwords in production
--    [ ] Enable 2FA for admin accounts
--    [ ] Review all wallet addresses
--    [ ] Update admin email if needed
--    [ ] Review and adjust level pricing
--
-- 5. DEFAULT CREDENTIALS:
--    Admin:
--      Username: admin
--      Password: admin123
--      Email: admin@promohive.com
--
--    Demo Users:
--      Username: demo_user1 / demo_user2
--      Password: demo123
--      Email: user1@demo.com / user2@demo.com
--
-- ============================================

