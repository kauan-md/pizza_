import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

function assertSupabaseEnv() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_PUBLISHABLE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const missing: string[] = [];

  if (!supabaseUrl) missing.push("VITE_SUPABASE_URL");
  if (!supabaseAnonKey) missing.push("VITE_SUPABASE_ANON_KEY");

  if (missing.length > 0) {
    const message = `Missing Supabase environment variable(s): ${missing.join(", ")}. Define them in your deployment environment.`;
    console.error(`[Supabase] ${message}`);
    throw new Error(message);
  }

  return { supabaseUrl, supabaseAnonKey };
}

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const { supabaseUrl, supabaseAnonKey } = assertSupabaseEnv();
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: typeof window !== "undefined" ? localStorage : undefined,
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return supabaseInstance;
}
