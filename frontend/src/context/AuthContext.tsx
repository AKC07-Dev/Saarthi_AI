import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface UserProfile {
  name: string;
  email: string;
  dob?: string;
  age?: number;
  gender?: "Male" | "Female" | "Other";
  address?: string;
  phone?: string;
}

interface AuthCtx {
  user: UserProfile | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: UserProfile & { password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

const STORAGE_KEY = "saarthi-auth";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed.user);
        setToken(parsed.token);
      } catch {/* noop */}
    }
  }, []);

  const persist = (u: UserProfile, tk: string) => {
    setUser(u); setToken(tk);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: u, token: tk }));
  };

  const login = async (email: string, _password: string) => {
    // mocked — replace with API call
    await new Promise((r) => setTimeout(r, 700));
    const mockUser: UserProfile = {
      name: email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Citizen",
      email,
      dob: "1995-06-15",
      age: 30,
      gender: "Male",
      address: "12, MG Road, Pune, Maharashtra 411001",
      phone: "+91 98xxxxxx21",
    };
    persist(mockUser, "mock-token-" + Date.now());
  };

  const register = async (data: UserProfile & { password: string }) => {
    await new Promise((r) => setTimeout(r, 800));
    const { password: _pw, ...profile } = data;
    persist(profile, "mock-token-" + Date.now());
  };

  const logout = () => {
    setUser(null); setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
