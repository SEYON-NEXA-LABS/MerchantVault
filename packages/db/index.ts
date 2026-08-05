import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Warning: Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) are not defined.");
}

const fallbackUrl = "https://placeholder.supabase.co";
const fallbackKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder";

const activeUrl = (supabaseUrl && supabaseUrl.startsWith("http")) ? supabaseUrl : fallbackUrl;
const activeServiceKey = (supabaseServiceKey && supabaseServiceKey !== "your_supabase_service_role_key_here") ? supabaseServiceKey : (supabaseAnonKey || fallbackKey);

export const supabaseAdmin = createClient(activeUrl, activeServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

export const supabase = supabaseAdmin;

