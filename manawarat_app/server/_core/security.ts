import { TRPCError } from "@trpc/server";
import type { TrpcContext } from "./context";

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute

/**
 * Get client IP address from request
 */
export function getClientIp(req: any): string {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

/**
 * Rate limiting middleware
 */
export function rateLimitMiddleware(userId?: number, ip?: string) {
  const key = userId ? `user:${userId}` : `ip:${ip}`;
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Rate limit exceeded. Please try again later.",
    });
  }

  record.count++;
  rateLimitStore.set(key, record);
}

/**
 * Clean up old rate limit records
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

/**
 * Validate input to prevent injection attacks
 */
export function sanitizeInput(input: any): any {
  if (typeof input === "string") {
    // Remove potentially dangerous characters
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .trim();
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  if (input && typeof input === "object") {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  return input;
}

/**
 * Validate admin permissions for specific actions
 */
export function checkAdminPermission(
  user: TrpcContext["user"],
  requiredRole: "super_admin" | "finance_admin" | "support_admin" | "content_admin",
  action: string
): void {
  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Authentication required" });
  }

  const roleHierarchy: Record<string, number> = {
    content_admin: 1,
    support_admin: 2,
    finance_admin: 3,
    super_admin: 4,
  };

  const userLevel = roleHierarchy[user.role] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;

  // Super admin has access to everything
  if (user.role === "super_admin") {
    return;
  }

  // Check if user has required role or higher
  if (userLevel < requiredLevel) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Insufficient permissions. ${action} requires ${requiredRole} role.`,
    });
  }

  // Role-specific permission checks
  if (user.role === "finance_admin" && !action.includes("transaction") && !action.includes("withdrawal") && !action.includes("deposit") && !action.includes("balance")) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Finance admin can only manage financial transactions",
    });
  }

  if (user.role === "support_admin" && !action.includes("task") && !action.includes("proof") && !action.includes("user") && action !== "view") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Support admin can only manage tasks and proofs",
    });
  }

  if (user.role === "content_admin" && !action.includes("task") && action !== "view") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Content admin can only manage tasks",
    });
  }
}

/**
 * Validate amount to prevent negative or invalid values
 */
export function validateAmount(amount: number, min: number = 0, max: number = 1000000): void {
  if (isNaN(amount) || !isFinite(amount)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid amount" });
  }
  if (amount < min) {
    throw new TRPCError({ code: "BAD_REQUEST", message: `Amount must be at least ${min}` });
  }
  if (amount > max) {
    throw new TRPCError({ code: "BAD_REQUEST", message: `Amount cannot exceed ${max}` });
  }
}

/**
 * Validate user ID to prevent unauthorized access
 */
export function validateUserId(userId: number, currentUser: TrpcContext["user"]): void {
  if (!currentUser) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Authentication required" });
  }

  // Users can only access their own data unless they're admin
  if (currentUser.id !== userId && !["super_admin", "finance_admin", "support_admin"].includes(currentUser.role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
  }
}

/**
 * SQL injection prevention - validate input doesn't contain SQL keywords
 */
export function validateNoSqlInjection(input: string): void {
  const sqlKeywords = [
    "SELECT", "INSERT", "UPDATE", "DELETE", "DROP", "CREATE", "ALTER",
    "EXEC", "EXECUTE", "UNION", "SCRIPT", "--", "/*", "*/", ";",
  ];

  const upperInput = input.toUpperCase();
  for (const keyword of sqlKeywords) {
    if (upperInput.includes(keyword)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid input detected",
      });
    }
  }
}

