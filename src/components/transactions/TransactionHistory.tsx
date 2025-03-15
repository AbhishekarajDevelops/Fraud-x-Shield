import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Search,
  Filter,
  ChevronDown,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface Transaction {
  id: string;
  date: string;
  amount: number;
  merchant: string;
  location: string;
  status: "safe" | "suspicious";
  cardType: string;
}

interface TransactionHistoryProps {
  transactions?: Transaction[];
  onViewDetail?: (transaction: Transaction) => void;
}

const TransactionHistory = ({
  transactions = [
    {
      id: "1",
      date: "2023-06-15 14:30",
      amount: 125.99,
      merchant: "Amazon",
      location: "Online",
      status: "safe",
      cardType: "Visa",
    },
    {
      id: "2",
      date: "2023-06-14 09:45",
      amount: 75.5,
      merchant: "Starbucks",
      location: "New York, NY",
      status: "safe",
      cardType: "Mastercard",
    },
    {
      id: "3",
      date: "2023-06-13 22:15",
      amount: 899.99,
      merchant: "Electronics Store",
      location: "Miami, FL",
      status: "suspicious",
      cardType: "Amex",
    },
    {
      id: "4",
      date: "2023-06-12 16:20",
      amount: 42.75,
      merchant: "Gas Station",
      location: "Chicago, IL",
      status: "safe",
      cardType: "Visa",
    },
    {
      id: "5",
      date: "2023-06-11 13:10",
      amount: 1250.0,
      merchant: "Unknown Vendor",
      location: "International",
      status: "suspicious",
      cardType: "Mastercard",
    },
  ],
  onViewDetail = () => {},
}: TransactionHistoryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.location.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "all") return matchesSearch;
    return matchesSearch && transaction.status === filter;
  });

  const handleViewDetail = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetail(true);
    onViewDetail(transaction);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedTransaction(null);
  };

  // Transaction detail component defined inline to avoid import issues
  const TransactionDetailView = ({
    transaction,
  }: {
    transaction: Transaction;
  }) => {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Transaction Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Transaction ID
              </h3>
              <p className="text-lg font-medium">{transaction.id}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Date & Time
              </h3>
              <p className="text-lg font-medium">{transaction.date}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Merchant
              </h3>
              <p className="text-lg font-medium">{transaction.merchant}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Location
              </h3>
              <p className="text-lg font-medium">{transaction.location}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Amount</h3>
              <p className="text-lg font-medium">
                ${transaction.amount.toFixed(2)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Card Type
              </h3>
              <p className="text-lg font-medium">{transaction.cardType}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
              <Badge
                variant={
                  transaction.status === "safe" ? "outline" : "destructive"
                }
                className="flex items-center gap-1 mt-1"
              >
                {transaction.status === "safe" ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <AlertCircle className="h-3 w-3" />
                )}
                {transaction.status === "safe" ? "Safe" : "Suspicious"}
              </Badge>
            </div>
          </div>

          {transaction.status === "suspicious" && (
            <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="text-md font-semibold text-red-700 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Fraud Detection Alert
              </h3>
              <p className="mt-2 text-sm text-red-600">
                This transaction has been flagged as potentially suspicious due
                to unusual activity patterns. Please verify this transaction
                with the cardholder.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="w-full h-full bg-white p-6 rounded-lg shadow-sm">
      {!showDetail ? (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Transaction History
            </CardTitle>
            <div className="flex flex-col md:flex-row justify-between gap-4 mt-4">
              <div className="relative w-full md:w-1/3">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by merchant or location"
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filter by status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Transactions</SelectItem>
                    <SelectItem value="safe">Safe Transactions</SelectItem>
                    <SelectItem value="suspicious">
                      Suspicious Transactions
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="w-full">
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Merchant</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Card Type</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.length > 0 ? (
                        filteredTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>{transaction.date}</TableCell>
                            <TableCell>{transaction.merchant}</TableCell>
                            <TableCell>{transaction.location}</TableCell>
                            <TableCell>
                              ${transaction.amount.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  transaction.status === "safe"
                                    ? "outline"
                                    : "destructive"
                                }
                                className="flex items-center gap-1"
                              >
                                {transaction.status === "safe" ? (
                                  <CheckCircle className="h-3 w-3" />
                                ) : (
                                  <AlertCircle className="h-3 w-3" />
                                )}
                                {transaction.status === "safe"
                                  ? "Safe"
                                  : "Suspicious"}
                              </Badge>
                            </TableCell>
                            <TableCell>{transaction.cardType}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetail(transaction)}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-6 text-gray-500"
                          >
                            No transactions found matching your criteria
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="summary">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Transactions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {transactions.length}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Safe Transactions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {transactions.filter((t) => t.status === "safe").length}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Suspicious Transactions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {
                          transactions.filter((t) => t.status === "suspicious")
                            .length
                        }
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <div>
          <Button variant="ghost" className="mb-4" onClick={handleCloseDetail}>
            ← Back to Transaction History
          </Button>
          {selectedTransaction && (
            <TransactionDetailView transaction={selectedTransaction} />
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
