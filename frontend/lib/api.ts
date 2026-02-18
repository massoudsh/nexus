/**
 * API client for backend communication.
 */
import axios, { AxiosInstance, AxiosError } from 'axios';
import { DashboardSummarySchema, type DashboardSummary } from '@/lib/schemas/dashboard'
import { AccountsSchema, type Accounts } from '@/lib/schemas/account'
import {
  ExpensesByCategorySchema,
  IncomeVsExpensesSchema,
  type ExpensesByCategory,
  type IncomeVsExpenses,
} from '@/lib/schemas/reports'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

/** Get a user-friendly error message from an Axios or API error. */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data?.detail) {
      if (typeof data.detail === 'string') return data.detail;
      if (Array.isArray(data.detail)) {
        const first = data.detail[0];
        if (first?.msg) return first.msg;
      }
    }
    if (error.response?.status === 401) return 'Please sign in to continue.';
    if (error.response?.status === 404) return 'The requested item was not found.';
    if (error.response?.status === 422) return 'Please check your input and try again.';
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - clear token.
          // NOTE: We intentionally do NOT redirect to /login here to allow "guest mode"
          // and avoid forcing auth UX for users who just want to explore the app.
          this.clearToken();
        }
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  private clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('access_token', token);
  }

  setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('refresh_token', token);
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh_token');
  }

  /** Refresh access token using refresh token. Returns new token data or throws. */
  async refreshToken(): Promise<{ access_token: string; refresh_token: string; token_type: string }> {
    const refresh = this.getRefreshToken();
    if (!refresh) throw new Error('No refresh token');
    const response = await this.client.post('/auth/refresh', { refresh_token: refresh });
    const data = response.data;
    if (data.access_token) {
      this.setToken(data.access_token);
      this.setRefreshToken(data.refresh_token);
    }
    return data;
  }

  logout(): void {
    this.clearToken();
  }

  // Auth endpoints
  async register(data: { email: string; username: string; password: string; full_name?: string }) {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  async login(username: string, password: string) {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await this.client.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    if (response.data.access_token) {
      this.setToken(response.data.access_token);
      this.setRefreshToken(response.data.refresh_token);
    }
    
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  // Account endpoints
  async getAccounts() {
    const response = await this.client.get('/accounts');
    return AccountsSchema.parse(response.data) as Accounts;
  }

  async getAccount(id: number) {
    const response = await this.client.get(`/accounts/${id}`);
    return response.data;
  }

  async createAccount(data: any) {
    const response = await this.client.post('/accounts', data);
    return response.data;
  }

  async updateAccount(id: number, data: any) {
    const response = await this.client.put(`/accounts/${id}`, data);
    return response.data;
  }

  async deleteAccount(id: number) {
    await this.client.delete(`/accounts/${id}`);
  }

  // Category endpoints (for costs and AI suggestion)
  async getCategories() {
    const response = await this.client.get('/categories');
    return response.data as Array<{ id: number; name: string; description?: string; color?: string }>;
  }

  // Transaction endpoints
  async getTransactions(params?: any) {
    const response = await this.client.get('/transactions', { params });
    return response.data;
  }

  async getTransaction(id: number) {
    const response = await this.client.get(`/transactions/${id}`);
    return response.data;
  }

  async createTransaction(data: any) {
    const response = await this.client.post('/transactions', data);
    return response.data;
  }

  async updateTransaction(id: number, data: any) {
    const response = await this.client.put(`/transactions/${id}`, data);
    return response.data;
  }

  async deleteTransaction(id: number) {
    await this.client.delete(`/transactions/${id}`);
  }

  // Banking messages (parse, suggest category, create transaction)
  async parseBankingMessage(rawText: string) {
    const response = await this.client.post('/banking-messages/parse', { raw_text: rawText });
    return response.data as {
      amount: number | null;
      date: string | null;
      description: string | null;
      transaction_type: string;
      suggested_category_id: number | null;
      suggested_category_name: string | null;
    };
  }

  async createBankingMessage(rawText: string, source?: string) {
    const response = await this.client.post('/banking-messages', { raw_text: rawText, source });
    return response.data;
  }

  async getBankingMessages(limit?: number) {
    const response = await this.client.get('/banking-messages', { params: { limit } });
    return response.data;
  }

  async createTransactionFromMessage(messageId: number, accountId: number, categoryId?: number) {
    const response = await this.client.post(`/banking-messages/${messageId}/create-transaction`, {
      account_id: accountId,
      category_id: categoryId ?? undefined,
    });
    return response.data;
  }

  // Budget endpoints
  async getBudgets() {
    const response = await this.client.get('/budgets');
    return response.data;
  }

  async getBudget(id: number) {
    const response = await this.client.get(`/budgets/${id}`);
    return response.data;
  }

  async createBudget(data: any) {
    const response = await this.client.post('/budgets', data);
    return response.data;
  }

  async updateBudget(id: number, data: any) {
    const response = await this.client.put(`/budgets/${id}`, data);
    return response.data;
  }

  async deleteBudget(id: number) {
    await this.client.delete(`/budgets/${id}`);
  }

  // Goal endpoints
  async getGoals() {
    const response = await this.client.get('/goals');
    return response.data;
  }

  async getGoal(id: number) {
    const response = await this.client.get(`/goals/${id}`);
    return response.data;
  }

  async createGoal(data: any) {
    const response = await this.client.post('/goals', data);
    return response.data;
  }

  async updateGoal(id: number, data: any) {
    const response = await this.client.put(`/goals/${id}`, data);
    return response.data;
  }

  async deleteGoal(id: number) {
    await this.client.delete(`/goals/${id}`);
  }

  // Dashboard endpoints
  async getDashboardSummary() {
    const response = await this.client.get('/dashboard/summary');
    return DashboardSummarySchema.parse(response.data) as DashboardSummary;
  }

  // Report endpoints
  async getExpensesByCategory(startDate?: string, endDate?: string) {
    const response = await this.client.get('/reports/expenses-by-category', {
      params: { start_date: startDate, end_date: endDate },
    });
    return ExpensesByCategorySchema.parse(response.data) as ExpensesByCategory;
  }

  async getIncomeVsExpenses(startDate?: string, endDate?: string) {
    const response = await this.client.get('/reports/income-vs-expenses', {
      params: { start_date: startDate, end_date: endDate },
    });
    return IncomeVsExpensesSchema.parse(response.data) as IncomeVsExpenses;
  }

  /** Export transactions as CSV blob (for download). */
  async exportTransactions(startDate?: string, endDate?: string): Promise<Blob> {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const response = await this.client.get('/transactions/export', {
      params,
      responseType: 'blob',
    });
    return response.data as Blob;
  }

  /** Import transactions from CSV. Returns { created, errors, total_rows }. */
  async importTransactions(file: File, accountId: number): Promise<{ created: number; errors: string[]; total_rows: number }> {
    const form = new FormData();
    form.append('file', file);
    const response = await this.client.post(
      `/transactions/import?account_id=${accountId}`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  }

  /** Get budget alerts (e.g. budgets at or over 80% spent). */
  async getAlerts(): Promise<Array<{ budget_id: number; budget_name: string; spent: number; budget_amount: number; percentage: number; alert_type: string }>> {
    const response = await this.client.get('/alerts');
    return response.data;
  }

  // Junior Smart Savings
  async getJuniorProfiles() {
    const response = await this.client.get('/junior/profiles');
    return response.data as import('@/lib/schemas/junior').JuniorProfile[];
  }

  async getJuniorProfile(id: number) {
    const response = await this.client.get(`/junior/profiles/${id}`);
    return response.data;
  }

  async createJuniorProfile(data: { name: string; currency?: string; allowance_amount?: number; birth_date?: string; avatar_url?: string }) {
    const response = await this.client.post('/junior/profiles', data);
    return response.data;
  }

  async updateJuniorProfile(id: number, data: Partial<{ name: string; currency: string; allowance_amount: number; birth_date: string; avatar_url: string; is_active: boolean }>) {
    const response = await this.client.put(`/junior/profiles/${id}`, data);
    return response.data;
  }

  async deleteJuniorProfile(id: number) {
    await this.client.delete(`/junior/profiles/${id}`);
  }

  async getJuniorDashboard(profileId: number) {
    const response = await this.client.get(`/junior/profiles/${profileId}/dashboard`);
    return response.data as import('@/lib/schemas/junior').JuniorDashboardSummary;
  }

  async getJuniorGoals(profileId: number) {
    const response = await this.client.get(`/junior/profiles/${profileId}/goals`);
    return response.data as import('@/lib/schemas/junior').JuniorGoal[];
  }

  async createJuniorGoal(profileId: number, data: { name: string; target_amount: number; target_date?: string }) {
    const response = await this.client.post(`/junior/profiles/${profileId}/goals`, data);
    return response.data;
  }

  async updateJuniorGoal(profileId: number, goalId: number, data: Partial<{ name: string; target_amount: number; current_amount: number; target_date: string; status: string; parent_approved: boolean }>) {
    const response = await this.client.put(`/junior/profiles/${profileId}/goals/${goalId}`, data);
    return response.data;
  }

  async approveJuniorGoal(profileId: number, goalId: number) {
    const response = await this.client.post(`/junior/profiles/${profileId}/goals/${goalId}/approve`);
    return response.data;
  }

  async getJuniorDeposits(profileId: number) {
    const response = await this.client.get(`/junior/profiles/${profileId}/deposits`);
    return response.data as import('@/lib/schemas/junior').AutomatedDeposit[];
  }

  async createJuniorDeposit(profileId: number, data: { source_account_id: number; amount: number; frequency: string; next_run_date: string }) {
    const response = await this.client.post(`/junior/profiles/${profileId}/deposits`, data);
    return response.data;
  }

  async getJuniorRewards(profileId: number) {
    const response = await this.client.get(`/junior/profiles/${profileId}/rewards`);
    return response.data as import('@/lib/schemas/junior').Reward[];
  }

  async createJuniorReward(profileId: number, data: { reward_type: string; title?: string }) {
    const response = await this.client.post(`/junior/profiles/${profileId}/rewards`, data);
    return response.data;
  }
}

export const apiClient = new ApiClient();

