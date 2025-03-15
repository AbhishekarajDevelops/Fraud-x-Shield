import { useState } from "react";
import { supabaseService, MLModelStats } from "@/services/SupabaseService";

export function useMLModel() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMLModelStats = async (): Promise<MLModelStats | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const stats = await supabaseService.getMLModelStats();
      return stats;
    } catch (err: any) {
      setError(err.message || "Failed to fetch ML model stats");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getMLModelStats,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}
