import Cookies from 'js-cookie';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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
  subscription_activated: string | null;
  days_remaining?: number;
  subscription?: {
    package: SubscriptionPackage;
    expires_at: string;
    payment_reference: string;
    granted_at?: string;
  };
  message?: string; // For error/info cases
}

interface User {
  id: number;
  phone: string;
  email?: string;
  first_name: string;
  last_name: string;
  role: 'OWNER' | 'CASHIER' | 'STAFF' | string;
  role_name: string;
  store: number | null;
  store_name?: string;
  is_phone_verified: boolean;
  is_store_created: boolean;
  is_profile_complete: boolean;
  created_at: string;
  // Subscription fields
  subscription_status?: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'BLOCKED';
  subscription_status_display?: string;
  has_access?: boolean;
  trial_start_date?: string;
  trial_end_date?: string;
  subscription_activated_at?: string;
}

class ApiService {
  private accessToken: string | null = null;

  setAccessToken(token: string | null) {
    this.accessToken = token;
    if (token) {
      localStorage.setItem('jwt_token', token);
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('access_token');
    }
  }

  getAccessToken(): string | null {
    if (this.accessToken) return this.accessToken;
    const token = localStorage.getItem('jwt_token') || localStorage.getItem('access_token');
    if (token) this.accessToken = token;
    return token;
  }

  setRefreshToken(token: string | null) {
    if (token) {
      const isSecure = window.location.protocol === 'https:';
      Cookies.set('refresh_token', token, { expires: 30, secure: isSecure, sameSite: 'strict' });
      localStorage.setItem('refresh_token', token); // Fallback
    } else {
      Cookies.remove('refresh_token');
      localStorage.removeItem('refresh_token');
    }
  }

  getRefreshToken(): string | null {
    return Cookies.get('refresh_token') || localStorage.getItem('refresh_token');
  }

  private getHeaders(isFormData = false): HeadersInit {
    const headers: HeadersInit = isFormData ? {} : { 'Content-Type': 'application/json' };
    const token = this.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // Add cache control headers
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    headers['Pragma'] = 'no-cache';
    headers['Expires'] = '0';

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit, retry = true): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, options);

    // Auto-refresh logic on 401 (but don't retry if the refresh request itself fails)
    if (response.status === 401 && retry && endpoint !== '/auth/token/refresh/') {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        try {
          console.log('[API] 401 Unauthorized, attempting to hit refresh token...');
          const refreshRes = await authApi.refreshToken(refreshToken) as any;

          // Handle both wrapped and unwrapped response styles
          const newAccess = refreshRes?.data?.access || refreshRes?.access || refreshRes?.data?.access_token || refreshRes?.access_token;
          const newRefresh = refreshRes?.data?.refresh || refreshRes?.refresh || refreshRes?.data?.refresh_token || refreshRes?.refresh_token;

          if (newAccess) {
            console.log('[API] Refresh successful, retrying original request.');
            this.setAccessToken(newAccess);
            if (newRefresh) this.setRefreshToken(newRefresh);

            // Retry the original request with new token
            const newOptions = {
              ...options,
              headers: this.getHeaders(options.body instanceof FormData)
            };
            return this.request<T>(endpoint, newOptions, false);
          } else {
            console.error('[API] Refresh response missing tokens:', refreshRes);
            throw new Error('Refresh failed');
          }
        } catch (error) {
          console.error('[API] Recovery failed during silent refresh:', error);
          this.setAccessToken(null);
          this.setRefreshToken(null);
        }
      }
    }

    return this.handleResponse<T>(response);
  }

  private async handleResponse<T>(response: Response): Promise<T> {
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
    const text = await response.text();
    console.error(`[API] Non-JSON Response:`, text);
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
  register: (data: { phone: string; password: string; password_confirm: string; first_name: string; last_name: string }) =>
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
    api.patch<{ success: boolean; message: string; data: User; errors: any }>('/accounts/profile/', data),
};

export const subscriptionApi = {
  getPackages: () =>
    api.get<{ success: boolean; message: string; data: SubscriptionPackage[]; errors: any }>('/accounts/packages/'),

  getStatus: () =>
    api.get<{ success: boolean; message: string; data: SubscriptionStatus; errors: any }>('/accounts/subscription-status/'),
};

