import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Mail, CheckCircle } from "lucide-react";
import { supabaseService } from "@/services/SupabaseService";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      await supabaseService.resetPassword(data.email);
      setSuccess(true);
    } catch (error: any) {
      setError(
        error.message || "Failed to send reset email. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-md glassmorphism border-0">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Forgot Password
          </CardTitle>
          <CardDescription className="text-center text-foreground/70">
            Enter your email to receive a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <Alert className="mb-4 bg-green-500/10 border-green-500/20 text-green-500">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Password reset link has been sent to your email. Please check
                your inbox and follow the instructions to reset your password.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert
                  variant="destructive"
                  className="mb-4 bg-destructive/10 text-destructive border-destructive/20"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground/80">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-foreground/40" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    {...register("email")}
                    className={`pl-10 bg-background/50 border-border/50 ${errors.email ? "border-red-500" : ""}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-foreground/70">
            Remember your password?{" "}
            <Button
              variant="link"
              className="p-0 h-auto text-primary"
              onClick={() => navigate("/")}
              disabled={isLoading}
            >
              Back to Login
            </Button>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ForgotPasswordForm;
