import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, api, User, storesApi, accountsApi, RegisterPayload } from '@/services/api';

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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
    const initAuth = async () => {
      console.log('[AuthContext] Start initAuth');
      const accessToken = api.getAccessToken();
      const refreshToken = api.getRefreshToken();
      const storedUser =
        safeStorageGet(getPreferredStorage(), 'user') ||
        safeStorageGet(localStorage, 'user') ||
        safeStorageGet(sessionStorage, 'user');

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
              safeStorageSet(getPreferredStorage(), 'user', JSON.stringify(userRes.data));
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
            safeStorageSet(getPreferredStorage(), 'user', JSON.stringify(response.data));
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

  const login = async (phone: string, password: string, rememberMe = true) => {
    console.log('[AuthContext] login called for phone:', phone, 'password length:', password.length);
    try {
      console.log('[AuthContext] Sending login request to API...');
      const response = await authApi.login({ phone, password });
      console.log('[AuthContext] Login response received:', JSON.stringify(response, null, 2));
      console.log('[AuthContext] Setting tokens...');
      api.setAccessToken(response.data.access_token, rememberMe);
      api.setRefreshToken(response.data.refresh_token, rememberMe);
      setUser(response.data.user);
      safeStorageSet(getPreferredStorage(), 'user', JSON.stringify(response.data.user));

      const isWorker = response.data.user.role === 'CASHIER' || response.data.user.role === 'STAFF';
      if (isWorker) {
        window.location.href = 'https://worker-pos.kokotoa.online';
        return;
      }

      // Profile completion logic
      if (response.data.user.is_profile_complete) {
        navigate('/dashboard');
      } else {
        navigate('/create-store');
      }
    } catch (error: any) {
      console.error('[AuthContext] Login error caught:', error);
      if (error?.errors?.requires_phone_verification || error?.requires_phone_verification) {
        console.log('[AuthContext] Redirecting to phone verification');
        navigate('/verify-phone', { state: { phone } });
      }
      throw error;
    }
  };

  const register = async (data: RegisterPayload) => {
    const response = await authApi.register(data);

    // New flow: Registration returns tokens directly
    if (response.data.access_token) {
      api.setAccessToken(response.data.access_token);
      api.setRefreshToken(response.data.refresh_token);
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
    console.log('[AuthContext] Performing logout');
    api.setAccessToken(null);
    api.setRefreshToken(null);
    setUser(null);
    safeStorageRemove(localStorage, 'user');
    safeStorageRemove(sessionStorage, 'user');
    navigate('/dashboard');
  };

  const refreshUser = async () => {
    try {
      const response = await accountsApi.getCurrentUser();
      setUser(response.data);
      safeStorageSet(getPreferredStorage(), 'user', JSON.stringify(response.data));
    } catch (error) {
      console.error('[AuthContext] Failed to refresh user profile:', error);
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
      // Merge the updated email into the existing user object
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
