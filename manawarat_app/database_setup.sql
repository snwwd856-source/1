-- ============================================
-- PromoHive Database Setup Script
-- ============================================
-- This script creates all tables and inserts initial data
-- Run this script in your MySQL database to set up PromoHive
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- ============================================
-- CREATE TABLES
-- ============================================

-- Users table - Core user accounts
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(64) NOT NULL,
  `email` varchar(320) NOT NULL,
  `password_hash` text NOT NULL,
  `full_name` text,
  `phone_number` varchar(20),
  `profile_image` text,
  `referral_code` varchar(32) NOT NULL,
  `referrer_id` int,
  `level_id` int NOT NULL DEFAULT 0,
  `balance_usd` int NOT NULL DEFAULT 0 COMMENT 'Stored in cents',
  `total_earned` int NOT NULL DEFAULT 0,
  `total_withdrawn` int NOT NULL DEFAULT 0,
  `kyc_status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `kyc_email` varchar(320),
  `kyc_phone` varchar(20),
  `kyc_id_url` text,
  `kyc_verified_at` timestamp NULL,
  `status` enum('pending_approval','active','suspended','banned') NOT NULL DEFAULT 'pending_approval',
  `approved_by` int,
  `approved_at` timestamp NULL,
  `two_factor_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `two_factor_secret` text,
  `role` enum('user','super_admin','finance_admin','support_admin','content_admin') NOT NULL DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_signed_in` timestamp NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `referral_code` (`referral_code`),
  KEY `referrer_id` (`referrer_id`),
  KEY `level_id` (`level_id`),
  KEY `status` (`status`),
  KEY `role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Levels table - User membership levels
