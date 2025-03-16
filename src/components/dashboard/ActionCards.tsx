import React from "react";
import { motion } from "framer-motion";
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
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      <Card className="w-full bg-white border-2 hover:border-primary/50 transition-all duration-200 hover:shadow-md">
        <CardHeader className="flex flex-row items-center gap-4">
          <motion.div
            className="p-2 rounded-full bg-primary/10 text-primary"
            whileHover={{ rotate: 5, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            {icon}
          </motion.div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {/* Additional content can be added here if needed */}
        </CardContent>
        <CardFooter>
          <motion.div
            className="w-full"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button
              onClick={onClick}
              className="w-full flex items-center justify-between shadow-sm"
            >
              {buttonText}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
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
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 * i,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  return (
    <div className="w-full bg-gray-50 p-6 rounded-lg">
      <motion.h2
        className="text-2xl font-bold mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        What would you like to do?
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <ActionCard
            title="Check Transaction"
            description="Analyze a credit card transaction for potential fraud"
            icon={<ShieldCheck className="h-8 w-8" />}
            buttonText="Check Now"
            onClick={onCheckTransaction}
          />
        </motion.div>

        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <ActionCard
            title="Transaction History"
            description="View your past transaction checks and results"
            icon={<ClipboardList className="h-8 w-8" />}
            buttonText="View History"
            onClick={onViewHistory}
          />
        </motion.div>

        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <ActionCard
            title="Bulk Analysis"
            description="Upload CSV file with multiple transactions for analysis"
            icon={<FileText className="h-8 w-8" />}
            buttonText="Upload CSV"
            onClick={onUploadCSV}
          />
        </motion.div>

        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <ActionCard
            title="ML Model Info"
            description="View and manage the XGBoost machine learning model"
            icon={<Brain className="h-8 w-8" />}
            buttonText="View Model"
            onClick={onViewMLModel}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default ActionCards;
