import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client for all API routes and server components.
// Tables created via Prisma migrations have RLS disabled by default, so the
// anon key has full read/write access. If you enable RLS on any table, add
// SUPABASE_SERVICE_ROLE_KEY to your env and use it here instead.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);
