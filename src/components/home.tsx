import React, { useEffect } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import Header from "./layout/Header";
import AuthContainer from "./auth/AuthContainer";
import Dashboard from "./dashboard/Dashboard";
import { useAuth } from "@/contexts/AuthContext";
import {
  Shield,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Lock,
  BarChart,
} from "lucide-react";

const Home = () => {
  const { user, isAuthenticated, isLoading, error, login, register, logout } =
    useAuth();
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      y: [0, -10, 0],
      transition: { repeat: Infinity, duration: 3, ease: "easeInOut" },
    });
  }, [controls]);

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

  const featureCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3 + i * 0.1,
        duration: 0.5,
      },
    }),
  };

  const features = [
    {
      icon: <AlertTriangle className="h-5 w-5 text-primary" />,
      title: "Real-time Fraud Detection",
      description: "Instantly analyze transactions for suspicious activity",
    },
    {
      icon: <CreditCard className="h-5 w-5 text-primary" />,
      title: "Secure Transaction Monitoring",
      description: "Keep track of all your financial activities",
    },
    {
      icon: <CheckCircle className="h-5 w-5 text-primary" />,
      title: "Advanced ML Algorithms",
      description: "Powered by cutting-edge machine learning models",
    },
    {
      icon: <Lock className="h-5 w-5 text-primary" />,
      title: "Bank-Level Security",
      description: "Your data is protected with enterprise-grade encryption",
    },
    {
      icon: <BarChart className="h-5 w-5 text-primary" />,
      title: "Detailed Analytics",
      description: "Visualize your transaction patterns and risk factors",
    },
  ];

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
        <AnimatePresence mode="wait">
          {!isAuthenticated ? (
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-5xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="text-center md:text-left">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className="flex justify-center md:justify-start mb-4">
                      <motion.div animate={controls}>
                        <Shield className="h-16 w-16 text-primary drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                      </motion.div>
                    </div>
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600"
                    >
                      FraudXShield
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="text-xl text-foreground/80 mb-8"
                    >
                      Advanced AI-powered fraud detection for your financial
                      transactions
                    </motion.p>

                    <div className="space-y-5 mb-8">
                      {features.map((feature, i) => (
                        <motion.div
                          key={i}
                          custom={i}
                          initial="hidden"
                          animate="visible"
                          variants={featureCardVariants}
                          className="flex items-start space-x-3 hover:translate-x-1 transition-transform duration-300"
                        >
                          <div className="bg-primary/20 p-2 rounded-full shadow-md">
                            {feature.icon}
                          </div>
                          <div className="text-left">
                            <h3 className="font-medium">{feature.title}</h3>
                            <p className="text-sm text-foreground/70">
                              {feature.description}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="glassmorphism rounded-xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.15)] backdrop-blur-xl"
                  whileHover={{ boxShadow: "0 15px 50px rgba(0,0,0,0.2)" }}
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
              key="dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <Dashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-6 px-6 border-t border-border/30 text-center text-sm text-foreground/70 glassmorphism">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div
              className="flex items-center space-x-2 mb-4 md:mb-0"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-bold">FraudXShield</span>
            </motion.div>
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
