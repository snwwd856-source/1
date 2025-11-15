CREATE TABLE `adminRoles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`role` enum('super_admin','finance_admin','support_admin','content_admin','custom') NOT NULL,
	`permissions` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `adminRoles_id` PRIMARY KEY(`id`),
	CONSTRAINT `adminRoles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`action` varchar(255) NOT NULL,
	`targetType` varchar(64),
	`targetId` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kiwiwallCompletions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`offerId` varchar(64) NOT NULL,
	`earnedAmount` int,
	`status` enum('pending','completed','verified') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `kiwiwallCompletions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kiwiwallOffers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`offerId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`logo` text,
	`instructions` text,
	`amount` int,
	`category` varchar(64),
	`os` varchar(32),
	`countries` text,
	`link` text,
	`mappedTaskId` int,
	`payoutPercentage` int DEFAULT 50,
	`active` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `kiwiwallOffers_id` PRIMARY KEY(`id`),
	CONSTRAINT `kiwiwallOffers_offerId_unique` UNIQUE(`offerId`)
);
--> statement-breakpoint
CREATE TABLE `levels` (
	`id` int NOT NULL,
	`name` varchar(64) NOT NULL,
	`upgradePrice` int DEFAULT 0,
	`earningShare` int DEFAULT 15,
	`withdrawMin` int DEFAULT 1000,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `levels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `loans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amountUsd` int NOT NULL,
	`status` enum('issued','repaid','defaulted') DEFAULT 'issued',
	`collateral` int,
	`issuedAt` timestamp DEFAULT (now()),
	`dueAt` timestamp,
	`repaidAt` timestamp,
	`penalty` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `loans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`body` text,
	`read` boolean DEFAULT false,
	`meta` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerId` int NOT NULL,
	`referredId` int NOT NULL,
	`rewardAmount` int,
	`status` enum('pending','completed','cancelled') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `taskAssignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` int NOT NULL,
	`userId` int NOT NULL,
	`status` enum('accepted','in_progress','proof_pending','approved','rejected','expired') DEFAULT 'accepted',
	`acceptedAt` timestamp,
	`proofUrl` text,
	`proofText` text,
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`rejectionReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `taskAssignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`type` enum('trading','marketing','referral','learning','manual','survey') NOT NULL,
	`rewardUsd` int NOT NULL,
	`eligibilityLevel` int DEFAULT 0,
	`slots` int,
	`timeLimitMinutes` int,
	`proofType` enum('image','video','link','text') DEFAULT 'image',
	`status` enum('active','inactive','completed','suspended') DEFAULT 'active',
	`repeatable` boolean DEFAULT false,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('deposit','withdrawal','credit','debit','refund','referral_bonus','level_upgrade') NOT NULL,
	`amountUsd` int NOT NULL,
	`currency` varchar(32),
	`txId` varchar(255),
	`status` enum('pending','completed','failed','cancelled') DEFAULT 'pending',
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wallets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chain` varchar(64) NOT NULL,
	`currency` varchar(32) NOT NULL,
	`address` varchar(255) NOT NULL,
	`label` varchar(128),
	`active` boolean DEFAULT true,
	`createdByAdmin` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wallets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `email` varchar(320) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `username` varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `levelId` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `referralCode` varchar(32) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `referrerId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `balanceUsd` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `kycStatus` enum('pending','verified','rejected') DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `users` ADD `twoFactorEnabled` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `twoFactorSecret` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_username_unique` UNIQUE(`username`);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_referralCode_unique` UNIQUE(`referralCode`);