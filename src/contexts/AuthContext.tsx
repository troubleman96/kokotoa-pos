import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, api, User, storesApi } from '@/services/api';

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
      const storedUser = localStorage.getItem('user');

      // Sync tokens for compatibility if one is missing
      if (token) {
        if (!localStorage.getItem('jwt_token')) localStorage.setItem('jwt_token', token);
        if (!localStorage.getItem('access_token')) localStorage.setItem('access_token', token);
      }

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      if (token && storedUser) {
        try {
          const response = await authApi.getCurrentUser();
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch {
          api.setAccessToken(null);
          api.setRefreshToken(null);
          setUser(null);
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (phone: string, password: string) => {
    const response = await authApi.login({ phone, password });
    api.setAccessToken(response.data.access_token);
    api.setRefreshToken(response.data.refresh_token);
    setUser(response.data.user);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    // Profile completion logic
    if (response.data.user.is_profile_complete) {
      navigate('/dashboard');
    } else if (response.data.user.is_phone_verified) {
      navigate('/create-store');
    } else {
      navigate('/verify-otp', { state: { phone, isRegistration: false } });
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
    api.setRefreshToken(null);
    setUser(null);
    navigate('/login');
  };

  const refreshUser = async () => {
    const token = api.getAccessToken();
    if (token) {
      try {
        const response = await authApi.getCurrentUser();
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      } catch {
        api.setAccessToken(null);
        api.setRefreshToken(null);
        setUser(null);
        localStorage.removeItem('user');
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
