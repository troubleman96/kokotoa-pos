import Cookies from 'js-cookie';

const normalizeApiBaseUrl = (rawUrl?: string) => {
  if (!rawUrl) return '/api';

  const runtimeHost = typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
  const fallbackHost = runtimeHost && runtimeHost !== '0.0.0.0' ? runtimeHost : '127.0.0.1';

  try {
    const parsedUrl = new URL(rawUrl);
    if (parsedUrl.hostname === '0.0.0.0') {
      parsedUrl.hostname = fallbackHost;
    }
    return parsedUrl.toString().replace(/\/$/, '');
  } catch {
    return rawUrl.replace('://0.0.0.0', `://${fallbackHost}`).replace(/\/$/, '');
  }
};

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);
if (import.meta.env.DEV) {
  console.log('[API] Base URL:', API_BASE_URL);
}

const getSharedCookieDomain = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const { hostname } = window.location;
  const isIpAddress = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname);

  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    isIpAddress
  ) {
    return undefined;
  }

  if (hostname === 'kokotoa.online' || hostname.endsWith('.kokotoa.online')) {
    return '.kokotoa.online';
  }

  return undefined;
};

const getCookieBaseOptions = () => {
  const isSecure = typeof window !== 'undefined' ? window.location.protocol === 'https:' : false;
  const domain = getSharedCookieDomain();

  return {
    path: '/',
    secure: isSecure,
    sameSite: 'lax' as const,
    ...(domain ? { domain } : {}),
  };
};

const removeCookieEverywhere = (name: string) => {
  Cookies.remove(name, { path: '/' });

  const domain = getSharedCookieDomain();
  if (domain) {
    Cookies.remove(name, { path: '/', domain });
  }
};

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    token_type: string;
    user: User;
  };
  errors: any;
}

export interface RegisterPayload {
  phone: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  promo_code?: string;
  email?: string;
}


interface SubscriptionPackage {
  id: number;
  name: string;
  description?: string;
  price: number;
  price_display: string;
  duration_days: number;
  max_stores: number;
  max_users_per_store: number;
  max_products: number;
  has_analytics: boolean;
  has_multi_store: boolean;
  has_sms_notifications?: boolean;
}

interface SubscriptionStatus {
  status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'BLOCKED';
  status_display: string;
  has_access: boolean;
  trial_start: string;
  trial_end: string;
  trial_days_left?: number | null;
  subscription_activated: string | null;
  days_remaining?: number; // legacy support if needed
  subscription?: {
    package?: SubscriptionPackage | null;
    expires_at?: string | null;
    payment_reference?: string | null;
    granted_at?: string;
  } | null;
  message?: string; // For error/info cases
}

interface User {
  id: number;
  phone: string;
  email?: string;
  first_name: string;
  last_name: string;
  role: 'OWNER' | 'CASHIER' | 'STAFF' | null;
  role_name: string | null;
  store: number | null;
  store_name?: string | null;
  is_phone_verified: boolean;
  is_profile_complete: boolean;
  created_at: string;
  // Subscription fields
  subscription_status?: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'BLOCKED';
  subscription_status_display?: string;
  has_access?: boolean;
  trial_start_date?: string;
  trial_end_date?: string;
  subscription_activated_at?: string;
  trial_days_left?: number | null;
}

class ApiService {
  private accessToken: string | null = null;
  private refreshPromise: Promise<boolean> | null = null;

  setAccessToken(token: string | null) {
    this.accessToken = token;
    if (token) {
      Cookies.set('access_token', token, getCookieBaseOptions());
      localStorage.setItem('jwt_token', token);
      localStorage.setItem('access_token', token);
    } else {
      removeCookieEverywhere('access_token');
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('access_token');
    }
  }

  getAccessToken(): string | null {
    if (this.accessToken) return this.accessToken;
    const token = Cookies.get('access_token') || localStorage.getItem('jwt_token') || localStorage.getItem('access_token');
    if (token) this.accessToken = token;
    return token;
  }

