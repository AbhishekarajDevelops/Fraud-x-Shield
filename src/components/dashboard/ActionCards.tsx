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
  ShieldCheck,
  ClipboardList,
  ArrowRight,
  FileText,
  Brain,
} from "lucide-react";

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  onClick: () => void;
}

const ActionCard = ({
  title = "Card Title",
  description = "Card description goes here",
  icon = <ShieldCheck className="h-8 w-8" />,
  buttonText = "Action",
  onClick = () => console.log("Card clicked"),
}: ActionCardProps) => {
  return (
    <Card className="w-full bg-white border-2 hover:border-primary/50 transition-all duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="p-2 rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="mt-1">{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {/* Additional content can be added here if needed */}
      </CardContent>
      <CardFooter>
        <Button
          onClick={onClick}
          className="w-full flex items-center justify-between"
        >
          {buttonText}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
};

interface ActionCardsProps {
  onCheckTransaction?: () => void;
  onViewHistory?: () => void;
  onUploadCSV?: () => void;
  onViewMLModel?: () => void;
}

const ActionCards = ({
  onCheckTransaction = () => console.log("Check transaction clicked"),
  onViewHistory = () => console.log("View history clicked"),
  onUploadCSV = () => console.log("Upload CSV clicked"),
  onViewMLModel = () => console.log("View ML model clicked"),
}: ActionCardsProps) => {
  return (
    <div className="w-full bg-gray-50 p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">What would you like to do?</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ActionCard
          title="Check Transaction"
          description="Analyze a credit card transaction for potential fraud"
          icon={<ShieldCheck className="h-8 w-8" />}
          buttonText="Check Now"
          onClick={onCheckTransaction}
        />
        <ActionCard
          title="Transaction History"
          description="View your past transaction checks and results"
          icon={<ClipboardList className="h-8 w-8" />}
          buttonText="View History"
          onClick={onViewHistory}
        />
        <ActionCard
          title="Bulk Analysis"
          description="Upload CSV file with multiple transactions for analysis"
          icon={<FileText className="h-8 w-8" />}
          buttonText="Upload CSV"
          onClick={onUploadCSV}
        />
        <ActionCard
          title="ML Model Info"
          description="View and manage the XGBoost machine learning model"
          icon={<Brain className="h-8 w-8" />}
          buttonText="View Model"
          onClick={onViewMLModel}
        />
      </div>
    </div>
  );
};

export default ActionCards;
