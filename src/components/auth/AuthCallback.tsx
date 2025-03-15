import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the error and type from the URL
        const error = searchParams.get("error");
        const type = searchParams.get("type");

        if (error) {
          setStatus("error");
          setMessage(error);
          return;
        }

        // Handle different callback types
        if (type === "signup") {
          setStatus("success");
          setMessage("Your email has been confirmed! You can now log in.");
        } else if (type === "recovery") {
          // For password recovery, redirect to reset password page
          navigate("/reset-password");
          return;
        } else {
          // Default success message
          setStatus("success");
          setMessage("Authentication successful!");
        }

        // Check if we have a session
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          // If we have a session, redirect to dashboard after a short delay
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        }
      } catch (error) {
        console.error("Error handling auth callback:", error);
        setStatus("error");
        setMessage("An error occurred during authentication.");
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {status === "loading" && "Processing Authentication"}
            {status === "success" && "Authentication Successful"}
            {status === "error" && "Authentication Error"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {status === "loading" && (
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          )}
          {status === "success" && (
            <CheckCircle className="h-16 w-16 text-green-500" />
          )}
          {status === "error" && <XCircle className="h-16 w-16 text-red-500" />}

          <p className="text-center text-gray-600">{message}</p>

          <Button
            onClick={() => navigate("/")}
            className="mt-4"
            variant={status === "error" ? "default" : "outline"}
          >
            {status === "error" ? "Back to Login" : "Go to Home"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;
