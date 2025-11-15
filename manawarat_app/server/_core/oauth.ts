import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sessionService } from "./sdk";
import bcrypt from "bcrypt";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

function generateReferralCode(username: string): string {
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `REF-${username.toUpperCase()}-${randomPart}`;
}

export function registerAuthRoutes(app: Express) {
  /**
   * Register a new user
   */
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { username, email, password, fullName } = req.body;

      if (!username || !email || !password) {
        res.status(400).json({ error: "Username, email, and password are required" });
        return;
      }

      // Check if user already exists
      const existingUser = await db.getUserByUsername(username);
      if (existingUser) {
        res.status(400).json({ error: "Username already taken" });
        return;
      }

      const existingEmail = await db.getUserByEmail(email);
      if (existingEmail) {
        res.status(400).json({ error: "Email already registered" });
        return;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);
      const referralCode = generateReferralCode(username);

      // Create user with pending approval status
      await db.createUser({
        username,
        email,
        passwordHash,
        fullName: fullName || null,
        referralCode,
        status: "pending_approval",
        kycStatus: "pending",
        role: "user",
        balanceUsd: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        twoFactorEnabled: false,
        levelId: 0,
      });

      res.status(201).json({ 
        message: "Registration successful. Awaiting admin approval.",
        username 
      });
    } catch (error) {
      console.error("[Auth] Registration failed", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  /**
   * Login with username/email and password
   */
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: "Username and password are required" });
        return;
      }

      // Find user by username or email
      let user = await db.getUserByUsername(username);
      if (!user) {
        user = await db.getUserByEmail(username);
      }

      if (!user) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      // Check if user is approved
      if (user.status === "pending_approval") {
        res.status(403).json({ error: "Account pending admin approval" });
        return;
      }

      if (user.status === "suspended" || user.status === "banned") {
        res.status(403).json({ error: "Account is suspended or banned" });
        return;
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      // Create session token
      const sessionToken = await sessionService.createSessionToken(
        user.id,
        user.username,
        { expiresInMs: ONE_YEAR_MS }
      );

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  /**
   * Logout
   */
  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.json({ message: "Logout successful" });
  });

  /**
   * Get current user
   */
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const user = await sessionService.authenticateRequest(req);
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        levelId: user.levelId,
        balanceUsd: user.balanceUsd,
        referralCode: user.referralCode,
      });
    } catch (error) {
      res.status(401).json({ error: "Unauthorized" });
    }
  });
}
