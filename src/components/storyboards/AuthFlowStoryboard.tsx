import React from "react";
import AuthContainer from "../auth/AuthContainer";

export default function AuthFlowStoryboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            FraudXshield
          </h1>
          <p className="text-gray-600">Credit Card Fraud Detection System</p>
        </div>
        <AuthContainer />
      </div>
    </div>
  );
}
