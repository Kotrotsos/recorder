import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Create a client for server-side usage in Pages Router
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
} 