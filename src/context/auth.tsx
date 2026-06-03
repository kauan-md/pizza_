import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export interface UserSession {
  name: string;
  email: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: UserSession | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapSupabaseUser(supaUser: User): UserSession {
  return {
    name: supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || "Usuário",
    email: supaUser.email || "",
    avatarUrl: supaUser.user_metadata?.avatar_url || supaUser.user_metadata?.picture,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing Supabase session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
        localStorage.setItem("pizza_user", JSON.stringify(mapSupabaseUser(session.user)));
      } else {
        // Fallback to localStorage
        const savedUser = localStorage.getItem("pizza_user");
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch {
            localStorage.removeItem("pizza_user");
          }
        }
      }
      setIsLoading(false);
    });

    // Listen for auth state changes (SIGNED_IN / SIGNED_OUT / TOKEN_REFRESHED)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = mapSupabaseUser(session.user);
        setUser(u);
        localStorage.setItem("pizza_user", JSON.stringify(u));
      } else {
        setUser(null);
        localStorage.removeItem("pizza_user");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate API request delay
    await new Promise((resolve) => setTimeout(resolve, 1200));
    
    // Create a mock user based on email (or default name if not matched)
    const name = email.split("@")[0];
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
    
    const mockUser: UserSession = {
      name: capitalizedName,
      email: email,
    };
    
    setUser(mockUser);
    localStorage.setItem("pizza_user", JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    // Simulate API request delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const mockUser: UserSession = {
      name: name,
      email: email,
    };
    
    setUser(mockUser);
    localStorage.setItem("pizza_user", JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          prompt: "select_account",
        },
      },
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem("pizza_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
