import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Transaction {
  id?: string;
  amount: number;
  merchant: string;
  date: string;
  location?: string;
  [key: string]: any;
}

interface AnalysisResult {
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { transactions, userId } = await req.json();

    if (
      !transactions ||
      !Array.isArray(transactions) ||
      transactions.length === 0
    ) {
      throw new Error("Valid transactions array is required");
    }

    // Analyze the transactions
    const result = analyzeTransactions(transactions);

    // Store the fraudulent transactions in the database if userId is provided
    if (userId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
      const supabaseServiceKey =
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      for (const fraud of result.detectedFrauds) {
        const { error } = await supabase.from("transactions").insert({
          user_id: userId,
          amount: fraud.amount,
          merchant: fraud.merchant,
          date: fraud.date,
          location: "Unknown",
          is_fraudulent: true,
          risk_score: 75,
          category: "Unknown",
        });

        if (error) {
          console.error("Error storing fraudulent transaction:", error);
        }
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

function analyzeTransactions(transactions: Transaction[]): AnalysisResult {
  const totalTransactions = transactions.length;
  const detectedFrauds: {
    id: string;
    amount: number;
    merchant: string;
    date: string;
    reason: string;
  }[] = [];

  for (const transaction of transactions) {
    const amount =
      typeof transaction.amount === "string"
        ? parseFloat(transaction.amount)
        : transaction.amount;

    const merchant = transaction.merchant || "Unknown";
    const date = transaction.date || new Date().toISOString().split("T")[0];
    const location = transaction.location || "Unknown";
    const id = transaction.id || `TX-${Math.floor(Math.random() * 10000000)}`;

    // Apply fraud detection rules
    let isFraudulent = false;
    let reason = "";

    // Rule 1: Unusually high amount (over $5000)
    if (amount > 5000) {
      isFraudulent = true;
      reason = "Unusually high transaction amount";
    }

    // Rule 2: Suspicious merchant keywords
    const suspiciousKeywords = [
      "unknown",
      "international",
      "foreign",
      "unverified",
    ];
    if (
      suspiciousKeywords.some((keyword) =>
        merchant.toLowerCase().includes(keyword),
      )
    ) {
      isFraudulent = true;
      reason = reason || "Transaction with suspicious merchant";
    }

    // Rule 3: Suspicious locations
    const suspiciousLocations = ["international", "foreign", "unknown"];
    if (
      suspiciousLocations.some((loc) => location.toLowerCase().includes(loc))
    ) {
      isFraudulent = true;
      reason = reason || "Transaction from suspicious location";
    }

    // Add to detected frauds if any rule was triggered
    if (isFraudulent) {
      detectedFrauds.push({
        id,
        amount,
        merchant,
        date,
        reason,
      });
    }
  }

  const fraudulentTransactions = detectedFrauds.length;
  const safeTransactions = totalTransactions - fraudulentTransactions;
  const fraudPercentage = (fraudulentTransactions / totalTransactions) * 100;

  return {
    totalTransactions,
    fraudulentTransactions,
    safeTransactions,
    fraudPercentage,
    detectedFrauds,
  };
}
