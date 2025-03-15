import React from "react";
import { motion } from "framer-motion";
import Header from "./layout/Header";
import AuthContainer from "./auth/AuthContainer";
import Dashboard from "./dashboard/Dashboard";
import { useAuth } from "@/contexts/AuthContext";

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
    <div className="min-h-screen flex flex-col bg-background">
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
            className="w-full max-w-md"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-primary mb-2">
                Credit Card Fraud Detection
              </h1>
              <p className="text-muted-foreground">
                Secure your transactions with AI-powered fraud detection
              </p>
            </div>

            <AuthContainer
              onLogin={handleLogin}
              onRegister={handleRegister}
              isLoading={isLoading}
              error={error}
            />
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

      <footer className="py-4 px-6 border-t border-border text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} Credit Card Fraud Detection System. All
          rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Home;
