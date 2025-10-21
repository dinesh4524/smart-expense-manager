import { ReactNode } from 'react';

export interface Expense {
  id: string;
  date: string; // ISO string format
  description: string;
  amount: number;
  categoryId: string;
  personId: string;
  paymentModeId: string;
  receiptUrl?: string; // Optional URL for uploaded receipt
}

export interface Category {
  id: string;
  name: string;
  icon?: string; // Emoji or icon name
}

export interface Person {
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
    personId: string;
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

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Should not be sent to client in a real app
  role: 'admin' | 'user';
}

export interface AppContextType {
  expenses: Expense[];
  categories: Category[];
  people: Person[];
  paymentModes: PaymentMode[];
  debts: Debt[];
  chitFunds: ChitFund[];
  users: User[];
  settings: Settings;
  // Expenses
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  // Categories
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  // People
  addPerson: (person: Omit<Person, 'id'>) => void;
  updatePerson: (person: Person) => void;
  deletePerson: (id: string) => void;
  // Payment Modes
  addPaymentMode: (mode: Omit<PaymentMode, 'id'>) => void;
  updatePaymentMode: (mode: PaymentMode) => void;
  deletePaymentMode: (id: string) => void;
  // Debts
  addDebt: (debt: Omit<Debt, 'id'>) => void;
  updateDebt: (debt: Debt) => void;
  deleteDebt: (id: string) => void;
  // Chit Funds
  addChitFund: (chit: Omit<ChitFund, 'id'>) => void;
  updateChitFund: (chit: ChitFund) => void;
  deleteChitFund: (id: string) => void;
  // Users
  addUser: (user: Omit<User, 'id'>) => User;
  updateUser: (user: User) => User;
  deleteUser: (id: string) => void;
  // Settings
  updateSettings: (newSettings: Partial<Settings>) => void;
  // Getters
  getCategoryName: (id: string) => string;
  getPersonName: (id: string) => string;
  getPaymentModeName: (id: string) => string;
}
