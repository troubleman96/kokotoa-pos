import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, accountsApi, User, RegisterPayload } from '@/services/api';

const DEFAULT_USER: User = {
  id: 1,
  phone: '+255700000001',
  email: 'owner@kokotoa.local',
  first_name: 'Asha',
  last_name: 'Mwanaidi',
  role: 'OWNER',
  role_name: 'Owner',
  store: 1,
  store_name: 'Kokotoa Main Store',
  is_phone_verified: true,
  is_profile_complete: true,
  created_at: new Date().toISOString(),
  subscription_status: 'ACTIVE',
  subscription_status_display: 'Active',
  has_access: true,
  trial_days_left: 0,
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
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
  const [user, setUser] = useState<User | null>(DEFAULT_USER);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const safeStorageGet = (storage: Storage, key: string) => {
    try {
      return storage.getItem(key);
    } catch {
      return null;
    }
  };
  const safeStorageSet = (storage: Storage, key: string, value: string) => {
    try {
      storage.setItem(key, value);
    } catch {
      // Ignore storage write failures.
    }
  };
  const safeStorageRemove = (storage: Storage, key: string) => {
    try {
      storage.removeItem(key);
    } catch {
      // Ignore storage remove failures.
    }
  };
  const getPreferredStorage = () =>
    safeStorageGet(sessionStorage, 'auth_storage_mode') === 'session' ? sessionStorage : localStorage;

  useEffect(() => {
    const storedUser =
      safeStorageGet(getPreferredStorage(), 'user') ||
      safeStorageGet(localStorage, 'user') ||
      safeStorageGet(sessionStorage, 'user');

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        return;
      } catch {
        // Fall back to the default static user.
      }
    }

    setUser(DEFAULT_USER);
    safeStorageSet(localStorage, 'user', JSON.stringify(DEFAULT_USER));
  }, []);

  const login = async (phone: string, password: string, rememberMe = true) => {
    try {
      const response = await authApi.login({ phone, password });
      safeStorageSet(getPreferredStorage(), 'auth_storage_mode', rememberMe ? 'local' : 'session');
      setUser(response.data.user);
      safeStorageSet(getPreferredStorage(), 'user', JSON.stringify(response.data.user));
      navigate(response.data.user.is_profile_complete ? '/dashboard' : '/create-store');
    } catch (error: any) {
      throw error;
    }
  };

  const register = async (data: RegisterPayload) => {
    const response = await authApi.register(data);
    if (response.data.access_token) {
      setUser(response.data.user);
      safeStorageSet(getPreferredStorage(), 'user', JSON.stringify(response.data.user));
    }

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
    setUser(DEFAULT_USER);
    safeStorageSet(localStorage, 'user', JSON.stringify(DEFAULT_USER));
    navigate('/dashboard');
  };

  const refreshUser = async () => {
    try {
      const response = await accountsApi.getCurrentUser();
      setUser(response.data);
      safeStorageSet(getPreferredStorage(), 'user', JSON.stringify(response.data));
    } catch (error) {
      console.error('[AuthContext] Failed to refresh user profile:', error);
      setUser(DEFAULT_USER);
    }
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      safeStorageSet(getPreferredStorage(), 'user', JSON.stringify(updatedUser));
    }
  };

  const updateEmail = async (email: string) => {
    const response = await accountsApi.updateEmail({ email });
    if (user) {
      const updatedUser = { ...user, ...(response.data as any) };
      setUser(updatedUser);
      safeStorageSet(getPreferredStorage(), 'user', JSON.stringify(updatedUser));
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
