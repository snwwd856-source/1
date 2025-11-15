import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
  datetime,
  longtext,
} from "drizzle-orm/mysql-core";

/**
 * Users table - Core user accounts
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name"),
  phoneNumber: varchar("phone_number", { length: 20 }),
  profileImage: text("profile_image"),
  
  // Referral system
  referralCode: varchar("referral_code", { length: 32 }).notNull().unique(),
  referrerId: int("referrer_id"),
  
  // Levels and earnings
  levelId: int("level_id").notNull().default(0),
  balanceUsd: int("balance_usd").notNull().default(0), // Stored in cents
  totalEarned: int("total_earned").notNull().default(0),
  totalWithdrawn: int("total_withdrawn").notNull().default(0),
  
  // KYC status
  kycStatus: mysqlEnum("kyc_status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  kycEmail: varchar("kyc_email", { length: 320 }),
  kycPhone: varchar("kyc_phone", { length: 20 }),
  kycIdUrl: text("kyc_id_url"),
  kycVerifiedAt: timestamp("kyc_verified_at"),
  
  // Admin approval
  status: mysqlEnum("status", ["pending_approval", "active", "suspended", "banned"]).default("pending_approval").notNull(),
  approvedBy: int("approved_by"),
  approvedAt: timestamp("approved_at"),
  
  // 2FA
  twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
  twoFactorSecret: text("two_factor_secret"),
  
  // Role
  role: mysqlEnum("role", ["user", "super_admin", "finance_admin", "support_admin", "content_admin"]).default("user").notNull(),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("last_signed_in"),
});

/**
 * Levels table - User membership levels
 */
