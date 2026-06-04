import React, { createContext, useContext, useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: UserSession | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapSupabaseUser(supaUser: User): UserSession {
  return {
    id: supaUser.id,
    name: supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || "Usuário",
    email: supaUser.email || "",
    avatarUrl: supaUser.user_metadata?.avatar_url || supaUser.user_metadata?.picture,
  };
}

function fallbackToLocalStorage() {
  const savedUser = localStorage.getItem("pizza_user");
  if (savedUser) {
    try {
      return JSON.parse(savedUser) as UserSession;
    } catch {
      localStorage.removeItem("pizza_user");
    }
  }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const supabase = getSupabase();

    if (!supabase) {
      setUser(fallbackToLocalStorage());
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
        localStorage.setItem("pizza_user", JSON.stringify(mapSupabaseUser(session.user)));
      } else {
        setUser(fallbackToLocalStorage());
      }
      setIsLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = mapSupabaseUser(session.user);
        setUser(u);
        localStorage.setItem("pizza_user", JSON.stringify(u));
      } else {
        setUser(null);
        localStorage.removeItem("pizza_user");
      }
    });
    subscription = data.subscription;

    return () => subscription?.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const supabase = getSupabase();
    if (!supabase) throw new Error("Supabase não configurado");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const register = async (name: string, email: string, password: string) => {
    const supabase = getSupabase();
    if (!supabase) throw new Error("Supabase não configurado");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw error;
  };

  const logout = async () => {
    try {
      const supabase = getSupabase();
      if (supabase) await supabase.auth.signOut();
    } catch {
      // se Supabase não estiver configurado, limpa estado local
    }
    setUser(null);
    localStorage.removeItem("pizza_user");
  };

  const forgotPassword = async (email: string) => {
    const supabase = getSupabase();
    if (!supabase) throw new Error("Supabase não configurado");
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    const supabase = getSupabase();
    if (!supabase) throw new Error("Supabase não configurado");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        forgotPassword,
        updatePassword,
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
