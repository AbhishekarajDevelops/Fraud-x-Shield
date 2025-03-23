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

/**
 * Analyze transactions using a neural network model
 * This is a placeholder that would call the Python neural network in a production environment
 * For now, it simulates neural network behavior with more sophisticated logic
 */
function analyzeTransactions(transactions: Transaction[]): AnalysisResult {
  const totalTransactions = transactions.length;
  const detectedFrauds: {
    id: string;
    amount: number;
    merchant: string;
    date: string;
    reason: string;
  }[] = [];

  // Process in batches to avoid memory issues
  const batchSize = 1000;
  const batches = Math.ceil(transactions.length / batchSize);

  // In a production environment, we would call the Python neural network here
  // For now, we'll simulate neural network behavior with more sophisticated logic
  for (let b = 0; b < batches; b++) {
    const start = b * batchSize;
    const end = Math.min(start + batchSize, transactions.length);

    for (let i = start; i < end; i++) {
      const transaction = transactions[i];
      const amount =
        typeof transaction.amount === "string"
          ? parseFloat(transaction.amount)
          : transaction.amount;
      const merchant = transaction.merchant || "Unknown";
      const date = transaction.date || new Date().toISOString().split("T")[0];
      const location = transaction.location || "Unknown";
      const id = transaction.id || `TX-${Math.floor(Math.random() * 10000000)}`;

      // Simulate neural network fraud detection with multiple factors
      let fraudScore = 0;
      let reasons = [];

      // Factor 1: Amount (weighted by a sigmoid function to simulate neural network activation)
      if (amount > 0) {
        const amountScore = 1 / (1 + Math.exp(-0.001 * (amount - 1000)));
        fraudScore += amountScore * 0.4; // 40% weight
        if (amountScore > 0.5) reasons.push("Unusual transaction amount");
      }

      // Factor 2: Merchant risk (simulating embeddings or categorical encoding)
      const highRiskTerms = ["international", "foreign", "unverified"];
      const mediumRiskTerms = [
        "online",
        "digital",
        "electronic",
        "payment",
        "transfer",
        "unknown",
      ];

      const merchantLower = merchant.toLowerCase();
      let merchantScore = 0;

      if (highRiskTerms.some((term) => merchantLower.includes(term))) {
        merchantScore = 0.8;
        reasons.push("High-risk merchant category");
      } else if (mediumRiskTerms.some((term) => merchantLower.includes(term))) {
        merchantScore = 0.5;
        reasons.push("Medium-risk merchant category");
      }

      fraudScore += merchantScore * 0.3; // 30% weight

      // Factor 3: Location risk (simulating geospatial features)
      const locationLower = location.toLowerCase();
      let locationScore = 0;

      if (
        locationLower.includes("international") ||
        locationLower.includes("foreign")
      ) {
        locationScore = 0.7;
        reasons.push("Unusual transaction location");
      }

      fraudScore += locationScore * 0.3; // 30% weight

      // Apply threshold (simulating neural network final layer activation)
      const isFraudulent = fraudScore > 0.15;

      // Add to detected frauds if classified as fraudulent
      if (isFraudulent) {
        detectedFrauds.push({
          id,
          amount,
          merchant,
          date,
          reason:
            reasons.join("; ") || "Neural network detected unusual pattern",
        });
      }
    }
  }

  // Limit the number of detected frauds to return (for performance)
  if (detectedFrauds.length > 100) {
    detectedFrauds = detectedFrauds.slice(0, 100);
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