  setRefreshToken(token: string | null) {
    if (token) {
      Cookies.set('refresh_token', token, { ...getCookieBaseOptions(), expires: 30 });
      localStorage.setItem('refresh_token', token); // Fallback
    } else {
      removeCookieEverywhere('refresh_token');
      localStorage.removeItem('refresh_token');
    }
  }

  getRefreshToken(): string | null {
    return Cookies.get('refresh_token') || localStorage.getItem('refresh_token');
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) return false;

      try {
        const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!response.ok) {
          return false;
        }

        const refreshRes = await response.json();
        const newAccess =
          refreshRes?.data?.access ||
          refreshRes?.access ||
          refreshRes?.data?.access_token ||
          refreshRes?.access_token;
        const newRefresh =
          refreshRes?.data?.refresh ||
          refreshRes?.refresh ||
          refreshRes?.data?.refresh_token ||
          refreshRes?.refresh_token;

        if (!newAccess) {
          return false;
        }

        this.setAccessToken(newAccess);
        if (newRefresh) this.setRefreshToken(newRefresh);
        return true;
      } catch (error) {
        console.error('[API] Silent refresh failed:', error);
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private getHeaders(isFormData = false): HeadersInit {
    const headers: HeadersInit = isFormData ? {} : { 'Content-Type': 'application/json' };
    const token = this.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // Add cache control headers - REMOVED due to CORS issues
    // headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    // headers['Pragma'] = 'no-cache';
    // headers['Expires'] = '0';

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit, retry = true): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, options);

    // Auto-refresh logic on 401 (but don't retry if the refresh request itself fails)
    if (response.status === 401 && retry && endpoint !== '/auth/token/refresh/') {
      console.log('[API] 401 Unauthorized, attempting silent refresh...');
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        // Retry original request once with new token
        const newOptions = {
          ...options,
          headers: this.getHeaders(options.body instanceof FormData)
        };
        return this.request<T>(endpoint, newOptions, false);
      }

      this.setAccessToken(null);
      this.setRefreshToken(null);
    }

    return this.handleResponse<T>(response);
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    // Handle 204 No Content and empty responses for successful status codes
    if (response.status === 204) {
      return { success: true, message: 'Operation successful' } as unknown as T;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log(`[API] Response Data:`, data);

      if (!response.ok) {
        console.error(`[API] Error Response:`, data);
        // Throw the entire data object so we can access 'errors' property
        throw data;
      }
      return data;
    }

    // Handle other successful responses that might not be JSON
    if (response.ok) {
      const text = await response.text();
      try {
        // Fallback for cases where content-type might be missing but body is JSON
        return JSON.parse(text) as T;
      } catch {
        return { success: true, message: text || 'Operation successful' } as unknown as T;
      }
    }

    const text = await response.text();
    console.error(`[API] Non-JSON Error Response:`, text);
    throw new Error(text || 'An error occurred');
  }

  async post<T>(endpoint: string, body: object): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
  }

  async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: formData,
    });
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  async put<T>(endpoint: string, body: object): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
  }

  async patch<T>(endpoint: string, body: object): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
  }
}

export const api = new ApiService();

export const authApi = {
  register: (data: RegisterPayload) =>
    api.post<AuthResponse & { errors: any }>('/auth/register/', data),

  verifyOtp: (data: { phone: string; otp_code: string }) =>
    api.post<{ success: boolean; message: string; data: { user_id: number; phone: string; is_phone_verified: boolean; can_create_store: boolean; is_profile_complete: boolean; subscription_status?: string }; errors: any }>('/auth/verify-otp/', data),

  requestPhoneVerification: (data: { phone: string }) =>
    api.post<{ success: boolean; message: string; data: { phone: string; otp_sent: boolean }; errors: any }>('/auth/request-phone-verification/', data),

  resendOtp: (data: { phone: string }) =>
    api.post<{ success: boolean; message: string; errors: any }>('/auth/resend-otp/', data),

  login: (data: { phone: string; password: string }) =>
    api.post<AuthResponse & { errors: any }>('/auth/login/', data),

  refreshToken: (refresh: string) =>
    api.post<{ access: string; refresh: string; token_type: string; success: boolean; message: string; errors: any }>('/auth/token/refresh/', { refresh }),

  requestPasswordReset: (data: { phone: string }) =>
    api.post<{ success: boolean; message: string; errors: any }>('/auth/password/reset/', data),

  resetPassword: (data: { phone: string; otp_code: string; new_password: string; new_password_confirm: string }) =>
    api.post<{ success: boolean; message: string; errors: any }>('/auth/password/reset/confirm/', data),

  changePassword: (data: { old_password: string; new_password: string; new_password_confirm: string }) =>
    api.post<{ success: boolean; message: string; errors: any }>('/auth/password/change/', data),
};

