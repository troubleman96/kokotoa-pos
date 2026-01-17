const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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

interface User {
  id: number;
  phone: string;
  first_name: string;
  last_name: string;
  role: string;
  role_name: string;
  store: number | null;
  store_name?: string;
  is_phone_verified: boolean;
  is_store_created: boolean;
  is_profile_complete: boolean;
  created_at: string;
}

class ApiService {
  private accessToken: string | null = null;

  setAccessToken(token: string | null) {
    this.accessToken = token;
    if (token) {
      localStorage.setItem('access_token', token);
      localStorage.setItem('jwt_token', token); // Store JWT as 'jwt_token' for compatibility
    } else {
      localStorage.removeItem('access_token');
      localStorage.removeItem('jwt_token');
    }
  }

  getAccessToken(): string | null {
    // Always prefer 'jwt_token' for Authorization
    const jwt = localStorage.getItem('jwt_token');
    if (jwt) return jwt;
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('access_token');
    }
    return this.accessToken;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    // Always get JWT token from localStorage
    const token = localStorage.getItem('jwt_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  setRefreshToken(token: string | null) {
    if (token) {
      localStorage.setItem('refresh_token', token);
    } else {
      localStorage.removeItem('refresh_token');
    }
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log(`[API] Response Data:`, data);
      if (!response.ok) {
        console.error(`[API] Error Response:`, data);
        throw new Error(data.message || 'An error occurred');
      }
      return data;
    }
    const text = await response.text();
    console.error(`[API] Non-JSON Response:`, text);
    throw new Error(text || 'An error occurred');
  }

  async post<T>(endpoint: string, body: object): Promise<T> {
    console.log(`[API] POST ${API_BASE_URL}${endpoint}`);
    console.log(`[API] Body:`, body);
    console.log(`[API] Headers:`, this.getHeaders());
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    console.log(`[API] Response Status: ${response.status}`);
    return this.handleResponse<T>(response);
  }

  async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    console.log(`[API] POST (FormData) ${API_BASE_URL}${endpoint}`);
    console.log(`[API] FormData keys:`, Array.from(formData.keys()));
    const token = localStorage.getItem('jwt_token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    console.log(`[API] Headers:`, headers);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });
    console.log(`[API] Response Status: ${response.status}`);
    return this.handleResponse<T>(response);
  }

  async get<T>(endpoint: string): Promise<T> {
    console.log(`[API] GET ${API_BASE_URL}${endpoint}`);
    console.log(`[API] Headers:`, this.getHeaders());
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    console.log(`[API] Response Status: ${response.status}`);
    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, body: object): Promise<T> {
    console.log(`[API] PUT ${API_BASE_URL}${endpoint}`);
    console.log(`[API] Body:`, body);
    console.log(`[API] Headers:`, this.getHeaders());
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    console.log(`[API] Response Status: ${response.status}`);
    return this.handleResponse<T>(response);
  }

  async patch<T>(endpoint: string, body: object): Promise<T> {
    console.log(`[API] PATCH ${API_BASE_URL}${endpoint}`);
    console.log(`[API] Body:`, body);
    console.log(`[API] Headers:`, this.getHeaders());
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    console.log(`[API] Response Status: ${response.status}`);
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    console.log(`[API] DELETE ${API_BASE_URL}${endpoint}`);
    console.log(`[API] Headers:`, this.getHeaders());
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    console.log(`[API] Response Status: ${response.status}`);
    return this.handleResponse<T>(response);
  }
}

export const api = new ApiService();

export const authApi = {
  register: (data: { phone: string; password: string; password_confirm: string; first_name: string; last_name: string }) =>
    api.post<{ success: boolean; message: string; data: { user_id: number; phone: string; is_phone_verified: boolean }; errors: any }>('/accounts/auth/register/', data),

  verifyOtp: (data: { phone: string; otp_code: string }) =>
    api.post<{ success: boolean; message: string; data: { user_id: number; phone: string; is_phone_verified: boolean; can_create_store: boolean }; errors: any }>('/accounts/auth/verify-otp/', data),

  resendOtp: (data: { phone: string }) =>
    api.post<{ success: boolean; message: string; errors: any }>('/accounts/auth/resend-otp/', data),

  login: (data: { phone: string; password: string }) =>
    api.post<AuthResponse & { errors: any }>('/accounts/auth/login/', data),

  refreshToken: (refresh_token: string) =>
    api.post<{ access: string; refresh: string; token_type: string; success: boolean; message: string; errors: any }>('/accounts/auth/token/refresh/', { refresh_token }),

  requestPasswordReset: (data: { phone: string }) =>
    api.post<{ success: boolean; message: string; errors: any }>('/accounts/auth/password/reset/', data),

  resetPassword: (data: { phone: string; otp_code: string; new_password: string; new_password_confirm: string }) =>
    api.post<{ success: boolean; message: string; errors: any }>('/accounts/auth/password/reset/confirm/', data),

  changePassword: (data: { old_password: string; new_password: string; new_password_confirm: string }) =>
    api.post<{ success: boolean; message: string; errors: any }>('/accounts/auth/password/change/', data),

  changeName: (data: { first_name: string; last_name: string }) =>
    api.post<{ success: boolean; message: string; data: { first_name: string; last_name: string }; errors: any }>('/accounts/auth/profile/change-name/', data),

  getCurrentUser: () =>
    api.get<{ success: boolean; message: string; data: User; errors: any }>('/accounts/auth/profile/'),
};

export const storesApi = {
  create: (data: { name: string; location: string; details?: string; phone_number: string }) =>
    api.post<{ success: boolean; message: string; data: Store; errors: any }>('/accounts/stores/', data), // api.post uses getHeaders() which now always sends JWT

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

export type { User, AuthResponse, ApiResponse };
