import { supabase, supabaseAdmin } from './_core/supabaseClient';
import { InsertUser, User } from '../drizzle/schema';

let _db: typeof supabase | null = null;

// Lazily create the supabase instance
export async function getDb() {
  if (!_db) {
    _db = supabase;
  }
  return _db;
}

export async function getUserByUsername(username: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (error) {
    console.warn('[Database] Error fetching user by username:', error);
    return undefined;
  }

  return data;
}

export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    console.warn('[Database] Error fetching user by email:', error);
    return undefined;
  }

  return data;
}

export async function getUserById(id: number) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.warn('[Database] Error fetching user by id:', error);
    return undefined;
  }

  return data;
}

export async function createUser(user: InsertUser): Promise<void> {
  if (!user.username || !user.email) {
    throw new Error('Username and email are required for user creation');
  }

  const { error } = await supabase
    .from('users')
    .insert(user);

  if (error) {
    console.error('[Database] Failed to create user:', error);
    throw error;
  }
}

export async function updateUser(id: number, updates: Partial<InsertUser>): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('[Database] Failed to update user:', error);
    throw error;
  }
}

export async function getUserByReferralCode(referralCode: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('referral_code', referralCode)
    .single();

  if (error) {
    console.warn('[Database] Error fetching user by referral code:', error);
    return undefined;
  }

  return data;
}

export async function getAllPendingUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('status', 'pending_approval');

  if (error) {
    console.warn('[Database] Error fetching pending users:', error);
    return [];
  }

  return data || [];
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*');

  if (error) {
    console.warn('[Database] Error fetching all users:', error);
    return [];
  }

  return data || [];
}

/**
 * Approve a task assignment proof. This will:
 * - set the assignment status to 'approved'
 * - record a credit transaction for the user
 * - increment user's balanceUsd and totalEarned
 * All amounts are stored in cents (integer)
 */
export async function approveTaskAssignment(assignmentId: number, adminId: number) {
  // Fetch assignment
  const { data: assignmentData, error: assignmentError } = await supabase
    .from('task_assignments')
    .select('*')
    .eq('id', assignmentId)
    .single();

  if (assignmentError) throw new Error('Assignment not found');
  const assignment = assignmentData;

  // If already reviewed, skip
  if (assignment.status === 'approved') {
    return { alreadyApproved: true };
  }

  // Fetch task to determine reward
  const { data: taskData, error: taskError } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', assignment.task_id)
    .single();

  if (taskError) throw new Error('Task not found for assignment');
  const task = taskData;

  const rewardCents: number = Number(task.reward_usd || 0);

  // Start a transaction (Supabase doesn't support transactions in the same way,
  // so we'll handle this with careful error handling)
  try {
    // Update assignment
    const { error: updateError } = await supabase
      .from('task_assignments')
      .update({
        status: 'approved',
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', assignmentId);

    if (updateError) throw updateError;

    // Insert transaction record
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: assignment.user_id,
        type: 'credit',
        amount_usd: rewardCents,
        currency: 'USD',
        status: 'completed',
        related_task_id: assignment.task_id,
        metadata: { reason: 'task_proof_approved', assignmentId },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (transactionError) throw transactionError;

    // Update user balances
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('balance_usd, total_earned')
      .eq('id', assignment.user_id)
      .single();

    if (userError) throw userError;

    const { error: updateUserError } = await supabase
      .from('users')
      .update({
        balance_usd: userData.balance_usd + rewardCents,
        total_earned: userData.total_earned + rewardCents,
      })
      .eq('id', assignment.user_id);

    if (updateUserError) throw updateUserError;

    return { success: true };
  } catch (error) {
    console.error('[Database] Failed to approve task assignment:', error);
    throw error;
  }
}