export const accountsApi = {
  changeName: (data: { first_name: string; last_name: string }) =>
    api.post<{ success: boolean; message: string; data: { first_name: string; last_name: string }; errors: any }>('/accounts/profile/change-name/', data),

  getCurrentUser: () =>
    api.get<{ success: boolean; message: string; data: User; errors: any }>('/accounts/profile/'),

  updateProfile: (data: Partial<User>) =>
    api.patch<{ success: boolean; message: string; data: User; errors: any }>('/accounts/profile/', data),

  updateEmail: (data: { email: string }) =>
    api.put<{ success: boolean; message: string; data: { email: string }; errors: any }>('/accounts/profile/update-email/', data),
};

export const subscriptionApi = {
  getPackages: () =>
    api.get<{ success: boolean; message: string; data: SubscriptionPackage[]; errors: any }>('/subscriptions/packages/'),

  getStatus: () =>
    api.get<{ success: boolean; message: string; data: SubscriptionStatus; errors: any }>('/subscriptions/status/'),
};

export const storesApi = {
  create: (data: { name: string; location: string; details?: string; phone_number: string }) =>
    api.post<{ success: boolean; message: string; data: { store: Store; user?: { id: number; is_profile_complete: boolean; role: string } }; errors: any }>('/stores/create/', data),

  list: () =>
    api.get<{ success: boolean; message: string; data: Store[]; errors: any }>('/stores/management/'),

  get: (id: number) =>
    api.get<{ success: boolean; message: string; data: Store & { user_count: number }; errors: any }>(`/stores/management/${id}/`),

  update: (id: number, data: Partial<Store>) =>
    api.put<{ success: boolean; message: string; data: Store; errors: any }>(`/stores/management/${id}/`, data),

  patch: (id: number, data: Partial<Store>) =>
    api.patch<{ success: boolean; message: string; data: Store; errors: any }>(`/stores/management/${id}/`, data),

  delete: (id: number) =>
    api.delete<{ success: boolean; message: string; errors: any }>(`/stores/management/${id}/`),
};

export const usersApi = {
  list: () =>
    api.get<{ success: boolean; message: string; data: User[]; errors: any }>('/accounts/users/'),

  add: (data: { phone: string; password: string; first_name: string; last_name: string; role: string }) =>
    api.post<{ success: boolean; message: string; data: User; errors: any }>('/accounts/users/add-user/', data),

  get: (id: number) =>
    api.get<{ success: boolean; message: string; data: User; errors: any }>(`/accounts/users/${id}/`),

  update: (id: number, data: Partial<User> & { is_active?: boolean }) =>
    api.put<{ success: boolean; message: string; data: User; errors: any }>(`/accounts/users/${id}/`, data),

  delete: (id: number) =>
    api.delete<{ success: boolean; message: string; errors: any }>(`/accounts/users/${id}/`),
};

