import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, api, User } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (data: { phone: string; password: string; password_confirm: string; first_name: string; last_name: string }) => Promise<void>;
  verifyOtp: (phone: string, otpCode: string) => Promise<{ can_create_store: boolean }>;
  resendOtp: (phone: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const token = api.getAccessToken();
      if (token) {
        try {
          const response = await authApi.login({ phone: '', password: '' });
          setUser(response.user);
        } catch {
          api.setAccessToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (phone: string, password: string) => {
    const response = await authApi.login({ phone, password });
    api.setAccessToken(response.access_token);
    setUser(response.user);
    if (response.user.is_store_created) {
      navigate('/pos');
    } else {
      navigate('/create-store');
    }
  };

  const register = async (data: { phone: string; password: string; password_confirm: string; first_name: string; last_name: string }) => {
    await authApi.register(data);
    navigate('/verify-otp', { state: { phone: data.phone, isRegistration: true } });
  };

  const verifyOtp = async (phone: string, otpCode: string) => {
    const response = await authApi.verifyOtp({ phone, otp_code: otpCode });
    if (response.data.can_create_store) {
      navigate('/create-store');
    } else {
      navigate('/dashboard');
    }
    return response.data;
  };

  const resendOtp = async (phone: string) => {
    await authApi.resendOtp({ phone });
  };

  const logout = () => {
    api.setAccessToken(null);
    setUser(null);
    navigate('/login');
  };

  const refreshUser = async () => {
    const token = api.getAccessToken();
    if (token) {
      try {
        const response = await authApi.login({ phone: '', password: '' });
        setUser(response.user);
      } catch {
        api.setAccessToken(null);
        setUser(null);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, verifyOtp, resendOtp, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
