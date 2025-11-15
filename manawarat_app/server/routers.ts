import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb, approveTaskAssignment, getUserById, updateUser, getAllUsers, getAllPendingUsers } from "./db";
import { 
  taskAssignments, 
  tasks, 
  users, 
  transactions, 
  wallets, 
  levels, 
  referrals, 
  auditLogs, 
  withdrawalRequests,
  kiwiwallOffers,
  notifications
} from "../drizzle/schema";
import { eq, and, or, like, desc, sql, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { rateLimitMiddleware, getClientIp, sanitizeInput, checkAdminPermission, validateAmount, validateUserId, validateNoSqlInjection } from "./_core/security";

// Admin procedure - only for admin users
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const adminRoles = ['super_admin', 'finance_admin', 'support_admin', 'content_admin'];
  const { user } = ctx;
  if (!user || !adminRoles.includes(user.role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// Helper function to create audit log with security
async function createAuditLog(
  adminId: number,
  action: string,
  targetType: string | null,
  targetId: number | null,
  metadata: Record<string, any> = {},
  ipAddress?: string,
  req?: any
) {
  const db = await getDb();
  if (!db) return;
  
  try {
    // Sanitize metadata to prevent injection
    const sanitizedMetadata = sanitizeInput(metadata);
    const clientIp = ipAddress || (req ? getClientIp(req) : null);
    
    await db.insert(auditLogs).values({
      adminId,
      action: sanitizeInput(action) as string,
      targetType: targetType ? sanitizeInput(targetType) as string : null,
      targetId,
      metadata: sanitizedMetadata,
      ipAddress: clientIp,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("[Audit] Failed to create audit log:", error);
  }
}

// Helper function to calculate referral rewards
async function processReferralReward(referredUserId: number, taskRewardCents: number) {
  const db = await getDb();
  if (!db) return;

  const referredUser = await getUserById(referredUserId);
  if (!referredUser || !referredUser.referrerId) return;

  const referrer = await getUserById(referredUser.referrerId);
  if (!referrer) return;

  // Get referrer's level to determine reward percentage
  const referrerLevel = await db.select().from(levels).where(eq(levels.id, referrer.levelId)).limit(1);
  const level = referrerLevel[0];
  
  if (!level) return;

  // Calculate reward based on level (Level 0: 15%, Level 1: 30%, etc.)
  const rewardPercentage = level.earningShare || 15;
  const rewardCents = Math.floor((taskRewardCents * rewardPercentage) / 100);

  if (rewardCents <= 0) return;

  // Create referral record
  await db.insert(referrals).values({
    referrerId: referrer.id,
    referredId: referredUserId,
    rewardAmount: rewardCents,
    rewardStatus: "pending",
    tier: 1,
    createdAt: new Date(),
  });

  // Credit referrer's balance
  await db.execute(
    sql`UPDATE users SET balance_usd = balance_usd + ${rewardCents}, total_earned = total_earned + ${rewardCents} WHERE id = ${referrer.id}`
  );

  // Update referral status
  await db
    .update(referrals)
    .set({ rewardStatus: "credited" })
    .where(and(
      eq(referrals.referrerId, referrer.id),
      eq(referrals.referredId, referredUserId)
    ));

  // Create transaction record
  await db.insert(transactions).values({
    userId: referrer.id,
    type: "referral_bonus",
    amountUsd: rewardCents,
    currency: "USD",
    status: "completed",
    metadata: { referredUserId, taskRewardCents },
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // User procedures
  user: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      // Return current user from context
      return ctx.user || null;
    }),

    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const updates: any = {};
        if (input.name) updates.fullName = input.name;
        if (input.phone) updates.phoneNumber = input.phone;

        await updateUser(ctx.user.id, updates);
        return { success: true };
      }),

    getReferralCode: protectedProcedure.query(async ({ ctx }) => {
      return { referralCode: ctx.user?.referralCode || null };
    }),

    getReferralStats: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.id) return { totalReferrals: 0, activeReferrals: 0, totalEarnings: 0 };
      
      const db = await getDb();
      if (!db) return { totalReferrals: 0, activeReferrals: 0, totalEarnings: 0 };

      const allReferrals = await db
        .select()
        .from(referrals)
        .where(eq(referrals.referrerId, ctx.user.id));

      const activeReferrals = await db
        .select()
        .from(users)
        .where(and(
          eq(users.referrerId, ctx.user.id),
          eq(users.status, "active")
        ));

      const totalEarnings = allReferrals
        .filter(r => r.rewardStatus === "credited")
        .reduce((sum, r) => sum + Number(r.rewardAmount), 0);

      return {
        totalReferrals: allReferrals.length,
        activeReferrals: activeReferrals.length,
        totalEarnings: totalEarnings / 100, // Convert cents to dollars
      };
    }),
  }),

  // Task procedures
  tasks: router({
    list: publicProcedure
      .input(z.object({
        status: z.enum(["active", "paused", "completed", "cancelled"]).optional(),
        type: z.enum(["survey", "marketing", "referral", "learning", "trading", "manual"]).optional(),
      }))
      .query(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) return [];

        const conditions: any[] = [];
        if (input.status) conditions.push(eq(tasks.status, input.status));
        if (input.type) conditions.push(eq(tasks.type, input.type));

        // Hide trading tasks from non-admin users
        if (!ctx.user || !['super_admin', 'finance_admin', 'support_admin', 'content_admin'].includes(ctx.user.role)) {
          conditions.push(sql`type != 'trading'`);
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
        const result = await db.select().from(tasks).where(whereClause).orderBy(desc(tasks.createdAt));
        return result;
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) return null;

        const result = await db.select().from(tasks).where(eq(tasks.id, input.id)).limit(1);
        const task = result[0];
        
        // Hide trading tasks from non-admin users
        if (task && task.type === "trading") {
          if (!ctx.user || !['super_admin', 'finance_admin', 'support_admin', 'content_admin'].includes(ctx.user.role)) {
            return null;
          }
        }

        return task || null;
      }),

    create: adminProcedure
      .input(z.object({
        title: z.string(),
        description: z.string(),
        type: z.enum(["survey", "marketing", "referral", "learning", "trading", "manual"]),
        rewardUsd: z.number(),
        eligibilityLevel: z.number().default(0),
        slots: z.number().optional(),
        timeLimitMinutes: z.number().optional(),
        proofType: z.enum(["image", "video", "link", "text"]).default("image"),
        repeatable: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const rewardCents = Math.floor(input.rewardUsd * 100);
        const result = await db.insert(tasks).values({
          title: input.title,
          description: input.description,
          type: input.type,
          rewardUsd: rewardCents,
          eligibilityLevel: input.eligibilityLevel,
          slots: input.slots || 100,
          activeSlots: 0,
          timeLimitMinutes: input.timeLimitMinutes || null,
          proofType: input.proofType,
          repeatable: input.repeatable,
          status: "active",
          createdBy: ctx.user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Security checks
        checkAdminPermission(ctx.user, "content_admin", "create_task");
        rateLimitMiddleware(ctx.user.id, getClientIp(ctx.req));
        if (input.title) validateNoSqlInjection(input.title);
        if (input.description) validateNoSqlInjection(input.description);
        
        await createAuditLog(ctx.user.id, "task_created", "task", null, { taskTitle: input.title }, undefined, ctx.req);
        
        return { success: true, id: Number(result[0]?.insertId) || 1 };
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().max(256).optional(),
        description: z.string().max(5000).optional(),
        status: z.enum(["active", "paused", "completed", "cancelled"]).optional(),
        rewardUsd: z.number().min(0).max(10000).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        // Security checks
        checkAdminPermission(ctx.user, "content_admin", "update_task");
        rateLimitMiddleware(ctx.user.id, getClientIp(ctx.req));
        if (input.title) validateNoSqlInjection(input.title);
        if (input.description) validateNoSqlInjection(input.description);
        
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const updates: any = {};
        if (input.title) updates.title = sanitizeInput(input.title);
        if (input.description) updates.description = sanitizeInput(input.description);
        if (input.status) updates.status = input.status;
        if (input.rewardUsd !== undefined) {
          validateAmount(input.rewardUsd, 0, 10000);
          updates.rewardUsd = Math.floor(input.rewardUsd * 100);
        }
        updates.updatedAt = new Date();

        await db.update(tasks).set(updates).where(eq(tasks.id, input.id));
        await createAuditLog(ctx.user.id, "task_updated", "task", input.id, updates, undefined, ctx.req);
        
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        // Security checks
        checkAdminPermission(ctx.user, "content_admin", "delete_task");
        rateLimitMiddleware(ctx.user.id, getClientIp(ctx.req));
        
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        await db.delete(tasks).where(eq(tasks.id, input.id));
        await createAuditLog(ctx.user.id, "task_deleted", "task", input.id, {}, undefined, ctx.req);
        
        return { success: true };
      }),
  }),

  // Task Assignment procedures
  taskAssignments: router({
    getUserTasks: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.id) return [];
      const db = await getDb();
      if (!db) return [];

      const result = await db
        .select()
        .from(taskAssignments)
        .where(eq(taskAssignments.userId, ctx.user.id))
        .orderBy(desc(taskAssignments.createdAt));
      
      return result;
    }),

    acceptTask: protectedProcedure
      .input(z.object({ taskId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        // Check if task exists and is available
        const taskResult = await db.select().from(tasks).where(eq(tasks.id, input.taskId)).limit(1);
        const task = taskResult[0];
        if (!task) throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
        if (task.status !== "active") throw new TRPCError({ code: "BAD_REQUEST", message: "Task is not active" });
        if (ctx.user.levelId < task.eligibilityLevel) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient level to accept this task" });
        }

        // Check if user already has this task
        const existing = await db
          .select()
          .from(taskAssignments)
          .where(and(
            eq(taskAssignments.userId, ctx.user.id),
            eq(taskAssignments.taskId, input.taskId)
          ))
          .limit(1);

        if (existing.length > 0 && !task.repeatable) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Task already accepted" });
        }

        // Create assignment
        await db.insert(taskAssignments).values({
          taskId: input.taskId,
          userId: ctx.user.id,
          status: "accepted",
          acceptedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Update task active slots
        await db.execute(
          sql`UPDATE tasks SET active_slots = active_slots + 1 WHERE id = ${input.taskId}`
        );

        return { success: true };
      }),

    submitProof: protectedProcedure
      .input(z.object({
        assignmentId: z.number(),
        proofUrl: z.string().optional(),
        proofText: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        // Verify assignment belongs to user
        const assignmentResult = await db
          .select()
          .from(taskAssignments)
          .where(and(
            eq(taskAssignments.id, input.assignmentId),
            eq(taskAssignments.userId, ctx.user.id)
          ))
          .limit(1);

        const assignment = assignmentResult[0];
        if (!assignment) throw new TRPCError({ code: "NOT_FOUND", message: "Assignment not found" });
        if (assignment.status !== "accepted" && assignment.status !== "in_progress") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid assignment status" });
        }

        // Update assignment with proof
        await db
          .update(taskAssignments)
          .set({
            status: "proof_pending",
            proofUrl: input.proofUrl || null,
            proofText: input.proofText || null,
            updatedAt: new Date(),
          })
          .where(eq(taskAssignments.id, input.assignmentId));

        return { success: true };
      }),

    reviewProof: adminProcedure
      .input(z.object({
        assignmentId: z.number(),
        approved: z.boolean(),
        rejectionReason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        const { assignmentId, approved, rejectionReason } = input;
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        if (approved) {
          try {
            await approveTaskAssignment(assignmentId, ctx.user.id);
            
            // Process referral reward
            const assignmentResult = await db
              .select()
              .from(taskAssignments)
              .where(eq(taskAssignments.id, assignmentId))
              .limit(1);
            const assignment = assignmentResult[0];
            if (assignment) {
              const taskResult = await db.select().from(tasks).where(eq(tasks.id, assignment.taskId)).limit(1);
              const task = taskResult[0];
              if (task) {
                await processReferralReward(assignment.userId, Number(task.rewardUsd));
              }
            }

            await createAuditLog(ctx.user.id, "proof_approved", "task_assignment", assignmentId);
            return { success: true };
          } catch (err: any) {
            console.error("Error approving assignment:", err);
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: err?.message || "Failed to approve" });
          }
        } else {
          try {
            await db
              .update(taskAssignments)
              .set({ 
                status: "rejected", 
                rejectionReason: rejectionReason || null, 
                reviewedBy: ctx.user.id,
                reviewedAt: new Date(),
                updatedAt: new Date(),
              })
              .where(eq(taskAssignments.id, assignmentId));
            
            await createAuditLog(ctx.user.id, "proof_rejected", "task_assignment", assignmentId, { reason: rejectionReason });
            return { success: true };
          } catch (err: any) {
            console.error("Error rejecting assignment:", err);
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: err?.message || "Failed to reject" });
          }
        }
      }),

    getPendingProofs: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];

      const result = await db
        .select()
        .from(taskAssignments)
        .where(eq(taskAssignments.status, "proof_pending"))
        .orderBy(desc(taskAssignments.createdAt));
      
      return result;
    }),
  }),

  // Transaction procedures
  transactions: router({
    getHistory: protectedProcedure
      .input(z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user?.id) return { transactions: [], total: 0 };
        const db = await getDb();
        if (!db) return { transactions: [], total: 0 };

        const result = await db
          .select()
          .from(transactions)
          .where(eq(transactions.userId, ctx.user.id))
          .orderBy(desc(transactions.createdAt))
          .limit(input.limit)
          .offset(input.offset);

        const totalResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(transactions)
          .where(eq(transactions.userId, ctx.user.id));

        return { 
          transactions: result, 
          total: Number(totalResult[0]?.count || 0) 
        };
      }),

    requestWithdrawal: protectedProcedure
      .input(z.object({
        amountUsd: z.number(),
        walletId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const amountCents = Math.floor(input.amountUsd * 100);
        const user = await getUserById(ctx.user.id);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        // Check balance
        if (user.balanceUsd < amountCents) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient balance" });
        }

        // Get user's level to check minimum withdrawal
        const levelResult = await db.select().from(levels).where(eq(levels.id, user.levelId)).limit(1);
        const level = levelResult[0];
        if (level && amountCents < level.minimumWithdrawal) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: `Minimum withdrawal is $${(level.minimumWithdrawal / 100).toFixed(2)}` 
          });
        }

        // Verify wallet exists
        const walletResult = await db.select().from(wallets).where(eq(wallets.id, input.walletId)).limit(1);
        if (!walletResult[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Wallet not found" });
        }

        // Create withdrawal request
        const result = await db.insert(withdrawalRequests).values({
          userId: ctx.user.id,
          amount: amountCents,
          walletId: input.walletId,
          status: "pending",
          createdAt: new Date(),
        });

        // Create transaction record
        await db.insert(transactions).values({
          userId: ctx.user.id,
          type: "withdrawal",
          amountUsd: amountCents,
          currency: "USD",
          status: "pending",
          walletId: input.walletId,
          metadata: { withdrawalRequestId: Number(result[0]?.insertId) },
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return { success: true, txId: Number(result[0]?.insertId) || 0 };
      }),

    approveWithdrawal: adminProcedure
      .input(z.object({
        requestId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const requestResult = await db
          .select()
          .from(withdrawalRequests)
          .where(eq(withdrawalRequests.id, input.requestId))
          .limit(1);
        
        const request = requestResult[0];
        if (!request) throw new TRPCError({ code: "NOT_FOUND", message: "Withdrawal request not found" });
        if (request.status !== "pending") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Request already processed" });
        }

        // Update withdrawal request
        await db
          .update(withdrawalRequests)
          .set({
            status: "approved",
            approvedBy: ctx.user.id,
            approvedAt: new Date(),
          })
          .where(eq(withdrawalRequests.id, input.requestId));

        // Update transaction
        await db
          .update(transactions)
          .set({
            status: "completed",
            updatedAt: new Date(),
          })
          .where(and(
            eq(transactions.userId, request.userId),
            eq(transactions.type, "withdrawal"),
            eq(transactions.status, "pending")
          ));

        // Deduct from user balance
        await db.execute(
          sql`UPDATE users SET balance_usd = balance_usd - ${request.amount}, total_withdrawn = total_withdrawn + ${request.amount} WHERE id = ${request.userId}`
        );

        await createAuditLog(ctx.user.id, "withdrawal_approved", "withdrawal_request", input.requestId);
        return { success: true };
      }),

    denyWithdrawal: adminProcedure
      .input(z.object({
        requestId: z.number(),
        reason: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        await db
          .update(withdrawalRequests)
          .set({
            status: "rejected",
            rejectionReason: input.reason,
            approvedBy: ctx.user.id,
            approvedAt: new Date(),
          })
          .where(eq(withdrawalRequests.id, input.requestId));

        // Update transaction
        await db
          .update(transactions)
          .set({
            status: "failed",
            updatedAt: new Date(),
          })
          .where(and(
            eq(transactions.type, "withdrawal"),
            eq(transactions.status, "pending")
          ));

        await createAuditLog(ctx.user.id, "withdrawal_rejected", "withdrawal_request", input.requestId, { reason: input.reason });
        return { success: true };
      }),

    approveDeposit: adminProcedure
      .input(z.object({
        userId: z.number(),
        amountUsd: z.number(),
        transactionId: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const amountCents = Math.floor(input.amountUsd * 100);

        // Create transaction
        await db.insert(transactions).values({
          userId: input.userId,
          type: "deposit",
          amountUsd: amountCents,
          currency: "USD",
          status: "completed",
          transactionId: input.transactionId || null,
          metadata: { approvedBy: ctx.user.id },
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Credit user balance
        await db.execute(
          sql`UPDATE users SET balance_usd = balance_usd + ${amountCents} WHERE id = ${input.userId}`
        );

        await createAuditLog(ctx.user.id, "deposit_approved", "user", input.userId, { amount: amountCents });
        return { success: true };
      }),
  }),

  // Wallet procedures
  wallets: router({
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(wallets).orderBy(desc(wallets.createdAt));
    }),

    create: adminProcedure
      .input(z.object({
        chain: z.string(),
        currency: z.string(),
        address: z.string(),
        label: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const result = await db.insert(wallets).values({
          chain: input.chain,
          currency: input.currency,
          address: input.address,
          label: input.label || null,
          isActive: true,
          createdBy: ctx.user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await createAuditLog(ctx.user.id, "wallet_created", "wallet", null, { chain: input.chain, currency: input.currency });
        return { success: true, id: Number(result[0]?.insertId) || 1 };
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        active: z.boolean().optional(),
        label: z.string().optional(),
        address: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const updates: any = {};
        if (input.active !== undefined) updates.isActive = input.active;
        if (input.label !== undefined) updates.label = input.label;
        if (input.address !== undefined) updates.address = input.address;
        updates.updatedAt = new Date();

        await db.update(wallets).set(updates).where(eq(wallets.id, input.id));
        await createAuditLog(ctx.user.id, "wallet_updated", "wallet", input.id, updates);
        
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        await db.delete(wallets).where(eq(wallets.id, input.id));
        await createAuditLog(ctx.user.id, "wallet_deleted", "wallet", input.id);
        
        return { success: true };
      }),
  }),

  // Level procedures
  levels: router({
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(levels).orderBy(levels.id);
    }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        upgradePrice: z.number().optional(),
        earningShare: z.number().optional(),
        withdrawMin: z.number().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const updates: any = {};
        if (input.upgradePrice !== undefined) updates.upgradePrice = Math.floor(input.upgradePrice * 100);
        if (input.earningShare !== undefined) updates.earningShare = input.earningShare;
        if (input.withdrawMin !== undefined) updates.minimumWithdrawal = Math.floor(input.withdrawMin * 100);
        if (input.name !== undefined) updates.name = input.name;
        if (input.description !== undefined) updates.description = input.description;
        updates.updatedAt = new Date();

        await db.update(levels).set(updates).where(eq(levels.id, input.id));
        await createAuditLog(ctx.user.id, "level_updated", "level", input.id, updates);
        
        return { success: true };
      }),
  }),

  // Admin procedures
  admin: router({
    getDashboardStats: adminProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return {
        totalUsers: 0,
        activeTasks: 0,
        pendingProofs: 0,
        platformRevenue: 0,
        pendingWithdrawals: 0,
        pendingUsers: 0,
      };

      const [totalUsersResult, activeTasksResult, pendingProofsResult, pendingWithdrawalsResult, pendingUsersResult] = await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(users),
        db.select({ count: sql<number>`count(*)` }).from(tasks).where(eq(tasks.status, "active")),
        db.select({ count: sql<number>`count(*)` }).from(taskAssignments).where(eq(taskAssignments.status, "proof_pending")),
        db.select({ count: sql<number>`count(*)` }).from(withdrawalRequests).where(eq(withdrawalRequests.status, "pending")),
        db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.status, "pending_approval")),
      ]);

      // Calculate platform revenue (sum of all completed transactions)
      const revenueResult = await db
        .select({ total: sql<number>`sum(amount_usd)` })
        .from(transactions)
        .where(and(
          eq(transactions.status, "completed"),
          sql`type IN ('deposit', 'level_upgrade')`
        ));

      return {
        totalUsers: Number(totalUsersResult[0]?.count || 0),
        activeTasks: Number(activeTasksResult[0]?.count || 0),
        pendingProofs: Number(pendingProofsResult[0]?.count || 0),
        platformRevenue: Number(revenueResult[0]?.total || 0) / 100,
        pendingWithdrawals: Number(pendingWithdrawalsResult[0]?.count || 0),
        pendingUsers: Number(pendingUsersResult[0]?.count || 0),
      };
    }),

    listUsers: adminProcedure
      .input(z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
        search: z.string().optional(),
        status: z.enum(["pending_approval", "active", "suspended", "banned"]).optional(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return { users: [], total: 0 };

        const conditions: any[] = [];
        if (input.status) conditions.push(eq(users.status, input.status));
        if (input.search) {
          conditions.push(
            or(
              like(users.username, `%${input.search}%`),
              like(users.email, `%${input.search}%`),
              like(users.fullName, `%${input.search}%`)
            )
          );
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
        const result = await db
          .select()
          .from(users)
          .where(whereClause)
          .orderBy(desc(users.createdAt))
          .limit(input.limit)
          .offset(input.offset);

        const totalResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(users)
          .where(whereClause);

        return { 
          users: result, 
          total: Number(totalResult[0]?.count || 0) 
        };
      }),

    approveUser: adminProcedure
      .input(z.object({
        userId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        // Security checks
        checkAdminPermission(ctx.user, "support_admin", "approve_user");
        rateLimitMiddleware(ctx.user.id, getClientIp(ctx.req));
        validateUserId(input.userId, ctx.user);
        
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        await db
          .update(users)
          .set({
            status: "active",
            approvedBy: ctx.user.id,
            approvedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(users.id, input.userId));

        await createAuditLog(ctx.user.id, "user_approved", "user", input.userId, {}, undefined, ctx.req);
        return { success: true };
      }),

    rejectUser: adminProcedure
      .input(z.object({
        userId: z.number(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        await db
          .update(users)
          .set({
            status: "banned",
            approvedBy: ctx.user.id,
            approvedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(users.id, input.userId));

        await createAuditLog(ctx.user.id, "user_rejected", "user", input.userId, { reason: input.reason });
        return { success: true };
      }),

    updateUserLevel: adminProcedure
      .input(z.object({
        userId: z.number(),
        levelId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        await updateUser(input.userId, { levelId: input.levelId });
        await createAuditLog(ctx.user.id, "user_level_updated", "user", input.userId, { levelId: input.levelId });
        
        return { success: true };
      }),

    creditUserBalance: adminProcedure
      .input(z.object({
        userId: z.number(),
        amountUsd: z.number().min(0).max(100000),
        reason: z.string().max(500),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        // Security checks
        checkAdminPermission(ctx.user, "finance_admin", "credit_balance");
        rateLimitMiddleware(ctx.user.id, getClientIp(ctx.req));
        validateAmount(input.amountUsd, 0, 100000);
        validateNoSqlInjection(input.reason);
        
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const amountCents = Math.floor(input.amountUsd * 100);

        // Create transaction
        await db.insert(transactions).values({
          userId: input.userId,
          type: "credit",
          amountUsd: amountCents,
          currency: "USD",
          status: "completed",
          metadata: { reason: input.reason, adminId: ctx.user.id },
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Credit user balance
        await db.execute(
          sql`UPDATE users SET balance_usd = balance_usd + ${amountCents}, total_earned = total_earned + ${amountCents} WHERE id = ${input.userId}`
        );

        await createAuditLog(ctx.user.id, "balance_credited", "user", input.userId, { amount: amountCents, reason: input.reason }, undefined, ctx.req);
        return { success: true };
      }),

    debitUserBalance: adminProcedure
      .input(z.object({
        userId: z.number(),
        amountUsd: z.number(),
        reason: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const amountCents = Math.floor(input.amountUsd * 100);
        const user = await getUserById(input.userId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        if (user.balanceUsd < amountCents) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient balance" });
        }

        // Create transaction
        await db.insert(transactions).values({
          userId: input.userId,
          type: "debit",
          amountUsd: amountCents,
          currency: "USD",
          status: "completed",
          metadata: { reason: input.reason, adminId: ctx.user.id },
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Debit user balance
        await db.execute(
          sql`UPDATE users SET balance_usd = balance_usd - ${amountCents} WHERE id = ${input.userId}`
        );

        await createAuditLog(ctx.user.id, "balance_debited", "user", input.userId, { amount: amountCents, reason: input.reason });
        return { success: true };
      }),

    updateUserRole: adminProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["user", "super_admin", "finance_admin", "support_admin", "content_admin"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        // Only super_admin can change roles
        if (ctx.user.role !== "super_admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only super admin can change user roles" });
        }
        
        // Security checks
        rateLimitMiddleware(ctx.user.id, getClientIp(ctx.req));
        validateUserId(input.userId, ctx.user);
        
        // Prevent self-demotion
        if (input.userId === ctx.user.id && input.role !== "super_admin") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot change your own role" });
        }
        
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        await updateUser(input.userId, { role: input.role });
        await createAuditLog(ctx.user.id, "user_role_updated", "user", input.userId, { role: input.role }, undefined, ctx.req);
        
        return { success: true };
      }),

    getAuditLogs: adminProcedure
      .input(z.object({
        limit: z.number().default(100),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return { logs: [], total: 0 };

        const result = await db
          .select()
          .from(auditLogs)
          .orderBy(desc(auditLogs.createdAt))
          .limit(input.limit)
          .offset(input.offset);

        const totalResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(auditLogs);

        return { 
          logs: result, 
          total: Number(totalResult[0]?.count || 0) 
        };
      }),

    getPendingWithdrawals: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(withdrawalRequests)
        .where(eq(withdrawalRequests.status, "pending"))
        .orderBy(desc(withdrawalRequests.createdAt));
    }),
  }),

  // Kiwiwall procedures
  kiwiwall: router({
    getOffers: publicProcedure
      .input(z.object({
        country: z.string().optional(),
        category: z.string().optional(),
      }))
      .query(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) return { offers: [] };

        // Get cached offers from database
        const conditions: any[] = [eq(kiwiwallOffers.status, "active")];
        if (input.country) {
          // Note: You may need to add country field to kiwiwallOffers table
        }

        const cachedOffers = await db
          .select()
          .from(kiwiwallOffers)
          .where(and(...conditions))
          .orderBy(desc(kiwiwallOffers.cachedAt));

        // If no cached offers or cache is old, fetch from Kiwiwall API
        // TODO: Implement actual Kiwiwall API integration
        // For now, return cached offers

        // Filter by user level
        const userLevel = ctx.user?.levelId || 0;
        const filteredOffers = cachedOffers.filter(offer => {
          const minLevel = offer.minLevel || 0;
          return userLevel >= minLevel;
        });

        return { offers: filteredOffers };
      }),

    trackCompletion: protectedProcedure
      .input(z.object({
        offerId: z.string(),
        earnedAmount: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const user = await getUserById(ctx.user.id);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        // Get user's level to determine reward percentage
        const levelResult = await db.select().from(levels).where(eq(levels.id, user.levelId)).limit(1);
        const level = levelResult[0];
        
        // Calculate reward: Level 0 = 10%, Level 1+ = up to 70%
        const basePercentage = level ? level.earningShare : 10;
        const rewardPercentage = Math.min(basePercentage, 70);
        const rewardCents = Math.floor((input.earnedAmount * 100 * rewardPercentage) / 100);

        // Create transaction
        await db.insert(transactions).values({
          userId: ctx.user.id,
          type: "credit",
          amountUsd: rewardCents,
          currency: "USD",
          status: "completed",
          metadata: { 
            source: "kiwiwall", 
            offerId: input.offerId,
            originalAmount: input.earnedAmount,
            rewardPercentage 
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Credit user balance
        await db.execute(
          sql`UPDATE users SET balance_usd = balance_usd + ${rewardCents}, total_earned = total_earned + ${rewardCents} WHERE id = ${ctx.user.id}`
        );

        // Process referral reward if applicable
        await processReferralReward(ctx.user.id, rewardCents);

        return { success: true, rewardAmount: rewardCents / 100 };
      }),
  }),
});

export type AppRouter = typeof appRouter;
