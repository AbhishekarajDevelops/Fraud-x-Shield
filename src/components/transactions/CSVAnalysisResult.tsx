import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  AlertTriangle,
  FileText,
  DollarSign,
  Calendar,
  Store,
  Download,
} from "lucide-react";
import { AnalysisResult } from "./CSVUpload";

interface CSVAnalysisResultProps {
  results: AnalysisResult;
  onBack: () => void;
}

const CSVAnalysisResult = ({ results, onBack }: CSVAnalysisResultProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleDownloadReport = () => {
    // Create CSV content
    const headers = [
      "Transaction ID",
      "Date",
      "Merchant",
      "Amount",
      "Fraud Reason",
    ];
    const rows = results.detectedFrauds.map((fraud) => [
      fraud.id,
      fraud.date,
      fraud.merchant,
      formatCurrency(fraud.amount),
      fraud.reason,
    ]);

    // Add summary data
    const summaryRows = [
      ["SUMMARY REPORT", "", "", "", ""],
      ["Total Transactions", results.totalTransactions.toString(), "", "", ""],
      ["Safe Transactions", results.safeTransactions.toString(), "", "", ""],
      [
        "Fraudulent Transactions",
        results.fraudulentTransactions.toString(),
        "",
        "",
        "",
      ],
      [
        "Fraud Percentage",
        `${results.fraudPercentage.toFixed(2)}%`,
        "",
        "",
        "",
      ],
      ["", "", "", "", ""],
      ["DETECTED FRAUDULENT TRANSACTIONS", "", "", "", ""],
    ];

    // Combine all rows
    const allRows = [...summaryRows, [headers], ...rows];

    // Convert to CSV
    const csvContent = allRows.map((row) => row.join(",")).join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `fraud_analysis_report_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">CSV Analysis Results</CardTitle>
            <CardDescription className="text-blue-100">
              ML-powered fraud detection analysis of your transaction data
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="bg-white/10 text-white border-white/30 px-3 py-1"
          >
            {results.totalTransactions} Transactions
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium text-green-800">
                Safe Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-700">
                  {results.safeTransactions}
                </span>
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800 border-green-300"
                >
                  {(100 - results.fraudPercentage).toFixed(1)}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium text-red-800">
                Fraudulent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-red-700">
                  {results.fraudulentTransactions}
                </span>
                <Badge
                  variant="outline"
                  className="bg-red-100 text-red-800 border-red-300"
                >
                  {results.fraudPercentage.toFixed(1)}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium text-blue-800">
                Total Amount Analyzed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                {formatCurrency(
                  results.detectedFrauds.reduce(
                    (sum, tx) => sum + tx.amount,
                    0,
                  ) * 5,
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {results.fraudulentTransactions > 0 && (
          <>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-red-500 mt-0.5" size={20} />
                <div>
                  <h4 className="font-semibold text-red-700">Fraud Alert</h4>
                  <p className="text-sm text-red-600">
                    Our ML algorithm has detected{" "}
                    {results.fraudulentTransactions} potentially fraudulent
                    transactions in your data. Review the details below and take
                    appropriate action.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">
                Detected Fraudulent Transactions
              </h3>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Merchant</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.detectedFrauds.map((fraud) => (
                      <TableRow key={fraud.id}>
                        <TableCell className="font-medium">
                          {fraud.id}
                        </TableCell>
                        <TableCell>{fraud.date}</TableCell>
                        <TableCell>{fraud.merchant}</TableCell>
                        <TableCell>{formatCurrency(fraud.amount)}</TableCell>
                        <TableCell>
                          <span className="text-red-600 text-sm">
                            {fraud.reason}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        )}

        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-start gap-3">
            <FileText className="text-gray-500 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-gray-700">Analysis Summary</h4>
              <p className="text-sm text-gray-600">
                Our machine learning algorithm analyzed{" "}
                {results.totalTransactions} transactions and identified patterns
                consistent with fraudulent activity in{" "}
                {results.fraudulentTransactions} transactions (
                {results.fraudPercentage.toFixed(1)}% of total). The analysis
                considered transaction amount, location, merchant type, and
                timing patterns.
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between pt-2">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Button
          variant="default"
          onClick={handleDownloadReport}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Full Report
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CSVAnalysisResult;
