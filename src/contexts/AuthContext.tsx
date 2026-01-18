import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, api, User, storesApi, accountsApi } from '@/services/api';

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
      const accessToken = api.getAccessToken();
      const refreshToken = api.getRefreshToken();
      const storedUser = localStorage.getItem('user');

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      // If we have a refresh token but no access token, attempt a silent refresh
      if (!accessToken && refreshToken) {
        try {
          console.log('[AuthContext] Access token missing, attempting silent refresh...');
          const refreshRes = await authApi.refreshToken(refreshToken);
          if (refreshRes && refreshRes.access) {
            api.setAccessToken(refreshRes.access);
            if (refreshRes.refresh) api.setRefreshToken(refreshRes.refresh);

            // Re-fetch user to be sure we have the latest data
            const userRes = await accountsApi.getCurrentUser();
            setUser(userRes.data);
            localStorage.setItem('user', JSON.stringify(userRes.data));
          }
        } catch (error) {
          console.error('[AuthContext] Silent refresh failed:', error);
          logout();
        }
      } else if (accessToken) {
        // We have an access token, just refresh the user profile to be safe
        try {
          const response = await accountsApi.getCurrentUser();
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          console.error('[AuthContext] Failed to fetch current user:', error);
          // If profile fetch fails with 401, the interceptor might have already handled it,
          // but if we are here, it means the session is likely dead.
          logout();
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
    try {
      const response = await accountsApi.getCurrentUser();
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error('[AuthContext] Failed to refresh user profile:', error);
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
