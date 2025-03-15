import React, { useEffect, useState } from "react";
import MLModelInfo from "../transactions/MLModelInfo";
import { MLModelStats } from "@/services/SupabaseService";
import { useMLModel } from "@/hooks/useMLModel";

export default function MLModelInfoStoryboard() {
  const [stats, setStats] = useState<MLModelStats | null>(null);
  const { getMLModelStats, isLoading } = useMLModel();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const modelStats = await getMLModelStats();
        if (modelStats) {
          setStats(modelStats);
        }
      } catch (error) {
        console.error("Error fetching ML model stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p>Loading model stats...</p>
        </div>
      ) : (
        <MLModelInfo
          modelStats={stats || undefined}
          onTrainModel={() => console.log("Train model clicked")}
          onDownloadModel={() => console.log("Download model clicked")}
        />
      )}
    </div>
  );
}
