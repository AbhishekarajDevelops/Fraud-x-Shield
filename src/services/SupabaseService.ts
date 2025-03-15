import { supabase } from "@/lib/supabase";
import type { Tables } from "@/types/supabase";

export interface TransactionData {
  amount: number;
  merchant: string;
  date: string;
  time?: string;
  location?: string;
  cardType?: string;
  cardLastFour?: string;
  category?: string;
}

export interface TransactionResult {
  isFraudulent: boolean;
  riskScore: number;
  reasons: string[];
  result: "safe" | "suspicious";
  score: number;
}

export interface AnalysisResult {
  totalTransactions: number;
  fraudulentTransactions: number;
  safeTransactions: number;
  fraudPercentage: number;
  detectedFrauds: {
    id: string;
    amount: number;
    merchant: string;
    date: string;
    reason: string;
  }[];
}

export interface MLModelStats {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastTrained: string;
  totalSamples: number;
  fraudSamples: number;
}

export class SupabaseService {
  // User related functions
  async getCurrentUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return null;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  }

  async getUserProfile(userId: string) {
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

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Check if the error is due to email not being confirmed
      if (error.message.includes("Email not confirmed")) {
        // Send another confirmation email
        await this.resendConfirmationEmail(email);
        throw new Error(
          "Email not confirmed. We've sent a new confirmation email to your address.",
        );
      }
      throw error;
    }
    return data;
  }

  async resendConfirmationEmail(email: string) {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) throw error;
    return { success: true };
  }

  async register(name: string, email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) throw error;

    // Create user profile in public.users table
    if (data.user) {
      try {
        await supabase.from("users").insert({
          id: data.user.id,
          name,
          email,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        });
      } catch (insertError) {
        console.error("Error creating user profile:", insertError);
        // Continue even if profile creation fails - it might be handled by a trigger
      }
    }

    return data;
  }

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  // Transaction related functions
  async analyzeTransaction(
    transaction: TransactionData,
  ): Promise<TransactionResult> {
    try {
      const user = await this.getCurrentUser();
      const userId = user?.id;

      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-analyze-transaction",
        {
          body: { transaction, userId },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error analyzing transaction:", error);
      throw error;
    }
  }

  async getTransactionHistory(limit = 50) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  async getTransactionById(id: string) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) throw error;
    return data;
  }

  // CSV Analysis
  async analyzeCSV(transactions: any[]): Promise<AnalysisResult> {
    try {
      const user = await this.getCurrentUser();
      const userId = user?.id;

      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-analyze-csv",
        {
          body: { transactions, userId },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error analyzing CSV:", error);
      throw error;
    }
  }

  // ML Model Stats
  async getMLModelStats(): Promise<MLModelStats> {
    try {
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-get-ml-stats",
        {
          body: {},
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error getting ML model stats:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const supabaseService = new SupabaseService();
