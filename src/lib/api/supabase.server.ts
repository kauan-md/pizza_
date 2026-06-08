import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;
let supabaseAdminInstance: SupabaseClient | null = null;

export function getSupabaseServer() {
  if (!supabaseInstance) {
    const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const supabaseAnonKey = import.meta.env.NEXT_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      const missing = [
        ...(!supabaseUrl ? ['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'] : []),
        ...(!supabaseAnonKey ? ['NEXT_SUPABASE_ANON_KEY'] : []),
      ];
      console.error(`[supabase.server] Missing environment variables: ${missing.join(', ')}`);
      throw new Error(`Missing Supabase environment variable(s): ${missing.join(', ')}.`);
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseInstance;
}

export function getSupabaseAdmin() {
  if (!supabaseAdminInstance) {
    const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      const missing = [
        ...(!supabaseUrl ? ['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'] : []),
        ...(!serviceRoleKey ? ['VITE_SUPABASE_SERVICE_ROLE_KEY'] : []),
      ];
      console.error(`[supabase.server] Missing environment variables: ${missing.join(', ')}`);
      throw new Error(`Missing Supabase environment variable(s): ${missing.join(', ')}.`);
    }

    supabaseAdminInstance = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseAdminInstance;
}

export { type SupabaseClient };
