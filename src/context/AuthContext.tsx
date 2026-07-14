'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  phone: string | null;
  isLoggedIn: boolean;
  login: (phone: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  phone: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [phone, setPhone] = useState<string | null>(null);

  useEffect(() => {
    // Load persisted login on mount
    const saved = localStorage.getItem('chotu_customer_phone');
    if (saved) setPhone(saved);
  }, []);

  const login = (ph: string) => {
    localStorage.setItem('chotu_customer_phone', ph);
    setPhone(ph);
  };

  const logout = () => {
    localStorage.removeItem('chotu_customer_phone');
    setPhone(null);
  };

  return (
    <AuthContext.Provider value={{ phone, isLoggedIn: !!phone, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
