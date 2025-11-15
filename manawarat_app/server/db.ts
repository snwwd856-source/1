import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  taskAssignments,
  tasks,
  transactions,
} from "../drizzle/schema";
import { ENV } from './_core/env';
import { 
  getDb as getSupabaseDb,
  getUserByUsername as getSupabaseUserByUsername,
  getUserByEmail as getSupabaseUserByEmail,
  getUserById as getSupabaseUserById,
  createUser as createSupabaseUser,
  updateUser as updateSupabaseUser,
  getUserByReferralCode as getSupabaseUserByReferralCode,
  getAllPendingUsers as getSupabaseAllPendingUsers,
  getAllUsers as getSupabaseAllUsers,
  approveTaskAssignment as supabaseApproveTaskAssignment
} from './supabaseDb';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  // Use Supabase if SUPABASE_URL is set, otherwise use MySQL
  if (ENV.supabaseUrl && ENV.supabaseUrl !== "") {
    return await getSupabaseDb();
  }
  
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function getUserByUsername(username: string) {
  // Use Supabase if SUPABASE_URL is set, otherwise use MySQL
  if (ENV.supabaseUrl && ENV.supabaseUrl !== "") {
    return await getSupabaseUserByUsername(username);
  }
  
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  // Use Supabase if SUPABASE_URL is set, otherwise use MySQL
  if (ENV.supabaseUrl && ENV.supabaseUrl !== "") {
    return await getSupabaseUserByEmail(email);
  }
  
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  // Use Supabase if SUPABASE_URL is set, otherwise use MySQL
  if (ENV.supabaseUrl && ENV.supabaseUrl !== "") {
    return await getSupabaseUserById(id);
  }
  
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUser(user: InsertUser): Promise<void> {
  // Use Supabase if SUPABASE_URL is set, otherwise use MySQL
  if (ENV.supabaseUrl && ENV.supabaseUrl !== "") {
    return await createSupabaseUser(user);
  }
  
  if (!user.username || !user.email) {
    throw new Error("Username and email are required for user creation");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create user: database not available");
    return;
  }

  try {
    await db.insert(users).values(user);
  } catch (error) {
    console.error("[Database] Failed to create user:", error);
    throw error;
  }
}

export async function updateUser(id: number, updates: Partial<InsertUser>): Promise<void> {
  // Use Supabase if SUPABASE_URL is set, otherwise use MySQL
  if (ENV.supabaseUrl && ENV.supabaseUrl !== "") {
    return await updateSupabaseUser(id, updates);
  }
  
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user: database not available");
    return;
  }

  try {
    await db.update(users).set(updates).where(eq(users.id, id));
  } catch (error) {
    console.error("[Database] Failed to update user:", error);
    throw error;
  }
}

export async function getUserByReferralCode(referralCode: string) {
  // Use Supabase if SUPABASE_URL is set, otherwise use MySQL
  if (ENV.supabaseUrl && ENV.supabaseUrl !== "") {
    return await getSupabaseUserByReferralCode(referralCode);
  }
  
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.referralCode, referralCode)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllPendingUsers() {
  // Use Supabase if SUPABASE_URL is set, otherwise use MySQL
  if (ENV.supabaseUrl && ENV.supabaseUrl !== "") {
    return await getSupabaseAllPendingUsers();
  }
  
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get users: database not available");
    return [];
  }

  return await db.select().from(users).where(eq(users.status, "pending_approval"));
}

export async function getAllUsers() {
  // Use Supabase if SUPABASE_URL is set, otherwise use MySQL
  if (ENV.supabaseUrl && ENV.supabaseUrl !== "") {
    return await getSupabaseAllUsers();
  }
  
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get users: database not available");
    return [];
  }

  return await db.select().from(users);
}

/**
 * Approve a task assignment proof. This will:
 * - set the assignment status to 'approved'
 * - record a credit transaction for the user
 * - increment user's balanceUsd and totalEarned
 * All amounts are stored in cents (integer)
 */
export async function approveTaskAssignment(assignmentId: number, adminId: number) {
  // Use Supabase if SUPABASE_URL is set, otherwise use MySQL
  if (ENV.supabaseUrl && ENV.supabaseUrl !== "") {
    return await supabaseApproveTaskAssignment(assignmentId, adminId);
  }
  
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Fetch assignment
  const assignmentRows = await db.select().from(taskAssignments).where(eq(taskAssignments.id, assignmentId)).limit(1);
  if (assignmentRows.length === 0) throw new Error("Assignment not found");
  const assignment = assignmentRows[0];

  // If already reviewed, skip
  if (assignment.status === "approved") {
    return { alreadyApproved: true };
  }

  // Fetch task to determine reward
  const taskRows = await db.select().from(tasks).where(eq(tasks.id, assignment.taskId)).limit(1);
  if (taskRows.length === 0) throw new Error("Task found for assignment");
  const task = taskRows[0];

  const rewardCents: number = Number(task.rewardUsd || 0);

  // Transactional update
  await db.transaction(async (tx) => {
    // Update assignment
    await tx
      .update(taskAssignments)
      .set({
        status: "approved",
        reviewedBy: adminId,
        reviewedAt: new Date(),
      })
      .where(eq(taskAssignments.id, assignmentId));

    // Insert transaction record
    await tx.insert(transactions).values({
      userId: assignment.userId,
      type: "credit",
      amountUsd: rewardCents,
      currency: "USD",
      status: "completed",
      relatedTaskId: assignment.taskId,
      metadata: { reason: "task_proof_approved", assignmentId },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Update user balances
    // Use raw SQL to increment integers reliably
    await tx.execute(sql`UPDATE users SET balance_usd = balance_usd + ${rewardCents}, total_earned = total_earned + ${rewardCents} WHERE id = ${assignment.userId}`);
  });

  return { success: true };
}