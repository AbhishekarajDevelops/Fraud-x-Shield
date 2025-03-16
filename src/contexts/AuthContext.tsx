import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { supabaseService } from "@/services/SupabaseService";

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [autoLoginEnabled] = useState<boolean>(false); // Disable auto-login by default

  useEffect(() => {
    // Clear any existing session on component mount
    const clearExistingSession = async () => {
      if (!autoLoginEnabled) {
        await supabase.auth.signOut();
      }
    };
    clearExistingSession();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsLoading(true);

      if (session?.user) {
        try {
          // Get user profile from database
          const profile = await supabaseService.getUserProfile(session.user.id);

          const userProfile: User = {
            id: session.user.id,
            email: session.user.email || "",
            name:
              profile?.name ||
              session.user.user_metadata?.name ||
              session.user.email?.split("@")[0] ||
              "",
            avatarUrl:
              profile?.avatar_url ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`,
          };

          setUser(userProfile);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUser(null);
      }

      setIsLoading(false);
    });

    // Check for existing session on load (only if auto-login is enabled)
    const checkSession = async () => {
      if (!autoLoginEnabled) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await supabase.auth.getSession();

        if (data?.session?.user) {
          try {
            // Get user profile from database
            const profile = await supabaseService.getUserProfile(
              data.session.user.id,
            );

            const userProfile: User = {
              id: data.session.user.id,
              email: data.session.user.email || "",
              name:
                profile?.name ||
                data.session.user.user_metadata?.name ||
                data.session.user.email?.split("@")[0] ||
                "",
              avatarUrl:
                profile?.avatar_url ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.session.user.email}`,
            };

            setUser(userProfile);
          } catch (error) {
            console.error("Error fetching user profile:", error);
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await supabaseService.login(email, password);
      // User state will be updated by the auth state change listener
    } catch (error: any) {
      setError(
        error.message || "Failed to login. Please check your credentials.",
      );
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await supabaseService.register(name, email, password);
      // User state will be updated by the auth state change listener
      return data;
    } catch (error: any) {
      setError(error.message || "Failed to register. Please try again.");
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);

    try {
      await supabaseService.logout();
      // User state will be updated by the auth state change listener
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