export const productsApi = {
  list: (params?: { category?: string; low_stock?: boolean; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.low_stock) queryParams.append('low_stock', 'true');
    if (params?.search) queryParams.append('search', params.search);
    const query = queryParams.toString();
    return api.get<{ success: boolean; message: string; data: Product[]; errors: any }>(`/inventory/products/${query ? `?${query}` : ''}`);
  },

  create: (formData: FormData) =>
    api.postFormData<{ success: boolean; message: string; data: Product; errors: any }>('/inventory/products/', formData),

  get: (id: number) =>
    api.get<{ success: boolean; message: string; data: Product; errors: any }>(`/inventory/products/${id}/`),

  update: (id: number, data: Record<string, unknown>) =>
    api.put<{ success: boolean; message: string; data: Product; errors: any }>(`/inventory/products/${id}/`, data),

  delete: (id: number) =>
    api.delete<{ success: boolean; message: string; errors: any }>(`/inventory/products/${id}/`),

  getLowStock: () =>
    api.get<{ success: boolean; message: string; data: Product[]; errors: any }>('/inventory/products/low-stock/'),

  getCategories: () =>
    api.get<{ success: boolean; message: string; data: { categories: string[] }; errors: any }>('/inventory/products/categories/'),

  adjustStock: (data: { product_id: number; movement_type: 'IN' | 'OUT' | 'ADJUST'; quantity: number; reason?: string; reference?: string }) =>
    api.post<{ success: boolean; message: string; data: StockMovement; errors: any }>('/inventory/products/adjust-stock/', data),

  bulkAdjustStock: (data: { adjustments: Array<{ product_id: number; movement_type: 'IN' | 'OUT' | 'ADJUST'; quantity: number; reason?: string }> }) =>
    api.post<{ success: boolean; message: string; data: { adjustments_count: number }; errors: any }>('/inventory/products/bulk-adjust-stock/', data),
};

export const stockMovementsApi = {
  list: () =>
    api.get<{ success: boolean; message: string; data: StockMovement[]; errors: any }>('/inventory/stock-movements/'),

  get: (id: number) =>
    api.get<{ success: boolean; message: string; data: StockMovement; errors: any }>(`/inventory/stock-movements/${id}/`),
};

export const receiptsApi = {
  list: () =>
    api.get<{ success: boolean; message: string; data: Array<{ id: number; receipt_number: string; receipt_text: string; printed_at: string | null; created_at: string }>; errors: any }>('/pos/receipts/'),

  get: (id: number) =>
    api.get<{ success: boolean; message: string; data: { id: number; receipt_number: string; receipt_text: string; printed_at: string | null; created_at: string }; errors: any }>(`/pos/receipts/${id}/`),
};

export const salesApi = {
  list: (params?: { date_from?: string; date_to?: string; payment_method?: string; is_returned?: boolean; has_outstanding_balance?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);
    if (params?.payment_method) queryParams.append('payment_method', params.payment_method);
    if (params?.is_returned !== undefined) queryParams.append('is_returned', String(params.is_returned));
    if (params?.has_outstanding_balance !== undefined) queryParams.append('has_outstanding_balance', String(params.has_outstanding_balance));
    const query = queryParams.toString();
    return api.get<{ success: boolean; message: string; data: { sales: Sale[]; summary: { total_sales: number; transaction_count: number } }; errors: any }>(`/pos/sales${query ? `?${query}` : ''}`);
  },

  create: (data: { items: Array<{ product_id: number; quantity: number; unit_price: number; discount_percent?: number }>; payment_method: string; payment_reference?: string; customer_phone?: string; customer_name?: string; notes?: string; discount_amount?: number; tax_amount?: number }) =>
    api.post<{ success: boolean; message: string; data: Sale; errors: any }>('/pos/sales/', data),

  recordCreditPayment: (data: { sale: number; amount: number; payment_method?: 'CASH' | 'MOBILE_MONEY' | 'BANK' | 'CREDIT'; payment_reference?: string }) =>
    api.post<{ success: boolean; message: string; data: any; errors: any }>('/pos/credit-payments/', data),

  get: (id: number) =>
    api.get<{ success: boolean; message: string; data: Sale; errors: any }>(`/pos/sales/${id}/`),

  return: (id: number, reason: string) =>
    api.post<{ success: boolean; message: string; data: Sale; errors: any }>(`/pos/sales/${id}/return/`, { reason }),

  getReceipt: (id: number) =>
    api.get<{ success: boolean; message: string; data: { id: number; receipt_number: string; receipt_text: string; printed_at: string | null; created_at: string }; errors: any }>(`/pos/sales/${id}/receipt/`),
};



