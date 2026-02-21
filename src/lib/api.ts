import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_EXPENSE_TRACKER_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  currency: string;
  created_by: string;
  creator_name?: string;
  creator_email?: string;
  created_at: string;
  members?: User[];
}

export interface Expense {
  id: string;
  group_id: string;
  description: string;
  amount: string;
  category: string;
  paid_by: {
    id: string;
    name: string;
    email: string;
  };
  expense_date: string;
  notes?: string;
  splits: {
    user_id: string;
    user_name: string;
    amount: string;
    settled: boolean;
  }[];
  created_at: string;
}

export interface Balance {
  user_id: string;
  user_name: string;
  total_paid: string;
  total_owed: string;
  net_balance: string;
}

export interface Settlement {
  from_user_id: string;
  from_user_name: string;
  to_user_id: string;
  to_user_name: string;
  amount: string;
}

// API Functions
export const groupsAPI = {
  create: async (data: {
    name: string;
    description?: string;
    currency?: string;
    created_by_email: string;
    created_by_name: string;
  }) => {
    const response = await api.post<Group>('/groups', data);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Group>(`/groups/${id}`);
    return response.data;
  },

  addMember: async (groupId: string, data: { email: string; name: string }) => {
    const response = await api.post<User>(`/groups/${groupId}/members`, data);
    return response.data;
  },

  getBalances: async (groupId: string) => {
    const response = await api.get<Balance[]>(`/groups/${groupId}/balances`);
    return response.data;
  },

  getSettlements: async (groupId: string) => {
    const response = await api.get<Settlement[]>(`/groups/${groupId}/settlements`);
    return response.data;
  },
};

export const expensesAPI = {
  create: async (data: {
    group_id: string;
    description: string;
    amount: number;
    category?: string;
    expense_date?: string;
    notes?: string;
    paid_by_email: string;
    split_with_emails: string[];
  }) => {
    const response = await api.post<Expense>('/expenses', data);
    return response.data;
  },

  getByGroup: async (groupId: string) => {
    const response = await api.get<Expense[]>(`/expenses/group/${groupId}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Expense>(`/expenses/${id}`);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },
};

export default api;