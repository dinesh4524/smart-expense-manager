import { ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js'; // Import Supabase's User type

export interface Expense {
  id: string;
  date: string; // ISO string format
  description: string;
  amount: number;
  categoryId: string;
  personId: string; // Renamed from personId to householdMemberId in DB, but keeping personId in frontend for simplicity
  paymentModeId: string;
  receiptUrl?: string; // Optional URL for uploaded receipt
}

export interface Category {
  id: string;
  name: string;
  icon?: string; // Emoji or icon name
}

export interface HouseholdMember {
  id: string;
  name: string;
}

export interface PaymentMode {
  id: string;
  name: string;
  icon: string;
}

export interface Debt {
    id: string;
    personId: string; // References HouseholdMember ID
    amount: number;
    type: 'loaned' | 'borrowed';
    description: string;
    issueDate: string;
    dueDate: string;
    status: 'pending' | 'paid';
}

export interface ChitFund {
    id: string;
    name: string;
    totalAmount: number;
    monthlyInstallment: number;
    durationMonths: number;
    startDate: string;
    status: 'active' | 'closed';
}

export type Settings = {
  currency: string;
  theme: 'light' | 'dark';
};

// Define a Profile type for data stored in the public.profiles table
export interface Profile {
  id: string; // References auth.users.id
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

// We will use SupabaseUser for authentication and Profile for user data.
// The AppContext will manage the current user's profile data.

export interface AppContextType {
  expenses: Expense[];
  categories: Category[];
  people: HouseholdMember[]; // Renamed to HouseholdMember in type, but keeping 'people' key for context compatibility
  paymentModes: PaymentMode[];
  debts: Debt[];
  chitFunds: ChitFund[];
  settings: Settings;
  isLoadingData: boolean;
  // Expenses
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<Expense | undefined>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  // Categories
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category | undefined>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  // People
  addPerson: (person: Omit<HouseholdMember, 'id'>) => Promise<HouseholdMember | undefined>;
  updatePerson: (person: HouseholdMember) => Promise<void>;
  deletePerson: (id: string) => Promise<void>;
  // Payment Modes
  addPaymentMode: (mode: Omit<PaymentMode, 'id'>) => Promise<PaymentMode | undefined>;
  updatePaymentMode: (mode: PaymentMode) => Promise<void>;
  deletePaymentMode: (id: string) => Promise<void>;
  // Debts
  addDebt: (debt: Omit<Debt, 'id'>) => Promise<Debt | undefined>;
  updateDebt: (debt: Debt) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  // Chit Funds
  addChitFund: (chit: Omit<ChitFund, 'id'>) => Promise<ChitFund | undefined>;
  updateChitFund: (chit: ChitFund) => Promise<void>;
  deleteChitFund: (id: string) => Promise<void>;
  // Settings
  updateSettings: (newSettings: Partial<Settings>) => void;
  // Getters
  getCategoryName: (id: string) => string;
  getPersonName: (id: string) => string;
  getPaymentModeName: (id: string) => string;
}