import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;
let supabaseAdminInstance: SupabaseClient | null = null;

export function getSupabaseServer() {
  if (!supabaseInstance) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      const missing = [
        ...(!supabaseUrl ? ['VITE_SUPABASE_URL'] : []),
        ...(!supabaseAnonKey ? ['VITE_SUPABASE_ANON_KEY'] : []),
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
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      const missing = [
        ...(!supabaseUrl ? ['VITE_SUPABASE_URL'] : []),
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
