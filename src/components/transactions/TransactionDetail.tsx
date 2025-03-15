import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Calendar,
  MapPin,
  CreditCard,
  DollarSign,
  Store,
  Clock,
} from "lucide-react";

interface TransactionDetailProps {
  transaction?: {
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
  };
  onBack?: () => void;
}

const TransactionDetail = ({
  transaction = {
    id: "tx_12345678",
    amount: 299.99,
    merchant: "TechGadgets Online",
    date: "2023-06-15",
    location: "San Francisco, CA",
    cardType: "Visa",
    cardLastFour: "4321",
    isFraudulent: false,
    riskScore: 15,
    category: "Electronics",
    timestamp: "10:23 AM",
  },
  onBack = () => console.log("Back button clicked"),
}: TransactionDetailProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getRiskLevel = (score: number) => {
    if (score < 30) return "Low";
    if (score < 70) return "Medium";
    return "High";
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return "bg-green-100 text-green-800";
    if (score < 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 bg-white">
      <Button
        variant="ghost"
        className="mb-4 flex items-center gap-2"
        onClick={onBack}
      >
        <ArrowLeft size={16} />
        Back to Transaction History
      </Button>

      <Card className="w-full shadow-md">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">
                Transaction Details
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                ID: {transaction.id}
              </CardDescription>
            </div>
            <Badge
              className={
                transaction.isFraudulent
                  ? "bg-red-100 text-red-800"
                  : "bg-green-100 text-green-800"
              }
            >
              {transaction.isFraudulent ? (
                <span className="flex items-center gap-1">
                  <AlertCircle size={14} />
                  Suspicious
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <CheckCircle size={14} />
                  Safe
                </span>
              )}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Amount</h3>
              <span className="text-2xl font-bold">
                {formatCurrency(transaction.amount)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Merchant</h3>
              <span className="text-lg">{transaction.merchant}</span>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="text-gray-500 mt-0.5" size={18} />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{transaction.date}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="text-gray-500 mt-0.5" size={18} />
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium">{transaction.timestamp}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="text-gray-500 mt-0.5" size={18} />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{transaction.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Store className="text-gray-500 mt-0.5" size={18} />
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium">{transaction.category}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CreditCard className="text-gray-500 mt-0.5" size={18} />
              <div>
                <p className="text-sm text-gray-500">Card</p>
                <p className="font-medium">
                  {transaction.cardType} •••• {transaction.cardLastFour}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <AlertCircle className="text-gray-500 mt-0.5" size={18} />
              <div>
                <p className="text-sm text-gray-500">Risk Score</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{transaction.riskScore}/100</p>
                  <Badge className={getRiskColor(transaction.riskScore)}>
                    {getRiskLevel(transaction.riskScore)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {transaction.isFraudulent && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-500 mt-0.5" size={20} />
                <div>
                  <h4 className="font-semibold text-red-700">Fraud Alert</h4>
                  <p className="text-sm text-red-600">
                    This transaction has been flagged as potentially fraudulent.
                    Please review the details carefully and contact your bank if
                    you don't recognize this transaction.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-4">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button variant="destructive" disabled={!transaction.isFraudulent}>
            Report Fraud
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TransactionDetail;
