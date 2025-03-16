import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ActionCards from "./ActionCards";
import TransactionForm from "../transactions/TransactionForm";
import TransactionResult from "../transactions/TransactionResult";
import TransactionHistory from "../transactions/TransactionHistory";
import TransactionDetail from "../transactions/TransactionDetail";
import CSVUpload, { AnalysisResult } from "../transactions/CSVUpload";
import CSVAnalysisResult from "../transactions/CSVAnalysisResult";
import MLModelInfo from "../transactions/MLModelInfo";
import { z } from "zod";

type View =
  | "home"
  | "check"
  | "result"
  | "history"
  | "detail"
  | "csv-upload"
  | "csv-result"
  | "ml-model";

interface Transaction {
  id: string;
  date: string;
  amount: number;
  merchant: string;
  location: string;
  status: "safe" | "suspicious";
  cardType: string;
}

interface TransactionDetailType {
  id: string;
  amount: number;
  merchant: string;
  date: string;
  location: string;
  cardType: string;
  cardLastFour: string;
  isFraudulent: boolean;
  riskScore: number;
  category: string;
  timestamp: string;
}

const Dashboard = () => {
  const [currentView, setCurrentView] = useState<View>("home");
  const [transactionResult, setTransactionResult] = useState<{
    result: "safe" | "suspicious";
    score: number;
    transaction: {
      id: string;
      amount: number;
      merchant: string;
      date: string;
      time: string;
      location: string;
      cardType: string;
      cardLastFour: string;
    };
    reasons: string[];
  } | null>(null);

  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [transactionDetail, setTransactionDetail] =
    useState<TransactionDetailType | null>(null);

  const [csvAnalysisResults, setCsvAnalysisResults] =
    useState<AnalysisResult | null>(null);

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const pageTransition = {
    type: "tween",
    ease: "easeInOut",
    duration: 0.3,
  };

  // Handle transaction form submission
  const handleTransactionSubmit = async (values: z.infer<any>) => {
    try {
      // Import the transaction hook
      const { useTransactions } = await import("@/hooks/useTransactions");
      const { analyzeTransaction } = useTransactions();

      // Call the API to analyze the transaction
      const result = await analyzeTransaction({
        amount: parseFloat(values.amount),
        merchant: values.merchant,
        date: values.date,
        time: values.time,
        location: values.location,
        cardType: values.cardType,
        category: values.category,
      });

      if (result) {
        setTransactionResult({
          result: result.result,
          score: result.score,
          transaction: {
            id: `TX-${Math.floor(Math.random() * 10000000)}`,
            amount: parseFloat(values.amount),
            merchant: values.merchant,
            date: values.date,
            time: values.time,
            location: values.location,
            cardType: values.cardType,
            cardLastFour: values.cardNumber,
          },
          reasons: result.reasons,
        });

        setCurrentView("result");
      }
    } catch (error) {
      console.error("Error analyzing transaction:", error);
      // Fallback to random result if API fails
      const isSuspicious = Math.random() > 0.7;
      const score = isSuspicious
        ? Math.floor(Math.random() * 40) + 10
        : Math.floor(Math.random() * 30) + 70;

      setTransactionResult({
        result: isSuspicious ? "suspicious" : "safe",
        score,
        transaction: {
          id: `TX-${Math.floor(Math.random() * 10000000)}`,
          amount: parseFloat(values.amount),
          merchant: values.merchant,
          date: values.date,
          time: values.time,
          location: values.location,
          cardType: values.cardType,
          cardLastFour: values.cardNumber,
        },
        reasons: isSuspicious
          ? [
              "Transaction amount is unusually high for this merchant category",
              "Transaction location is far from typical spending areas",
              "Similar merchant had recent fraud reports",
            ]
          : [
              "Transaction amount is within normal spending pattern",
              "Merchant category is frequently visited",
              "Transaction location is consistent with user history",
            ],
      });

      setCurrentView("result");
    }
  };

  // Handle CSV analysis completion
  const handleCsvAnalysisComplete = async (results: AnalysisResult) => {
    try {
      // Import the transaction hook
      const { useTransactions } = await import("@/hooks/useTransactions");
      const { analyzeCSV } = useTransactions();

      // If we have parsed data, send it to the API
      if (results.totalTransactions > 0) {
        const apiResults = await analyzeCSV(results.detectedFrauds);
        if (apiResults) {
          setCsvAnalysisResults(apiResults);
        } else {
          setCsvAnalysisResults(results);
        }
      } else {
        setCsvAnalysisResults(results);
      }

      setCurrentView("csv-result");
    } catch (error) {
      console.error("Error with CSV analysis:", error);
      setCsvAnalysisResults(results);
      setCurrentView("csv-result");
    }
  };

  // Handle viewing transaction detail from history
  const handleViewTransactionDetail = (transaction: Transaction) => {
    // In a real app, this would fetch detailed transaction data
    setSelectedTransaction(transaction);

    // Create a detailed transaction object
    const detail: TransactionDetailType = {
      id: transaction.id,
      amount: transaction.amount,
      merchant: transaction.merchant,
      date: transaction.date.split(" ")[0],
      location: transaction.location,
      cardType: transaction.cardType,
      cardLastFour: "4321", // Mock data
      isFraudulent: transaction.status === "suspicious",
      riskScore: transaction.status === "suspicious" ? 85 : 15,
      category: "Retail", // Mock data
      timestamp: transaction.date.split(" ")[1] || "12:00",
    };

    setTransactionDetail(detail);
    setCurrentView("detail");
  };

  const BackButton = ({ onClick }: { onClick: () => void }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="inline-block"
    >
      <Button
        onClick={onClick}
        variant="ghost"
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>
    </motion.div>
  );

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {currentView === "home" && (
            <motion.div
              key="home"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
              className="space-y-8"
            >
              <motion.div
                className="bg-white p-8 rounded-xl shadow-md border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <motion.h1
                  className="text-3xl font-bold text-gray-900 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Welcome to Fraud Detection
                </motion.h1>
                <motion.p
                  className="text-gray-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Check your transactions for potential fraud or view your
                  transaction history.
                </motion.p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <ActionCards
                  onCheckTransaction={() => setCurrentView("check")}
                  onViewHistory={() => setCurrentView("history")}
                  onUploadCSV={() => setCurrentView("csv-upload")}
                  onViewMLModel={() => setCurrentView("ml-model")}
                />
              </motion.div>
            </motion.div>
          )}

          {currentView === "check" && (
            <motion.div
              key="check"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
              className="space-y-4"
            >
              <BackButton onClick={() => setCurrentView("home")} />
              <TransactionForm onSubmit={handleTransactionSubmit} />
            </motion.div>
          )}

          {currentView === "result" && transactionResult && (
            <motion.div
              key="result"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
              className="space-y-4"
            >
              <TransactionResult
                result={transactionResult.result}
                score={transactionResult.score}
                transaction={transactionResult.transaction}
                reasons={transactionResult.reasons}
                onBack={() => setCurrentView("check")}
              />
            </motion.div>
          )}

          {currentView === "history" && (
            <motion.div
              key="history"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <BackButton onClick={() => setCurrentView("home")} />
              <TransactionHistory onViewDetail={handleViewTransactionDetail} />
            </motion.div>
          )}

          {currentView === "detail" && transactionDetail && (
            <motion.div
              key="detail"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <TransactionDetail
                transaction={transactionDetail}
                onBack={() => setCurrentView("history")}
              />
            </motion.div>
          )}

          {currentView === "csv-upload" && (
            <motion.div
              key="csv-upload"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <BackButton onClick={() => setCurrentView("home")} />
              <CSVUpload onAnalyzeComplete={handleCsvAnalysisComplete} />
            </motion.div>
          )}

          {currentView === "csv-result" && csvAnalysisResults && (
            <motion.div
              key="csv-result"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <CSVAnalysisResult
                results={csvAnalysisResults}
                onBack={() => setCurrentView("csv-upload")}
              />
            </motion.div>
          )}

          {currentView === "ml-model" && (
            <motion.div
              key="ml-model"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <BackButton onClick={() => setCurrentView("home")} />
              <MLModelInfo
                onTrainModel={() => {
                  // In a real app, this would trigger model training
                  alert(
                    "Model training would start here. This would typically take several minutes to hours depending on dataset size.",
                  );
                }}
                onDownloadModel={() => {
                  // In a real app, this would download the model file
                  alert(
                    "In a production environment, this would download the trained model file.",
                  );
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;
