import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Create a client for browser-side usage
export const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// For backward compatibility
export const createClient = () => supabase; 