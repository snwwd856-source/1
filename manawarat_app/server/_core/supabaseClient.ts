import { createClient } from '@supabase/supabase-js';
import { ENV } from './env';

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  ENV.supabaseUrl,
  ENV.supabaseAnonKey
);

// Create a supabase admin client for server-side operations
export const supabaseAdmin = createClient(
  ENV.supabaseUrl,
  ENV.supabaseServiceKey
);