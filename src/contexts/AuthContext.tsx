import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, api, User, storesApi, accountsApi } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (data: { phone: string; password: string; password_confirm: string; first_name: string; last_name: string }) => Promise<void>;
  verifyOtp: (phone: string, otpCode: string) => Promise<{ can_create_store: boolean; subscription_status?: string }>;
  requestPhoneVerification: (phone: string) => Promise<void>;
  resendOtp: (phone: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  updateEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      console.log('[AuthContext] Start initAuth');
      const accessToken = api.getAccessToken();
      const refreshToken = api.getRefreshToken();
      const storedUser = localStorage.getItem('user');

      if (storedUser) {
        console.log('[AuthContext] Setting initial user from localStorage');
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('[AuthContext] Failed to parse stored user', e);
        }
      }

      try {
        if (!accessToken && refreshToken) {
          console.log('[AuthContext] Access token missing, attempting silent refresh...');
          try {
            const refreshRes = await authApi.refreshToken(refreshToken) as any;
            const newAccess = refreshRes?.data?.access || refreshRes?.access || refreshRes?.data?.access_token || refreshRes?.access_token;
            const newRefresh = refreshRes?.data?.refresh || refreshRes?.refresh || refreshRes?.data?.refresh_token || refreshRes?.refresh_token;

            if (newAccess) {
              console.log('[AuthContext] Silent refresh success');
              api.setAccessToken(newAccess);
              if (newRefresh) api.setRefreshToken(newRefresh);

              const userRes = await accountsApi.getCurrentUser();
              setUser(userRes.data);
              localStorage.setItem('user', JSON.stringify(userRes.data));
            }
          } catch (refreshErr) {
            console.error('[AuthContext] Silent refresh failed:', refreshErr);
            // Don't auto-logout here, let the user stay in "optimistic" mode
            // If the session is truly dead, API calls will return 401 anyway
          }
        } else if (accessToken) {
          console.log('[AuthContext] Access token present, validating session in background...');
          // Validate in background, don't block login if we have a stored user
          accountsApi.getCurrentUser().then(response => {
            console.log('[AuthContext] Session validated');
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
          }).catch(err => {
            console.error('[AuthContext] Background session validation failed:', err);
            // If it's a 401, we might want to logout, but for general network errors, keep the session
            if (err.message && (err.message.includes('401') || err.message.includes('unauthorized'))) {
              logout();
            }
          });
        }
      } catch (error) {
        console.error('[AuthContext] Auth initialization error (outer):', error);
      } finally {
        setIsLoading(false);
        console.log('[AuthContext] initAuth complete');
      }
    };
    initAuth();
  }, []);

  const login = async (phone: string, password: string) => {
    console.log('[AuthContext] login called for phone:', phone);
    try {
      const response = await authApi.login({ phone, password });
      console.log('[AuthContext] Login response received:', response);
      api.setAccessToken(response.data.access_token);
      api.setRefreshToken(response.data.refresh_token);
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Profile completion logic
      if (response.data.user.is_profile_complete) {
        navigate('/dashboard');
      } else {
        navigate('/create-store');
      }
    } catch (error: any) {
      if (error?.errors?.requires_phone_verification) {
        navigate('/verify-phone', { state: { phone } });
      }
      throw error;
    }
  };

  const register = async (data: { phone: string; password: string; password_confirm: string; first_name: string; last_name: string }) => {
    const response = await authApi.register(data);
    api.setAccessToken(response.data.access_token);
    api.setRefreshToken(response.data.refresh_token);
    setUser(response.data.user);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    navigate('/create-store');
  };

  const requestPhoneVerification = async (phone: string) => {
    await authApi.requestPhoneVerification({ phone });
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
    console.log('[AuthContext] Performing logout');
    api.setAccessToken(null);
    api.setRefreshToken(null);
    setUser(null);
    localStorage.removeItem('user');
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

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const updateEmail = async (email: string) => {
    const response = await accountsApi.updateEmail({ email });
    if (user) {
      const updatedUser = { ...user, email: response.data.email };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      verifyOtp,
      requestPhoneVerification,
      resendOtp,
      logout,
      refreshUser,
      updateUser,
      updateEmail
    }}>
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
