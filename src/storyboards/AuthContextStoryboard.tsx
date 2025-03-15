import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthContainer from "@/components/auth/AuthContainer";

export default function AuthContextStoryboard() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <AuthProvider>
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-6">
            Authentication Demo
          </h1>
          <AuthContainer
            onLogin={(values) => console.log("Login:", values)}
            onRegister={(values) => console.log("Register:", values)}
          />
        </div>
      </AuthProvider>
    </div>
  );
}
