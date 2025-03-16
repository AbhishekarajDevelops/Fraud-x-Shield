import React from "react";
import { motion } from "framer-motion";
import Header from "./layout/Header";
import AuthContainer from "./auth/AuthContainer";
import Dashboard from "./dashboard/Dashboard";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, CreditCard, AlertTriangle, CheckCircle } from "lucide-react";

const Home = () => {
  const { user, isAuthenticated, isLoading, error, login, register, logout } =
    useAuth();

  const handleLogin = (values: { email: string; password: string }) => {
    login(values.email, values.password);
  };

  const handleRegister = (values: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    register(values.name, values.email, values.password);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background gradient-bg">
      <Header
        isAuthenticated={isAuthenticated}
        userName={user?.name || ""}
        userInitials={user?.name ? user.name.substring(0, 2).toUpperCase() : ""}
        userAvatarUrl={user?.avatarUrl}
        onLogin={() => {}}
        onLogout={logout}
        onProfileClick={() => console.log("Profile clicked")}
      />

      <main className="flex-1 flex items-center justify-center p-4">
        {!isAuthenticated ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-4xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="text-center md:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="flex justify-center md:justify-start mb-4">
                    <Shield className="h-12 w-12 text-primary" />
                  </div>
                  <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                    FraudXShield
                  </h1>
                  <p className="text-xl text-foreground/80 mb-6">
                    Advanced AI-powered fraud detection for your financial
                    transactions
                  </p>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-start space-x-3">
                      <div className="bg-primary/20 p-2 rounded-full">
                        <AlertTriangle className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium">
                          Real-time Fraud Detection
                        </h3>
                        <p className="text-sm text-foreground/70">
                          Instantly analyze transactions for suspicious activity
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-primary/20 p-2 rounded-full">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium">
                          Secure Transaction Monitoring
                        </h3>
                        <p className="text-sm text-foreground/70">
                          Keep track of all your financial activities
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-primary/20 p-2 rounded-full">
                        <CheckCircle className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium">Advanced ML Algorithms</h3>
                        <p className="text-sm text-foreground/70">
                          Powered by cutting-edge machine learning models
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="glassmorphism rounded-xl p-6"
              >
                <AuthContainer
                  onLogin={handleLogin}
                  onRegister={handleRegister}
                  isLoading={isLoading}
                  error={error}
                />
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <Dashboard />
          </motion.div>
        )}
      </main>

      <footer className="py-6 px-6 border-t border-border/30 text-center text-sm text-foreground/70 glassmorphism">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-bold">FraudXShield</span>
            </div>
            <p>
              © {new Date().getFullYear()} FraudXShield - Advanced Fraud
              Detection System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
