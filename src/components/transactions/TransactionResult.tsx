import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import {
  Shield,
  AlertTriangle,
  Clock,
  Calendar,
  MapPin,
  CreditCard,
  DollarSign,
  Building,
  ArrowLeft,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";

interface TransactionResultProps {
  result?: "safe" | "suspicious";
  score?: number;
  transaction?: {
    id?: string;
    amount?: number;
    merchant?: string;
    date?: string;
    time?: string;
    location?: string;
    cardType?: string;
    cardLastFour?: string;
  };
  reasons?: string[];
  onBack?: () => void;
}

const TransactionResult = ({
  result = "safe",
  score = 92,
  transaction = {
    id: "TX-12345678",
    amount: 299.99,
    merchant: "Electronics Store",
    date: "2023-06-15",
    time: "14:30",
    location: "New York, NY",
    cardType: "Visa",
    cardLastFour: "4321",
  },
  reasons = [
    "Transaction amount is within normal spending pattern",
    "Merchant category is frequently visited",
    "Transaction location is near home address",
  ],
  onBack = () => console.log("Back button clicked"),
}: TransactionResultProps) => {
  const isSafe = result === "safe";

  return (
    <Card className="w-full max-w-[600px] mx-auto bg-white shadow-lg">
      <CardHeader
        className={`${isSafe ? "bg-green-50" : "bg-red-50"} rounded-t-lg`}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">
            Transaction Check Result
          </CardTitle>
          <Badge
            variant={isSafe ? "outline" : "destructive"}
            className={`text-lg px-3 py-1 ${isSafe ? "border-green-500 text-green-700" : "text-red-700"}`}
          >
            {score}%
          </Badge>
        </div>
        <CardDescription className="text-lg mt-2">
          {transaction.id}
        </CardDescription>
        <div className="flex items-center mt-4 gap-2">
          {isSafe ? (
            <>
              <Shield className="h-10 w-10 text-green-600" />
              <div>
                <h3 className="text-xl font-semibold text-green-700">
                  Safe Transaction
                </h3>
                <p className="text-green-600">
                  This transaction appears to be legitimate
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle className="h-10 w-10 text-red-600" />
              <div>
                <h3 className="text-xl font-semibold text-red-700">
                  Suspicious Activity
                </h3>
                <p className="text-red-600">
                  This transaction may be fraudulent
                </p>
              </div>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">Transaction Details</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <p className="font-medium">${transaction.amount?.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Merchant</p>
              <p className="font-medium">{transaction.merchant}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">{transaction.date}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Time</p>
              <p className="font-medium">{transaction.time}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{transaction.location}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Card</p>
              <p className="font-medium">
                {transaction.cardType} •••• {transaction.cardLastFour}
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div>
          <h3 className="text-lg font-semibold mb-3">Analysis Factors</h3>
          <ul className="space-y-2">
            {reasons.map((reason, index) => (
              <li key={index} className="flex items-start gap-2">
                <div
                  className={`mt-1 h-2 w-2 rounded-full ${isSafe ? "bg-green-500" : "bg-red-500"}`}
                />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
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

        <Button variant={isSafe ? "default" : "destructive"}>
          {isSafe ? "Save Result" : "Report Fraud"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TransactionResult;