export const storesApi = {
  create: (data: { name: string; location: string; details?: string; phone_number: string }) =>
    api.post<{ success: boolean; message: string; data: Store; errors: any }>('/accounts/stores/', data),

  list: () =>
    api.get<{ success: boolean; message: string; data: Store[]; errors: any }>('/accounts/stores/'),

  get: (id: number) =>
    api.get<{ success: boolean; message: string; data: Store & { user_count: number }; errors: any }>(`/accounts/stores/${id}/`),

  update: (id: number, data: Partial<Store>) =>
    api.put<{ success: boolean; message: string; data: Store; errors: any }>(`/accounts/stores/${id}/`, data),

  patch: (id: number, data: Partial<Store>) =>
    api.patch<{ success: boolean; message: string; data: Store; errors: any }>(`/accounts/stores/${id}/`, data),

  delete: (id: number) =>
    api.delete<{ success: boolean; message: string; errors: any }>(`/accounts/stores/${id}/`),
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
  list: (params?: { date_from?: string; date_to?: string; payment_method?: string; is_returned?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);
    if (params?.payment_method) queryParams.append('payment_method', params.payment_method);
    if (params?.is_returned !== undefined) queryParams.append('is_returned', String(params.is_returned));
    const query = queryParams.toString();
    return api.get<{ success: boolean; message: string; data: { sales: Sale[]; summary: { total_sales: number; transaction_count: number } }; errors: any }>(`/pos/sales/${query ? `?${query}` : ''}`);
  },

  create: (data: { items: Array<{ product_id: number; quantity: number; unit_price: number; discount_percent?: number }>; payment_method: string; payment_reference?: string; customer_phone?: string; customer_name?: string; notes?: string; discount_amount?: number; tax_amount?: number }) =>
    api.post<{ success: boolean; message: string; data: Sale; errors: any }>('/pos/sales/', data),

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
    return api.get<{ success: boolean; message: string; data: SalesReport; errors: any }>(`/reports/sales/${query ? `?${query}` : ''}`);
  },

  getInventory: () =>
    api.get<{ success: boolean; message: string; data: InventoryReport; errors: any }>('/reports/inventory/'),

  getDailySummary: (date?: string) =>
    api.get<{ success: boolean; message: string; data: DailySummaryReport; errors: any }>(`/reports/daily-summary/${date ? `?date=${date}` : ''}`),
};

export const graphsApi = {
  getDailySales: (days?: number) =>
    api.get<{ success: boolean; message: string; data: { data: number[]; labels: string[]; period: { start: string; end: string; days: number }; summary: { total_sales: number; transaction_count: number; average_sale: number } }; errors: any }>(`/graphs/daily-sales/${days ? `?days=${days}` : ''}`),

  getTopProducts: (params?: { limit?: number; days?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.days) queryParams.append('days', String(params.days));
    const query = queryParams.toString();
    return api.get<{ success: boolean; message: string; data: { data: Array<{ rank: number; sku: string; name: string; quantity_sold: number; revenue: number; profit: number; transactions: number }>; period: { start: string; end: string; days: number }; summary: { total_items_sold: number } }; errors: any }>(`/graphs/top-products/${query ? `?${query}` : ''}`);
  },

  getLowStock: () =>
    api.get<{ success: boolean; message: string; data: { data: Array<{ id: number; sku: string; name: string; category: string; current_stock: number; minimum_stock: number; unit: string; status: string }>; count: number; message: string }; errors: any }>('/graphs/low-stock/'),

  getPaymentMethods: (days?: number) =>
    api.get<{ success: boolean; message: string; data: { data: number[]; labels: string[]; period: { start: string; end: string; days: number }; summary: { total_sales: number; transaction_count: number } }; errors: any }>(`/graphs/payment-methods/${days ? `?days=${days}` : ''}`),

  getSalesByHour: (days?: number) =>
    api.get<{ success: boolean; message: string; data: { data: number[]; labels: string[]; period: { start: string; end: string; days: number }; summary: { total_sales: number; transaction_count: number; peak_hour: string } }; errors: any }>(`/graphs/sales-by-hour/${days ? `?days=${days}` : ''}`),

  getInventoryValue: () =>
    api.get<{ success: boolean; message: string; data: { data: number[]; labels: string[]; summary: { total_cost_value: number; total_retail_value: number; potential_profit: number; item_count: number } }; errors: any }>('/graphs/inventory-value/'),

  getDashboard: () =>
    api.get<{ success: boolean; message: string; data: { today: { sales: number; transactions: number }; this_month: { sales: number; transactions: number }; inventory: { low_stock_count: number; total_products: number }; store: { name: string } }; errors: any }>('/graphs/dashboard/'),
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
  has_receipt: boolean;
  created_at: string;
  updated_at: string;
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
  profit: string;
}

export interface SalesReport {
  sales: Array<{
    id: number;
    transaction_number: string;
    date: string;
    items_count: number;
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