CREATE TABLE IF NOT EXISTS `levels` (
  `id` int NOT NULL,
  `name` varchar(64) NOT NULL,
  `upgrade_price` int NOT NULL COMMENT 'In cents',
  `earning_share` int NOT NULL COMMENT 'Percentage 0-100',
  `minimum_withdrawal` int NOT NULL COMMENT 'In cents',
  `description` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin roles table
CREATE TABLE IF NOT EXISTS `admin_roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `permissions` json NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Wallets table - Platform payment wallets
CREATE TABLE IF NOT EXISTS `wallets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `chain` varchar(32) NOT NULL COMMENT 'TRC20, ERC20, BEP20, Polygon',
  `currency` varchar(16) NOT NULL COMMENT 'USDC, USDT',
  `address` varchar(256) NOT NULL,
  `label` varchar(128),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tasks table - Task definitions
CREATE TABLE IF NOT EXISTS `tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(256) NOT NULL,
  `description` text NOT NULL,
  `type` enum('survey','marketing','referral','learning','trading','manual') NOT NULL,
  `reward_usd` int NOT NULL COMMENT 'In cents',
  `eligibility_level` int NOT NULL DEFAULT 0,
  `slots` int NOT NULL,
  `active_slots` int NOT NULL DEFAULT 0,
  `time_limit_minutes` int,
  `proof_type` enum('image','video','link','text') NOT NULL,
  `repeatable` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('active','paused','completed','cancelled') NOT NULL DEFAULT 'active',
  `created_by` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `type` (`type`),
  KEY `eligibility_level` (`eligibility_level`),
  KEY `status` (`status`),
  KEY `created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Task assignments - User task assignments
CREATE TABLE IF NOT EXISTS `task_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_id` int NOT NULL,
  `user_id` int NOT NULL,
  `status` enum('accepted','in_progress','proof_pending','approved','rejected') NOT NULL DEFAULT 'accepted',
  `accepted_at` timestamp NULL,
  `proof_url` text,
  `proof_text` text,
  `reviewed_by` int,
  `reviewed_at` timestamp NULL,
  `rejection_reason` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `task_id` (`task_id`),
  KEY `user_id` (`user_id`),
  KEY `status` (`status`),
  KEY `reviewed_by` (`reviewed_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transactions table - All financial transactions
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `type` enum('deposit','withdrawal','credit','debit','referral_bonus','level_upgrade','loan_issued','loan_repaid') NOT NULL,
  `amount_usd` int NOT NULL COMMENT 'In cents',
  `currency` varchar(16),
  `status` enum('pending','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
  `transaction_id` varchar(256),
  `wallet_id` int,
  `related_task_id` int,
  `metadata` json,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `type` (`type`),
  KEY `status` (`status`),
  KEY `wallet_id` (`wallet_id`),
  KEY `related_task_id` (`related_task_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Referrals table - Referral tracking
CREATE TABLE IF NOT EXISTS `referrals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `referrer_id` int NOT NULL,
  `referred_id` int NOT NULL,
  `reward_amount` int NOT NULL COMMENT 'In cents',
  `reward_status` enum('pending','credited','cancelled') NOT NULL DEFAULT 'pending',
  `tier` int NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `referrer_id` (`referrer_id`),
  KEY `referred_id` (`referred_id`),
  KEY `reward_status` (`reward_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Loans table - Smart loaning system
CREATE TABLE IF NOT EXISTS `loans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `task_id` int,
  `amount` int NOT NULL COMMENT 'In cents',
  `collateral` int,
  `status` enum('issued','repaid','defaulted','cancelled') NOT NULL DEFAULT 'issued',
  `issued_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `due_at` timestamp NULL,
  `repaid_at` timestamp NULL,
  `penalty_amount` int NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `task_id` (`task_id`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit logs table - Admin action tracking
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL,
  `action` varchar(128) NOT NULL,
  `target_type` varchar(64),
  `target_id` int,
  `metadata` json,
  `ip_address` varchar(45),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`),
  KEY `action` (`action`),
  KEY `target_type` (`target_type`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications table - User notifications
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(256) NOT NULL,
  `body` text NOT NULL,
  `type` enum('task_invitation','proof_review','deposit','withdrawal','referral','level_upgrade','system') NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `metadata` json,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `type` (`type`),
  KEY `is_read` (`is_read`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Disputes table - Dispute resolution
CREATE TABLE IF NOT EXISTS `disputes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_assignment_id` int NOT NULL,
  `user_id` int NOT NULL,
  `admin_id` int,
  `reason` text NOT NULL,
  `status` enum('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
  `resolution` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` timestamp NULL,
  PRIMARY KEY (`id`),
  KEY `task_assignment_id` (`task_assignment_id`),
  KEY `user_id` (`user_id`),
  KEY `admin_id` (`admin_id`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Support tickets table - In-app support system
CREATE TABLE IF NOT EXISTS `support_tickets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `admin_id` int,
  `subject` varchar(256) NOT NULL,
  `description` text NOT NULL,
  `status` enum('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
  `priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` timestamp NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `admin_id` (`admin_id`),
  KEY `status` (`status`),
  KEY `priority` (`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Support messages table - Messages in support tickets
CREATE TABLE IF NOT EXISTS `support_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `message` text NOT NULL,
  `attachment_url` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ticket_id` (`ticket_id`),
  KEY `sender_id` (`sender_id`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Badges table - Achievement badges
CREATE TABLE IF NOT EXISTS `badges` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(128) NOT NULL,
  `description` text,
  `icon_url` text,
  `requirement` varchar(256),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User badges table - User badge achievements
CREATE TABLE IF NOT EXISTS `user_badges` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `badge_id` int NOT NULL,
  `awarded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `badge_id` (`badge_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Kiwiwall offers table - Cached Kiwiwall offers
CREATE TABLE IF NOT EXISTS `kiwiwall_offers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `offer_id` varchar(128) NOT NULL,
  `title` varchar(256) NOT NULL,
  `description` text,
  `reward` int NOT NULL COMMENT 'In cents',
  `payout` int NOT NULL COMMENT 'In cents',
  `min_level` int NOT NULL DEFAULT 0,
  `status` enum('active','inactive','expired') NOT NULL DEFAULT 'active',
  `external_url` text,
  `cached_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `offer_id` (`offer_id`),
  KEY `status` (`status`),
  KEY `min_level` (`min_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Withdrawal requests table - Withdrawal tracking
CREATE TABLE IF NOT EXISTS `withdrawal_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `amount` int NOT NULL COMMENT 'In cents',
  `wallet_id` int NOT NULL,
  `status` enum('pending','approved','rejected','completed','failed') NOT NULL DEFAULT 'pending',
  `transaction_id` varchar(256),
  `rejection_reason` text,
  `approved_by` int,
  `approved_at` timestamp NULL,
  `completed_at` timestamp NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `wallet_id` (`wallet_id`),
  KEY `status` (`status`),
  KEY `approved_by` (`approved_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- INSERT INITIAL DATA
-- ============================================

-- Insert Levels (0-9)
INSERT INTO `levels` (`id`, `name`, `upgrade_price`, `earning_share`, `minimum_withdrawal`, `description`) VALUES
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
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `upgrade_price`=VALUES(`upgrade_price`), `earning_share`=VALUES(`earning_share`), `minimum_withdrawal`=VALUES(`minimum_withdrawal`), `description`=VALUES(`description`);

-- Insert Admin User
-- Password: admin123
-- To generate bcrypt hash, run: node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10).then(h => console.log(h));"
-- Or use online tool: https://bcrypt-generator.com/
INSERT INTO `users` (`username`, `email`, `password_hash`, `full_name`, `referral_code`, `status`, `kyc_status`, `role`, `level_id`, `balance_usd`, `total_earned`, `total_withdrawn`, `two_factor_enabled`, `approved_by`, `approved_at`, `kyc_verified_at`) VALUES
('admin', 'admin@promohive.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Super Administrator', 'REF-ADMIN-ADMIN', 'active', 'approved', 'super_admin', 9, 0, 0, 0, 0, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE `email`=VALUES(`email`), `role`=VALUES(`role`);

-- Insert Demo Users
-- Password: demo123
-- To generate bcrypt hash, run: node -e "const bcrypt = require('bcrypt'); bcrypt.hash('demo123', 10).then(h => console.log(h));"
INSERT INTO `users` (`username`, `email`, `password_hash`, `full_name`, `referral_code`, `status`, `kyc_status`, `role`, `level_id`, `balance_usd`, `total_earned`, `total_withdrawn`, `two_factor_enabled`, `approved_by`, `approved_at`) VALUES
('demo_user1', 'user1@demo.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Demo User 1', 'REF-DEMO_USER1-XXXXX', 'active', 'approved', 'user', 0, 0, 0, 0, 0, 1, NOW()),
('demo_user2', 'user2@demo.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Demo User 2', 'REF-DEMO_USER2-XXXXX', 'active', 'approved', 'user', 1, 0, 0, 0, 0, 1, NOW())
ON DUPLICATE KEY UPDATE `email`=VALUES(`email`), `level_id`=VALUES(`level_id`);

-- Insert Default Wallets
-- Note: Replace with your actual wallet addresses!
INSERT INTO `wallets` (`chain`, `currency`, `address`, `label`, `is_active`, `created_by`) VALUES
('TRC20', 'USDT', 'TQCz2bqXoYWMU7D8qAEqXKwWtMLBFRpgcW', 'Main USDT Wallet', 1, 1),
('TRC20', 'USDC', 'TQCz2bqXoYWMU7D8qAEqXKwWtMLBFRpgcW', 'Main USDC Wallet', 1, 1)
ON DUPLICATE KEY UPDATE `address`=VALUES(`address`), `label`=VALUES(`label`);

-- ============================================
-- IMPORTANT NOTES
-- ============================================
-- 
-- 1. PASSWORD HASHES:
--    The password hashes in this file are for demo purposes.
--    To generate new hashes, run:
--    node generate_password_hashes.js
--    Or use online tool: https://bcrypt-generator.com/
--
-- 2. WALLET ADDRESSES:
--    Replace the wallet addresses with your actual USDT/USDC addresses.
--    Current addresses are placeholders - UPDATE THEM!
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