export const reportsApi = {
  getSales: (params?: { date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);
    const query = queryParams.toString();
    return api.get<{ success: boolean; message: string; data: SalesReport; errors: any }>(`/reports/sales${query ? `?${query}` : ''}`);
  },

  getSaleDetail: (id: number) =>
    api.get<{ success: boolean; message: string; data: Sale; errors: any }>(`/reports/sales/${id}/`),

  getProfit: (params?: { date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);
    const query = queryParams.toString();
    return api.get<{ success: boolean; message: string; data: ProfitReport; errors: any }>(`/reports/profit${query ? `?${query}` : ''}`);
  },

  getInventory: () =>
    api.get<{ success: boolean; message: string; data: InventoryReport; errors: any }>('/reports/inventory/'),

  getDailySummary: (date?: string) =>
    api.get<{ success: boolean; message: string; data: DailySummaryReport; errors: any }>(`/reports/daily-summary${date ? `?date=${date}` : ''}`),

  getCredit: (params?: { date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);
    const query = queryParams.toString();
    return api.get<{
      success: boolean;
      message: string;
      data: {
        summary: {
          total_credit_amount: number;
          total_outstanding_debt: number;
          total_recovered_amount: number;
          recovery_rate: number;
          transaction_count: number;
        };
        trend: Array<{ date: string; total: number }>;
        top_customers: Array<{ customer_name: string; customer_phone: string; total: number; outstanding: number; count: number }>;
        period: { start: string; end: string };
      };
      errors: any;
    }>(`/reports/credit${query ? `?${query}` : ''}`);
  },

  getDiscounts: (params?: { date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);
    const query = queryParams.toString();
    return api.get<{
      success: boolean;
      message: string;
      data: {
        summary: { total_discount_amount: number; average_discount_per_sale: number; discount_ratio: number; transaction_count: number };
        trend: Array<{ date: string; total: number }>;
        period: { start: string; end: string };
      };
      errors: any;
    }>(`/reports/discounts${query ? `?${query}` : ''}`);
  },

  getAnalyticsTrend: (params?: { date_from?: string; date_to?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);
    const query = queryParams.toString();
    return api.get<{
      success: boolean;
      message: string;
      data: { trends: Array<{ date: string; sales: number; profit: number; discounts: number; credit: number }> };
      errors: any;
    }>(`/reports/analytics-trend${query ? `?${query}` : ''}`);
  },
};

export const notebookApi = {
  list: (params?: {
    search?: string;
    category?: 'expense' | 'debt' | 'useful' | 'general';
    folder?: string;
    is_pinned?: boolean;
    is_archived?: boolean;
    page?: number;
    page_size?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.folder) queryParams.append('folder', params.folder);
    if (params?.is_pinned !== undefined) queryParams.append('is_pinned', String(params.is_pinned));
    if (params?.is_archived !== undefined) queryParams.append('is_archived', String(params.is_archived));
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.page_size) queryParams.append('page_size', String(params.page_size));
    const query = queryParams.toString();

    return api.get<{
      success: boolean;
      message: string;
      data: {
        notes: Note[];
        summary?: { count: number; pinned_count: number };
      };
      errors: any;
    }>(`/notebook/notes/${query ? `?${query}` : ''}`);
  },

  create: (data: {
    title: string;
    content?: string;
    category?: 'expense' | 'debt' | 'useful' | 'general';
    folder?: string;
    tags?: string[];
    is_pinned?: boolean;
  }) =>
    api.post<{ success: boolean; message: string; data: Note; errors: any }>('/notebook/notes/', data),

  get: (id: number) =>
    api.get<{ success: boolean; message: string; data: Note; errors: any }>(`/notebook/notes/${id}/`),

  update: (id: number, data: Partial<Pick<Note, 'title' | 'content' | 'category' | 'folder' | 'tags' | 'is_pinned' | 'is_archived'>>) =>
    api.patch<{ success: boolean; message: string; data: Note; errors: any }>(`/notebook/notes/${id}/`, data),

  delete: (id: number) =>
    api.delete<{ success: boolean; message: string; errors: any }>(`/notebook/notes/${id}/`),

  getFolders: () =>
    api.get<{ success: boolean; message: string; data: { folders: string[] }; errors: any }>('/notebook/notes/folders/'),

  export: (params?: {
    search?: string;
    category?: 'expense' | 'debt' | 'useful' | 'general';
    folder?: string;
    is_pinned?: boolean;
    is_archived?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.folder) queryParams.append('folder', params.folder);
    if (params?.is_pinned !== undefined) queryParams.append('is_pinned', String(params.is_pinned));
    if (params?.is_archived !== undefined) queryParams.append('is_archived', String(params.is_archived));
    const query = queryParams.toString();

    return api.get<{
      success: boolean;
      message: string;
      data: {
        notes: Note[];
      };
      errors: any;
    }>(`/notebook/notes/export/${query ? `?${query}` : ''}`);
  },
};

