import axios from 'axios';
import * as T from './types';

const RAW_API_URL = import.meta.env.VITE_API_URL;
let BACKEND_BASE = (RAW_API_URL || '').replace(/\/+$/, '');

if (!BACKEND_BASE) {
  if (import.meta.env.DEV) {
    BACKEND_BASE = 'http://localhost:8081';
  } else {
    console.error(
      'CRITICAL CONFIGURATION ERROR: VITE_API_URL is not defined in production build. ' +
      'API requests will not target GitHub Pages origin. Please configure VITE_API_URL in deployment settings.'
    );
  }
}

export function getWebSocketUrl(): string {
  const envWs = import.meta.env.VITE_WS_URL;
  if (envWs) {
    if (window.location.protocol === 'https:' && envWs.startsWith('ws://')) {
      return envWs.replace(/^ws:\/\//i, 'wss://');
    }
    return envWs;
  }
  if (import.meta.env.DEV) {
    return 'ws://localhost:8081/ws';
  }
  if (BACKEND_BASE) {
    const wsProto = BACKEND_BASE.startsWith('https:') ? 'wss:' : 'ws:';
    return `${BACKEND_BASE.replace(/^https?:/, wsProto)}/ws`;
  }
  return '';
}

const API_BASE = BACKEND_BASE ? `${BACKEND_BASE}/api/v1/lunar` : '';
const API_V2_BASE = BACKEND_BASE ? `${BACKEND_BASE}/api/v2` : '';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const apiV2Client = axios.create({
  baseURL: API_V2_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiV2Client.interceptors.request.use((config) => {
  if (!BACKEND_BASE && import.meta.env.PROD) {
    return Promise.reject(new Error('CRITICAL: VITE_API_URL is not configured in production environment. Backend connection unavailable.'));
  }
  const token = localStorage.getItem('lunar_token');
  if (token) {
    config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.request.use((config) => {
  if (!BACKEND_BASE && import.meta.env.PROD) {
    return Promise.reject(new Error('CRITICAL: VITE_API_URL is not configured in production environment. Backend connection unavailable.'));
  }
  const token = localStorage.getItem('lunar_token');
  if (token) {
    config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('lunar_token');
      localStorage.removeItem('lunar_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = {
  auth: {
    login: async (username: string, password: string): Promise<T.AuthResponse> => {
      const res = await apiClient.post<T.AuthResponse>('/auth/login', { username, password });
      return res.data;
    },
    me: async (): Promise<T.AuthResponse> => {
      const res = await apiClient.get<T.AuthResponse>('/auth/me');
      return res.data;
    },
  },
  telemetry: {
    getAll: async (): Promise<T.Telemetry[]> => {
      const res = await apiClient.get('/telemetry');
      return res.data?.content || res.data || [];
    },
    getById: async (id: number): Promise<T.Telemetry> => {
      const res = await apiClient.get(`/telemetry/${id}`);
      return res.data;
    },
    post: async (payload: any): Promise<T.Telemetry> => {
      const res = await apiClient.post('/telemetry', payload);
      return res.data;
    },
  },
  alerts: {
    getAll: async (): Promise<T.EnvironmentalAlert[]> => {
      const res = await apiClient.get('/alerts');
      return res.data?.content || res.data || [];
    },
    acknowledge: async (id: number, notes?: string): Promise<T.EnvironmentalAlert> => {
      const res = await apiClient.put(`/alerts/${id}/acknowledge`, { notes });
      return res.data;
    },
    resolve: async (id: number, notes?: string): Promise<T.EnvironmentalAlert> => {
      const res = await apiClient.put(`/alerts/${id}/resolve`, { notes });
      return res.data;
    },
  },
  zones: {
    getAll: async (): Promise<T.HabitatZone[]> => {
      const res = await apiClient.get('/zones');
      return res.data?.content || res.data || [];
    },
  },
  thresholds: {
    getAll: async (): Promise<T.EnvironmentalThreshold[]> => {
      const res = await apiClient.get('/thresholds');
      return res.data?.content || res.data || [];
    },
  },
  inventory: {
    getAll: async (): Promise<T.InventoryItem[]> => {
      const res = await apiClient.get('/inventory');
      return res.data?.content || res.data || [];
    },
  },
  maintenance: {
    getAll: async (): Promise<T.MaintenanceRecord[]> => {
      const res = await apiClient.get('/maintenance');
      return res.data?.content || res.data || [];
    },
  },
  contacts: {
    getAll: async (): Promise<T.Contact[]> => {
      const res = await apiClient.get('/contacts');
      return res.data?.content || res.data || [];
    },
  },
  products: {
    getAll: async (): Promise<T.Product[]> => {
      const res = await apiClient.get('/products');
      return res.data?.content || res.data || [];
    },
  },
  purchaseOrders: {
    getAll: async (): Promise<T.PurchaseOrder[]> => {
      const res = await apiClient.get('/purchase-orders');
      return res.data?.content || res.data || [];
    },
  },
  vendorBills: {
    getAll: async (): Promise<T.VendorBill[]> => {
      const res = await apiClient.get('/vendor-bills');
      return res.data?.content || res.data || [];
    },
  },
  salesOrders: {
    getAll: async (): Promise<T.SalesOrder[]> => {
      const res = await apiClient.get('/sales-orders');
      return res.data?.content || res.data || [];
    },
  },
  invoices: {
    getAll: async (): Promise<T.Invoice[]> => {
      const res = await apiClient.get('/invoices');
      return res.data?.content || res.data || [];
    },
  },
  payments: {
    getAll: async (): Promise<T.Payment[]> => {
      const res = await apiClient.get('/payments');
      return res.data?.content || res.data || [];
    },
  },
  accounts: {
    getAll: async (): Promise<T.Account[]> => {
      const res = await apiClient.get('/accounts');
      return res.data?.content || res.data || [];
    },
  },
  journals: {
    getAll: async (): Promise<T.Journal[]> => {
      const res = await apiClient.get('/journals');
      return res.data?.content || res.data || [];
    },
    getEntries: async (): Promise<T.JournalEntry[]> => {
      const res = await apiClient.get('/journals/entries');
      return res.data?.content || res.data || [];
    },
  },
  budgets: {
    getAll: async (): Promise<T.Budget[]> => {
      const res = await apiClient.get('/budgets');
      return res.data?.content || res.data || [];
    },
    getAnalyticAccounts: async (): Promise<T.AnalyticAccount[]> => {
      const res = await apiClient.get('/budgets/analytic-accounts');
      return res.data?.content || res.data || [];
    },
    getVariance: async (year = 2026): Promise<any> => {
      const res = await apiClient.get(`/budgets/analysis?fiscalYear=${year}`);
      return res.data;
    },
  },
  reports: {
    getBalanceSheet: async () => {
      const res = await apiClient.get('/reports/balance-sheet');
      return res.data;
    },
    getProfitLoss: async () => {
      const res = await apiClient.get('/reports/profit-loss');
      return res.data;
    },
    getBudgetVariance: async (year = 2026) => {
      const res = await apiClient.get(`/reports/budget?fiscalYear=${year}`);
      return res.data;
    },
    getEnvironment: async () => {
      const res = await apiClient.get('/reports/environment');
      return res.data;
    },
    getResources: async () => {
      const res = await apiClient.get('/reports/resources');
      return res.data;
    },
  },
  auditLogs: {
    getAll: async (): Promise<T.AuditLog[]> => {
      const res = await apiClient.get('/audit-logs');
      return res.data?.content || res.data || [];
    },
  },
  users: {
    getAll: async (): Promise<T.User[]> => {
      const res = await apiClient.get('/users');
      return res.data?.content || res.data || [];
    },
  },
  v2: {
    getHealth: async (): Promise<T.LunarCoreHealth> => {
      const res = await apiV2Client.get<T.LunarCoreHealth>('/lunar-core/health');
      return res.data;
    },
    diagnose: async (query: string): Promise<T.DiagnosticQueryResult> => {
      const res = await apiV2Client.get<T.DiagnosticQueryResult>('/lunar-core/diagnose', {
        params: { q: query },
      });
      return res.data;
    },
    getZones: async (): Promise<T.HabitatZoneV2[]> => {
      const res = await apiV2Client.get<T.HabitatZoneV2[]>('/zones');
      return res.data || [];
    },
    getLatestTelemetry: async () => {
      const res = await apiV2Client.get('/telemetry/latest');
      return res.data;
    },
    getStreamUrl: () => {
      if (!BACKEND_BASE && import.meta.env.PROD) {
        console.error('Cannot open SSE stream: VITE_API_URL is not configured in production.');
        return '';
      }
      const token = localStorage.getItem('lunar_token')?.replace(/^Bearer /i, '');
      const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : '';
      return `${API_V2_BASE}/telemetry/stream${tokenQuery}`;
    },
    getWebSocketUrl,
  },
};
