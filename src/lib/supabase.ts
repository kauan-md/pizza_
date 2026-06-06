import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseInstance) {
    const supabaseUrl =
      import.meta.env.VITE_SUPABASE_URL ||
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_URL ||
      'https://yonaaysrkrvfxhxbhaay.supabase.co';
    const supabaseAnonKey =
      import.meta.env.VITE_SUPABASE_ANON_KEY ||
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvbmFheXNya3J2ZnhoeGJoYWF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1Mzc4NjQsImV4cCI6MjA5NjExMzg2NH0.i5X_utvxPVMDNJH-FIdXiCeTxzpdmnTSMCRBb6UeGzg';

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}