export const graphsApi = {
  getDailySales: (days?: number) =>
    api.get<{ success: boolean; message: string; data: { data: number[]; labels: string[]; period: { start: string; end: string; days: number }; summary: { total_sales: number; transaction_count: number; average_sale: number } }; errors: any }>(`/graphs/daily-sales${days ? `?days=${days}` : ''}`),

  getTopProducts: (params?: { limit?: number; days?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.days) queryParams.append('days', String(params.days));
    const query = queryParams.toString();
    return api.get<{ success: boolean; message: string; data: { data: Array<{ rank: number; sku: string; name: string; quantity_sold: number; revenue: number; profit: number; transactions: number }>; period: { start: string; end: string; days: number }; summary: { total_items_sold: number } }; errors: any }>(`/graphs/top-products${query ? `?${query}` : ''}`);
  },

  getLowStock: () =>
    api.get<{ success: boolean; message: string; data: { data: Array<{ id: number; sku: string; name: string; category: string; current_stock: number; minimum_stock: number; unit: string; status: string }>; count: number; message: string }; errors: any }>('/graphs/low-stock/'),

  getPaymentMethods: (days?: number) =>
    api.get<{ success: boolean; message: string; data: { data: number[]; labels: string[]; period: { start: string; end: string; days: number }; summary: { total_sales: number; transaction_count: number } }; errors: any }>(`/graphs/payment-methods${days ? `?days=${days}` : ''}`),

  getSalesByHour: (days?: number) =>
    api.get<{ success: boolean; message: string; data: { data: number[]; labels: string[]; period: { start: string; end: string; days: number }; summary: { total_sales: number; transaction_count: number; peak_hour: string } }; errors: any }>(`/graphs/sales-by-hour${days ? `?days=${days}` : ''}`),

  getInventoryValue: () =>
    api.get<{ success: boolean; message: string; data: { data: number[]; labels: string[]; summary: { total_cost_value: number; total_retail_value: number; potential_profit: number; item_count: number } }; errors: any }>('/graphs/inventory-value/'),


  getDashboard: () =>
    api.get<{ success: boolean; message: string; data: { today: { sales: number; profit: number; transactions: number; profit_margin: number }; this_month: { sales: number; profit: number; transactions: number; profit_margin: number }; inventory: { low_stock_count: number; total_products: number }; store: { name: string } }; errors: any }>('/graphs/dashboard/'),


  getDailyProfit: (days?: number) =>
    api.get<{ success: boolean; message: string; data: { data: number[]; labels: string[]; period: { start: string; end: string; days: number }; summary: { total_profit: number; total_sales: number; transaction_count: number; average_profit: number; profit_margin: number } }; errors: any }>(`/graphs/daily-profit${days ? `?days=${days}` : ''}`),

  getMonthlyProfit: (months?: number) =>
    api.get<{ success: boolean; message: string; data: { data: number[]; labels: string[]; summary: { total_profit: number; average_monthly_profit: number } }; errors: any }>(`/graphs/monthly-profit${months ? `?months=${months}` : ''}`),

  getMonthlySales: (months?: number) =>
    api.get<{ success: boolean; message: string; data: { data: number[]; labels: string[]; summary: { total_sales: number; average_monthly_sales: number } }; errors: any }>(`/graphs/monthly-sales${months ? `?months=${months}` : ''}`),
};

