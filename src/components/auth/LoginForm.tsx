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
import { AlertCircle, Loader2, Lock, Mail } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit?: (values: LoginFormValues) => void;
  onRegisterClick?: () => void;
  onForgotPassword?: (email: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

const LoginForm = ({
  onSubmit = () => {},
  onRegisterClick = () => {},
  onForgotPassword = () => {},
  isLoading = false,
  error = null,
}: LoginFormProps) => {
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Watch the email field for forgot password functionality
  const emailValue = watch("email");

  const submitHandler = (data: LoginFormValues) => {
    onSubmit(data);
  };

  const handleForgotPassword = () => {
    if (emailValue && !errors.email) {
      onForgotPassword(emailValue);
    } else {
      setForgotPasswordEmail(emailValue);
    }
    // Navigate to forgot password page
    window.location.href = "/forgot-password";
  };

  return (
    <Card className="w-full glassmorphism border-0">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-center text-foreground/70">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-foreground/80">
                Password
              </Label>
              <Button
                variant="link"
                className="p-0 h-auto text-sm text-primary"
                type="button"
                onClick={handleForgotPassword}
                disabled={isLoading}
              >
                Forgot password?
              </Button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-foreground/40" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className={`pl-10 bg-background/50 border-border/50 ${errors.password ? "border-red-500" : ""}`}
                disabled={isLoading}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
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
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-foreground/70">
          Don't have an account?{" "}
          <Button
            variant="link"
            className="p-0 h-auto text-primary"
            onClick={onRegisterClick}
            disabled={isLoading}
          >
            Register
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
