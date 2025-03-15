import React, { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { supabaseService } from "@/services/SupabaseService";

interface AuthContainerProps {
  onLogin?: (values: { email: string; password: string }) => void;
  onRegister?: (values: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => void;
  isLoading?: boolean;
  error?: string | null;
  initialView?: "login" | "register";
}

const AuthContainer = ({
  onLogin,
  onRegister,
  isLoading: propIsLoading,
  error: propError,
  initialView = "login",
}: AuthContainerProps) => {
  const [view, setView] = useState<"login" | "register">(initialView);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const {
    login,
    register,
    isLoading: authIsLoading,
    error: authError,
    clearError,
  } = useAuth();

  // Use props if provided, otherwise use auth context
  const isLoading = propIsLoading !== undefined ? propIsLoading : authIsLoading;
  const error = propError !== undefined ? propError : authError;

  const handleLoginSubmit = (values: { email: string; password: string }) => {
    if (onLogin) {
      onLogin(values);
    } else {
      clearError?.();
      login(values.email, values.password);
    }
  };

  const handleRegisterSubmit = (values: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    if (onRegister) {
      onRegister(values);
    } else {
      clearError?.();
      register(values.name, values.email, values.password)
        .then((data) => {
          if (data?.user) {
            setRegistrationSuccess(true);
            setRegisteredEmail(values.email);
          }
        })
        .catch((error) => {
          // Error is already handled by the AuthContext
        });
    }
  };

  const handleResendConfirmation = async () => {
    if (!registeredEmail) return;

    try {
      await supabaseService.resendConfirmationEmail(registeredEmail);
      // Show a success message or update UI
    } catch (error) {
      console.error("Error resending confirmation email:", error);
    }
  };

  const toggleView = () => {
    clearError?.();
    setRegistrationSuccess(false);
    setView(view === "login" ? "register" : "login");
  };

  if (registrationSuccess) {
    return (
      <div className="w-full max-w-md mx-auto p-4 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="w-full p-6">
            <h2 className="text-2xl font-bold text-center mb-6">
              Registration Successful
            </h2>
            <Alert className="mb-6 bg-green-50 border-green-200">
              <AlertDescription>
                We've sent a confirmation email to{" "}
                <strong>{registeredEmail}</strong>. Please check your inbox and
                click the confirmation link to activate your account.
              </AlertDescription>
            </Alert>
            <div className="space-y-4">
              <Button
                onClick={handleResendConfirmation}
                variant="outline"
                className="w-full"
              >
                Resend Confirmation Email
              </Button>
              <Button onClick={toggleView} className="w-full">
                Return to Login
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-background">
      <AnimatePresence mode="wait">
        {view === "login" ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <LoginForm
              onSubmit={handleLoginSubmit}
              onRegisterClick={toggleView}
              isLoading={isLoading}
              error={error}
            />
          </motion.div>
        ) : (
          <motion.div
            key="register"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <RegisterForm
              onSubmit={handleRegisterSubmit}
              onLoginClick={toggleView}
              isLoading={isLoading}
              error={error}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Secure authentication for Credit Card Fraud Detection System
        </p>
      </div>
    </div>
  );
};

export default AuthContainer;
