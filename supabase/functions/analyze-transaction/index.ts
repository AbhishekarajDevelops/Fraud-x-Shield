import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TransactionData {
  amount: number;
  merchant: string;
  location: string;
  cardType: string;
  category: string;
  date: string;
  time: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { transaction, userId } = await req.json();

    if (!transaction) {
      throw new Error("Transaction data is required");
    }

    // Analyze the transaction using a simple rule-based approach
    // In a real-world scenario, this would call a machine learning model
    const result = analyzeTransaction(transaction);

    // Store the transaction in the database if userId is provided
    if (userId) {
      const { data, error } = await supabase.from("transactions").insert({
        user_id: userId,
        amount: transaction.amount,
        merchant: transaction.merchant,
        date: transaction.date,
        time: transaction.time,
        location: transaction.location,
        card_type: transaction.cardType,
        card_last_four: transaction.cardLastFour,
        category: transaction.category,
        is_fraudulent: result.isFraudulent,
        risk_score: result.riskScore,
      });

      if (error) {
        console.error("Error storing transaction:", error);
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

function analyzeTransaction(transaction: TransactionData) {
  let isFraudulent = false;
  let riskScore = 0;
  const reasons: string[] = [];

  // Check for high amount
  if (transaction.amount > 5000) {
    riskScore += 30;
    reasons.push("Unusually high transaction amount");
  }

  // Check for suspicious merchant keywords
  const suspiciousMerchants = [
    "unknown",
    "international",
    "foreign",
    "unverified",
  ];
  if (
    suspiciousMerchants.some((keyword) =>
      transaction.merchant.toLowerCase().includes(keyword),
    )
  ) {
    riskScore += 25;
    reasons.push("Transaction with suspicious merchant");
  }

  // Check for suspicious locations
  const suspiciousLocations = ["international", "foreign", "unknown"];
  if (
    suspiciousLocations.some((keyword) =>
      transaction.location.toLowerCase().includes(keyword),
    )
  ) {
    riskScore += 25;
    reasons.push("Transaction from suspicious location");
  }

  // Check for unusual time (late night transactions)
  if (transaction.time) {
    const hour = parseInt(transaction.time.split(":")[0]);
    if (hour >= 0 && hour < 5) {
      riskScore += 15;
      reasons.push("Transaction occurred during unusual hours");
    }
  }

  // Determine if fraudulent based on risk score
  if (riskScore >= 50) {
    isFraudulent = true;
  }

  return {
    isFraudulent,
    riskScore,
    reasons,
    result: isFraudulent ? "suspicious" : "safe",
    score: isFraudulent
      ? Math.min(100 - riskScore, 40)
      : Math.max(100 - riskScore, 70),
  };
}
