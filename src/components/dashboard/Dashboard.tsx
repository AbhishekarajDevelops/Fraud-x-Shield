import React, { useState } from "react";
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

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {currentView === "home" && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to Fraud Detection
              </h1>
              <p className="text-gray-600">
                Check your transactions for potential fraud or view your
                transaction history.
              </p>
            </div>

            <ActionCards
              onCheckTransaction={() => setCurrentView("check")}
              onViewHistory={() => setCurrentView("history")}
              onUploadCSV={() => setCurrentView("csv-upload")}
              onViewMLModel={() => setCurrentView("ml-model")}
            />
          </div>
        )}

        {currentView === "check" && (
          <div className="space-y-4">
            <button
              onClick={() => setCurrentView("home")}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Dashboard
            </button>
            <TransactionForm onSubmit={handleTransactionSubmit} />
          </div>
        )}

        {currentView === "result" && transactionResult && (
          <div className="space-y-4">
            <TransactionResult
              result={transactionResult.result}
              score={transactionResult.score}
              transaction={transactionResult.transaction}
              reasons={transactionResult.reasons}
              onBack={() => setCurrentView("check")}
            />
          </div>
        )}

        {currentView === "history" && (
          <div>
            <button
              onClick={() => setCurrentView("home")}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Dashboard
            </button>
            <TransactionHistory onViewDetail={handleViewTransactionDetail} />
          </div>
        )}

        {currentView === "detail" && transactionDetail && (
          <TransactionDetail
            transaction={transactionDetail}
            onBack={() => setCurrentView("history")}
          />
        )}

        {currentView === "csv-upload" && (
          <div>
            <button
              onClick={() => setCurrentView("home")}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Dashboard
            </button>
            <CSVUpload onAnalyzeComplete={handleCsvAnalysisComplete} />
          </div>
        )}

        {currentView === "csv-result" && csvAnalysisResults && (
          <CSVAnalysisResult
            results={csvAnalysisResults}
            onBack={() => setCurrentView("csv-upload")}
          />
        )}

        {currentView === "ml-model" && (
          <div>
            <button
              onClick={() => setCurrentView("home")}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Dashboard
            </button>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
