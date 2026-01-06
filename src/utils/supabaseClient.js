import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("Supabase Config Check:");
console.log("URL:", supabaseUrl ? "Found" : "Missing", supabaseUrl);
console.log("Key:", supabaseAnonKey ? "Found" : "Missing", supabaseAnonKey ? supabaseAnonKey.substring(0, 10) + "..." : "");

export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

if (!supabase) {
    console.error("Supabase client failed to initialize. Missing credentials.");
}

export const isSupabaseConfigured = () => !!supabase;
