import { drizzle } from "drizzle-orm/mysql2";
import bcrypt from "bcrypt";
import { users, levels, wallets } from "./drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Create default levels according to requirements
    // Level 0: $0 upgrade, 15% earning, $10 min withdrawal
    // Level 1: $50 upgrade, 30% earning, $50 min withdrawal
    // Level 2: $100 upgrade, 45% earning, $100 min withdrawal
    // Each level increases by 5% earning share
    console.log("📊 Creating default levels...");
    const levelData = [
      { id: 0, name: "Level 0", upgradePrice: 0, earningShare: 15, minimumWithdrawal: 1000, description: "Entry level - Can earn up to $9.90, minimum withdrawal $10" },
      { id: 1, name: "Level 1", upgradePrice: 5000, earningShare: 30, minimumWithdrawal: 5000, description: "Upgrade price $50 - Earn 30% of task value" },
      { id: 2, name: "Level 2", upgradePrice: 10000, earningShare: 45, minimumWithdrawal: 10000, description: "Upgrade price $100 - Earn 45% of task value" },
      { id: 3, name: "Level 3", upgradePrice: 15000, earningShare: 50, minimumWithdrawal: 15000, description: "Upgrade price $150 - Earn 50% of task value" },
      { id: 4, name: "Level 4", upgradePrice: 20000, earningShare: 55, minimumWithdrawal: 20000, description: "Upgrade price $200 - Earn 55% of task value" },
      { id: 5, name: "Level 5", upgradePrice: 25000, earningShare: 60, minimumWithdrawal: 25000, description: "Upgrade price $250 - Earn 60% of task value" },
      { id: 6, name: "Level 6", upgradePrice: 30000, earningShare: 65, minimumWithdrawal: 30000, description: "Upgrade price $300 - Earn 65% of task value" },
      { id: 7, name: "Level 7", upgradePrice: 35000, earningShare: 70, minimumWithdrawal: 35000, description: "Upgrade price $350 - Earn 70% of task value" },
      { id: 8, name: "Level 8", upgradePrice: 40000, earningShare: 75, minimumWithdrawal: 40000, description: "Upgrade price $400 - Earn 75% of task value" },
      { id: 9, name: "Level 9", upgradePrice: 45000, earningShare: 80, minimumWithdrawal: 45000, description: "Upgrade price $450 - Earn 80% of task value" },
    ];

    for (const level of levelData) {
      try {
        await db.insert(levels).values(level);
      } catch (e) {
        // Level might already exist
      }
    }
    console.log("✅ Levels created");

    // Create default wallets
    console.log("💰 Creating default wallets...");
    const walletData = [
      {
        chain: "TRC20",
        currency: "USDT",
        address: "TQCz2bqXoYWMU7D8qAEqXKwWtMLBFRpgcW",
        label: "Main USDT Wallet",
        isActive: true,
        createdBy: 1,
      },
      {
        chain: "TRC20",
        currency: "USDC",
        address: "TQCz2bqXoYWMU7D8qAEqXKwWtMLBFRpgcW",
        label: "Main USDC Wallet",
        isActive: true,
        createdBy: 1,
      },
    ];

    for (const wallet of walletData) {
      try {
        await db.insert(wallets).values(wallet);
      } catch (e) {
        // Wallet might already exist
      }
    }
    console.log("✅ Wallets created");

    // Create default admin user
    console.log("👤 Creating default admin user...");
    const adminPasswordHash = await bcrypt.hash("admin123", 10);
    const adminReferralCode = "REF-ADMIN-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
      await db.insert(users).values({
        username: "admin",
        email: "admin@promohive.com",
        passwordHash: adminPasswordHash,
        fullName: "Super Administrator",
        referralCode: adminReferralCode,
        status: "active",
        kycStatus: "approved",
        role: "super_admin",
        levelId: 9,
        balanceUsd: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        twoFactorEnabled: false,
        approvedBy: 1,
        approvedAt: new Date(),
        kycVerifiedAt: new Date(),
      });
      console.log("✅ Admin user created");
      console.log("   Username: admin");
      console.log("   Password: admin123");
      console.log("   Email: admin@promohive.com");
      console.log("   Role: super_admin");
    } catch (e) {
      console.log("ℹ️  Admin user already exists");
    }

    // Create demo users for testing
    console.log("👥 Creating demo users...");
    const demoUsers = [
      {
        username: "demo_user1",
        email: "user1@demo.com",
        fullName: "Demo User 1",
        levelId: 0,
        role: "user",
      },
      {
        username: "demo_user2",
        email: "user2@demo.com",
        fullName: "Demo User 2",
        levelId: 1,
        role: "user",
      },
    ];

    for (const demoUser of demoUsers) {
      try {
        const passwordHash = await bcrypt.hash("demo123", 10);
        const referralCode = `REF-${demoUser.username.toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        
        await db.insert(users).values({
          username: demoUser.username,
          email: demoUser.email,
          passwordHash: passwordHash,
          fullName: demoUser.fullName,
          referralCode: referralCode,
          status: "active",
          kycStatus: "approved",
          role: demoUser.role,
          levelId: demoUser.levelId,
          balanceUsd: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
          twoFactorEnabled: false,
          approvedBy: 1,
          approvedAt: new Date(),
        });
        console.log(`✅ Demo user created: ${demoUser.username} (password: demo123)`);
      } catch (e) {
        // User might already exist
      }
    }

    console.log("\n✨ Database seeding completed!");
    console.log("\n📝 Admin Credentials:");
    console.log("   Username: admin");
    console.log("   Password: admin123");
    console.log("   Email: admin@promohive.com");
    console.log("   Role: super_admin");
    console.log("\n📝 Demo User Credentials:");
    console.log("   Username: demo_user1 / demo_user2");
    console.log("   Password: demo123");
    console.log("   Email: user1@demo.com / user2@demo.com");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
