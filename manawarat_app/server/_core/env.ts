export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  supabaseUrl: process.env.SUPABASE_URL ?? "https://bxkhyxhnidisdwjlfzyl.supabase.co",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4a2h5eGhuaWRpc2R3amxmenlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNjQ4MTYsImV4cCI6MjA3ODc0MDgxNn0.VUJVK4245tTHAcvne191J_2_uAIUhG5bMKDIAzSX3Zg",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY ?? "sbp_v0_1c6c026724a84a9fc034a3dbf717557b4ebf0ae9",
};
