import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: true,
  },
});

// Helper function to get the current user
export async function getCurrentUser() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Helper function to get user profile
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return data;
}
