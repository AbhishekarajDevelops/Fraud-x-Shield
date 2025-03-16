import React, { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { supabaseService } from "@/services/SupabaseService";
import { CheckCircle, Send, ArrowLeft } from "lucide-react";

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
  const [resendSuccess, setResendSuccess] = useState(false);
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
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
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
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        >
          <Card className="w-full p-8 shadow-lg border-t-4 border-t-green-500">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-center mb-6"
            >
              Registration Successful
            </motion.h2>

            <Alert className="mb-6 bg-green-50 border-green-200">
              <AlertDescription>
                We've sent a confirmation email to{" "}
                <strong>{registeredEmail}</strong>. Please check your inbox and
                click the confirmation link to activate your account.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleResendConfirmation}
                  variant="outline"
                  className="w-full relative overflow-hidden group"
                  disabled={resendSuccess}
                >
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    {resendSuccess
                      ? "Email Sent!"
                      : "Resend Confirmation Email"}
                  </span>
                  {resendSuccess && (
                    <motion.span
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      className="absolute inset-0 bg-green-100 -z-10"
                    />
                  )}
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={toggleView}
                  className="w-full flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Return to Login
                </Button>
              </motion.div>
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
    </div>
  );
};

export default AuthContainer;
