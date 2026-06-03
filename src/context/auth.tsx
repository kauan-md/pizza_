import React, { createContext, useContext, useState, useEffect } from "react";

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("pizza_lopez_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("pizza_lopez_user");
      }
    }
    setIsLoading(false);
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
    localStorage.setItem("pizza_lopez_user", JSON.stringify(mockUser));
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
    localStorage.setItem("pizza_lopez_user", JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    // Simulate Google OAuth flow delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const mockUser: UserSession = {
      name: "Cliente Google",
      email: "cliente.google@gmail.com",
      avatarUrl: "https://lh3.googleusercontent.com/a/default-user=s96-c",
    };
    
    setUser(mockUser);
    localStorage.setItem("pizza_lopez_user", JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("pizza_lopez_user");
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