export const levels = mysqlTable("levels", {
  id: int("id").primaryKey(),
  name: varchar("name", { length: 64 }).notNull(),
  upgradePrice: int("upgrade_price").notNull(), // In cents
  earningShare: int("earning_share").notNull(), // Percentage (0-100)
  minimumWithdrawal: int("minimum_withdrawal").notNull(), // In cents
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

/**
 * Admin roles and permissions
 */
export const adminRoles = mysqlTable("admin_roles", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 64 }).notNull().unique(),
  permissions: json("permissions").$type<string[]>().notNull(), // Array of permission strings
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

/**
 * Wallets table - Platform payment wallets
 */
export const wallets = mysqlTable("wallets", {
  id: int("id").autoincrement().primaryKey(),
  chain: varchar("chain", { length: 32 }).notNull(), // TRC20, ERC20, BEP20, Polygon
  currency: varchar("currency", { length: 16 }).notNull(), // USDC, USDT
  address: varchar("address", { length: 256 }).notNull(),
  label: varchar("label", { length: 128 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

/**
 * Tasks table - Task definitions
 */
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description").notNull(),
  type: mysqlEnum("type", ["survey", "marketing", "referral", "learning", "trading", "manual"]).notNull(),
  rewardUsd: int("reward_usd").notNull(), // In cents
  eligibilityLevel: int("eligibility_level").default(0).notNull(),
  slots: int("slots").notNull(),
  activeSlots: int("active_slots").default(0).notNull(),
  timeLimitMinutes: int("time_limit_minutes"),
  proofType: mysqlEnum("proof_type", ["image", "video", "link", "text"]).notNull(),
  repeatable: boolean("repeatable").default(false).notNull(),
  status: mysqlEnum("status", ["active", "paused", "completed", "cancelled"]).default("active").notNull(),
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

/**
 * Task assignments - User task assignments
 */
export const taskAssignments = mysqlTable("task_assignments", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("task_id").notNull(),
  userId: int("user_id").notNull(),
  status: mysqlEnum("status", ["accepted", "in_progress", "proof_pending", "approved", "rejected"]).default("accepted").notNull(),
  acceptedAt: timestamp("accepted_at"),
  proofUrl: text("proof_url"),
  proofText: text("proof_text"),
  reviewedBy: int("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

/**
 * Transactions table - All financial transactions
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  type: mysqlEnum("type", ["deposit", "withdrawal", "credit", "debit", "referral_bonus", "level_upgrade", "loan_issued", "loan_repaid"]).notNull(),
  amountUsd: int("amount_usd").notNull(), // In cents
  currency: varchar("currency", { length: 16 }),
  status: mysqlEnum("status", ["pending", "completed", "failed", "cancelled"]).default("pending").notNull(),
  transactionId: varchar("transaction_id", { length: 256 }),
  walletId: int("wallet_id"),
  relatedTaskId: int("related_task_id"),
  metadata: json("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

/**
 * Referrals table - Referral tracking
 */
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  referrerId: int("referrer_id").notNull(),
  referredId: int("referred_id").notNull(),
  rewardAmount: int("reward_amount").notNull(), // In cents
  rewardStatus: mysqlEnum("reward_status", ["pending", "credited", "cancelled"]).default("pending").notNull(),
  tier: int("tier").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Loans table - Smart loaning system
 */
export const loans = mysqlTable("loans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  taskId: int("task_id"),
  amount: int("amount").notNull(), // In cents
  collateral: int("collateral"),
  status: mysqlEnum("status", ["issued", "repaid", "defaulted", "cancelled"]).default("issued").notNull(),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
  dueAt: timestamp("due_at"),
  repaidAt: timestamp("repaid_at"),
  penaltyAmount: int("penalty_amount").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Audit logs table - Admin action tracking
 */
export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("admin_id").notNull(),
  action: varchar("action", { length: 128 }).notNull(),
  targetType: varchar("target_type", { length: 64 }),
  targetId: int("target_id"),
  metadata: json("metadata").$type<Record<string, any>>(),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Notifications table - User notifications
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  body: text("body").notNull(),
  type: mysqlEnum("type", ["task_invitation", "proof_review", "deposit", "withdrawal", "referral", "level_upgrade", "system"]).notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  metadata: json("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Disputes table - Dispute resolution
 */
export const disputes = mysqlTable("disputes", {
  id: int("id").autoincrement().primaryKey(),
  taskAssignmentId: int("task_assignment_id").notNull(),
  userId: int("user_id").notNull(),
  adminId: int("admin_id"),
  reason: text("reason").notNull(),
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "closed"]).default("open").notNull(),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

/**
 * Support tickets table - In-app support system
 */
export const supportTickets = mysqlTable("support_tickets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  adminId: int("admin_id"),
  subject: varchar("subject", { length: 256 }).notNull(),
  description: text("description").notNull(),
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "closed"]).default("open").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

/**
 * Support messages table - Messages in support tickets
 */
export const supportMessages = mysqlTable("support_messages", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticket_id").notNull(),
  senderId: int("sender_id").notNull(),
  message: text("message").notNull(),
  attachmentUrl: text("attachment_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Badges table - Achievement badges
 */
export const badges = mysqlTable("badges", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  iconUrl: text("icon_url"),
  requirement: varchar("requirement", { length: 256 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * User badges table - User badge achievements
 */
export const userBadges = mysqlTable("user_badges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  badgeId: int("badge_id").notNull(),
  awardedAt: timestamp("awarded_at").defaultNow().notNull(),
});

/**
 * Kiwiwall offers table - Cached Kiwiwall offers
 */
export const kiwiwallOffers = mysqlTable("kiwiwall_offers", {
  id: int("id").autoincrement().primaryKey(),
  offerId: varchar("offer_id", { length: 128 }).notNull().unique(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  reward: int("reward").notNull(), // In cents
  payout: int("payout").notNull(), // In cents
  minLevel: int("min_level").default(0),
  status: mysqlEnum("status", ["active", "inactive", "expired"]).default("active").notNull(),
  externalUrl: text("external_url"),
  cachedAt: timestamp("cached_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

/**
 * Withdrawal requests table - Withdrawal tracking
 */
export const withdrawalRequests = mysqlTable("withdrawal_requests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  amount: int("amount").notNull(), // In cents
  walletId: int("wallet_id").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "completed", "failed"]).default("pending").notNull(),
  transactionId: varchar("transaction_id", { length: 256 }),
  rejectionReason: text("rejection_reason"),
  approvedBy: int("approved_by"),
  approvedAt: timestamp("approved_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Level = typeof levels.$inferSelect;
export type InsertLevel = typeof levels.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

export type TaskAssignment = typeof taskAssignments.$inferSelect;
export type InsertTaskAssignment = typeof taskAssignments.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = typeof wallets.$inferInsert;

export type Loan = typeof loans.$inferSelect;
export type InsertLoan = typeof loans.$inferInsert;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

export type Dispute = typeof disputes.$inferSelect;
export type InsertDispute = typeof disputes.$inferInsert;

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = typeof supportTickets.$inferInsert;

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type InsertWithdrawalRequest = typeof withdrawalRequests.$inferInsert;
