import { useState } from "react";
import {
  supabaseService,
  TransactionData,
  TransactionResult,
  AnalysisResult,
} from "@/services/SupabaseService";

export function useTransactions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeTransaction = async (
    transaction: TransactionData,
  ): Promise<TransactionResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await supabaseService.analyzeTransaction(transaction);
      return result;
    } catch (err: any) {
      setError(err.message || "Failed to analyze transaction");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const transactions = await supabaseService.getTransactionHistory();
      return transactions.map((tx) => ({
        id: tx.id,
        date: `${tx.date} ${tx.time || ""}`.trim(),
        amount: tx.amount,
        merchant: tx.merchant,
        location: tx.location || "Unknown",
        status: tx.is_fraudulent ? "suspicious" : "safe",
        cardType: tx.card_type || "Unknown",
      }));
    } catch (err: any) {
      setError(err.message || "Failed to fetch transaction history");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionDetail = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const tx = await supabaseService.getTransactionById(id);
      return {
        id: tx.id,
        amount: tx.amount,
        merchant: tx.merchant,
        date: tx.date,
        location: tx.location || "Unknown",
        cardType: tx.card_type || "Unknown",
        cardLastFour: tx.card_last_four || "****",
        isFraudulent: tx.is_fraudulent || false,
        riskScore: tx.risk_score || 0,
        category: tx.category || "Other",
        timestamp: tx.time || "00:00",
      };
    } catch (err: any) {
      setError(err.message || "Failed to fetch transaction details");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeCSV = async (
    transactions: any[],
  ): Promise<AnalysisResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await supabaseService.analyzeCSV(transactions);
      return result;
    } catch (err: any) {
      setError(err.message || "Failed to analyze CSV data");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    analyzeTransaction,
    getTransactionHistory,
    getTransactionDetail,
    analyzeCSV,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}
