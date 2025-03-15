import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Brain,
  BarChart3,
  Layers,
  Cpu,
  RefreshCw,
  Download,
  Info,
} from "lucide-react";

interface MLModelInfoProps {
  modelStats?: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    lastTrained?: string;
    totalSamples?: number;
    fraudSamples?: number;
  };
  onTrainModel?: () => void;
  onDownloadModel?: () => void;
}

const MLModelInfo = ({
  modelStats,
  onTrainModel = () => console.log("Train model clicked"),
  onDownloadModel = () => console.log("Download model clicked"),
}: MLModelInfoProps) => {
  const [stats, setStats] = React.useState({
    accuracy: 0.9876,
    precision: 0.9532,
    recall: 0.8721,
    f1Score: 0.9109,
    lastTrained: "2023-06-15",
    totalSamples: 284807,
    fraudSamples: 492,
  });

  React.useEffect(() => {
    // If modelStats are provided as props, use them
    if (modelStats) {
      setStats(modelStats);
      return;
    }

    // Otherwise, try to fetch from API
    const fetchStats = async () => {
      try {
        const { useMLModel } = await import("@/hooks/useMLModel");
        const { getMLModelStats } = useMLModel();
        const apiStats = await getMLModelStats();
        if (apiStats) {
          setStats(apiStats);
        }
      } catch (error) {
        console.error("Error fetching ML model stats:", error);
      }
    };

    fetchStats();
  }, [modelStats]);
  return (
    <Card className="w-full max-w-2xl mx-auto bg-white shadow-lg">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8" />
          <div>
            <CardTitle className="text-2xl">
              XGBoost Fraud Detection Model
            </CardTitle>
            <CardDescription className="text-indigo-100">
              Machine learning model trained on transaction data
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-indigo-500" />
            <h3 className="font-medium">Model Status</h3>
          </div>
          <Badge className="bg-green-100 text-green-800 border-green-300">
            Active
          </Badge>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Last Trained
            </h3>
            <p className="text-lg font-medium">{modelStats.lastTrained}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Training Samples
            </h3>
            <p className="text-lg font-medium">
              {modelStats.totalSamples?.toLocaleString()}
              <span className="text-xs text-red-600 ml-2">
                ({modelStats.fraudSamples?.toLocaleString()} fraud cases)
              </span>
            </p>
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-indigo-500" />
            <h3 className="font-medium">Performance Metrics</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gray-50">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-medium text-gray-500">
                  Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold text-indigo-600">
                  {(modelStats.accuracy * 100).toFixed(2)}%
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-medium text-gray-500">
                  Precision
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold text-indigo-600">
                  {(modelStats.precision * 100).toFixed(2)}%
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-medium text-gray-500">
                  Recall
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold text-indigo-600">
                  {(modelStats.recall * 100).toFixed(2)}%
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-medium text-gray-500">
                  F1 Score
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold text-indigo-600">
                  {(modelStats.f1Score * 100).toFixed(2)}%
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="text-blue-500 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-blue-700">About This Model</h4>
              <p className="text-sm text-blue-600">
                This XGBoost model was trained on credit card transaction data
                to detect fraudulent activities. It analyzes patterns in
                transaction amounts, locations, and timing to identify
                suspicious activities with high accuracy. The model is
                particularly effective at detecting unusual spending patterns
                while minimizing false positives.
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between pt-2">
        <Button
          variant="outline"
          onClick={onTrainModel}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retrain Model
        </Button>

        <Button
          variant="default"
          onClick={onDownloadModel}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
        >
          <Download className="h-4 w-4" />
          Download Model
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MLModelInfo;