export interface Store {
  id: number;
  name: string;
  location: string;
  details?: string;
  phone_number: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  unit: string;
  cost_price: string;
  selling_price: string;
  quantity: number;
  minimum_stock: number;
  is_active: boolean;
  image: string | null;
  image_url: string | null;
  qr_code_url: string | null;
  is_low_stock: boolean;
  profit_margin: string;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: number;
  product: number;
  product_name: string;
  product_sku: string;
  movement_type: 'IN' | 'OUT' | 'ADJUST';
  quantity: number;
  quantity_before: number;
  quantity_after: number;
  reason?: string;
  reference?: string;
  created_by: number;
  created_by_name: string;
  created_at: string;
}

export interface Sale {
  id: number;
  transaction_number: string;
  items: SaleItem[];
  total_amount: string;
  discount_amount: string;
  tax_amount: string;
  net_amount: string;
  payment_method: string;
  payment_method_display: string;
  payment_reference?: string;
  customer_phone?: string;
  customer_name?: string;
  notes?: string;
  created_by: number;
  created_by_name: string;
  is_returned: boolean;
  returned_at: string | null;
  formatted_total: string;
  balance_due?: string;
  payments?: CreditPayment[];
  total_profit: number | string; // Changed to match API response/type flexibility
  has_receipt: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreditPayment {
  id: number;
  sale: number;
  amount: string;
  payment_method: 'CASH' | 'MOBILE_MONEY' | 'BANK' | 'CREDIT' | string;
  payment_reference?: string;
  created_at: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  category: 'expense' | 'debt' | 'useful' | 'general';
  folder: string;
  tags: string[];
  is_pinned: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  created_by_name?: string;
}

export interface SaleItem {
  id: number;
  product: number;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: string;
  cost_price: string;
  discount_percent: string;
  discount_amount: string;
  line_total: string;
  profit: string | number;
}

export interface SalesReport {
  sales: Array<{
    id: number;
    transaction_number: string;
    date: string;
    items_count: number;
    items?: string[];
    total_amount: number;
    discount: number;
    tax: number;
    net_amount: number;
    payment_method: string;
    cashier: string;
    is_returned: boolean;
  }>;
  period: { start: string; end: string };
  summary: {
    total_sales: number;
    total_transactions: number;
    total_discount: number;
    total_tax: number;
    average_sale: number;
  };
}

export interface ProfitReport {
  profit_transactions: Array<{
    id: number;
    transaction_number: string;
    date: string;
    net_amount: number;
    total_profit: number;
    profit_margin: number;
    cashier: string;
  }>;
  period: {
    start: string;
    end: string;
  };
  summary: {
    total_sales: number;
    total_profit: number;
    total_transactions: number;
    average_profit: number;
    average_profit_margin: number;
  };
}

export interface InventoryReport {
  products: Array<{
    id: number;
    sku: string;
    name: string;
    category: string;
    current_stock: number;
    minimum_stock: number;
    unit: string;
    cost_price: number;
    selling_price: number;
    cost_value: number;
    retail_value: number;
    is_low_stock: boolean;
    profit_margin: number;
  }>;
  summary: {
    total_items: number;
    total_cost_value: number;
    total_retail_value: number;
    low_stock_count: number;
    potential_profit: number;
  };
}

export interface DailySummaryReport {
  date: string;
  sales: {
    total_sales: number;
    transaction_count: number;
    average_sale: number;
  };
  payment_methods: {
    [key: string]: { total: number; count: number };
  };
  top_products: Array<{
    product_name: string;
    product_sku: string;
    quantity: number;
    revenue: number;
  }>;
  low_stock_alerts: Array<{
    name: string;
    sku: string;
    quantity: number;
    minimum_stock: number;
  }>;
}

export type { User, AuthResponse, ApiResponse, SubscriptionPackage, SubscriptionStatus };
