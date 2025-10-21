import type { Expense, Category, Person, Settings, User, PaymentMode, Debt, ChitFund } from '../types';

const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

const saveToStorage = <T,>(key: string, value: T): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key “${key}”:`, error);
  }
};

// Data is now initialized as empty arrays for a clean start.
const initialCategories: Category[] = [];
const initialPeople: Person[] = [];
const initialPaymentModes: PaymentMode[] = [];
const initialExpenses: Expense[] = [];
const initialDebts: Debt[] = [];
const initialChitFunds: ChitFund[] = [];

const initialSettings: Settings = {
  currency: '₹',
  theme: 'light'
};

// Only the admin user is kept for initial login and setup.
const initialUsers: User[] = [
    { id: '1', name: 'Admin User', email: 'admin@example.com', password: 'admin123', role: 'admin' },
];


// Initialize with default data if not present
if (!localStorage.getItem('categories')) saveToStorage('categories', initialCategories);
if (!localStorage.getItem('people')) saveToStorage('people', initialPeople);
if (!localStorage.getItem('paymentModes')) saveToStorage('paymentModes', initialPaymentModes);
if (!localStorage.getItem('expenses')) saveToStorage('expenses', initialExpenses);
if (!localStorage.getItem('debts')) saveToStorage('debts', initialDebts);
if (!localStorage.getItem('chitFunds')) saveToStorage('chitFunds', initialChitFunds);
if(!localStorage.getItem('settings')) saveToStorage('settings', initialSettings);
if(!localStorage.getItem('users')) saveToStorage('users', initialUsers);


export const api = {
  // Expenses
  getExpenses: (): Expense[] => getFromStorage('expenses', []),
  addExpense: (expense: Omit<Expense, 'id'>): Expense => {
    const expenses = api.getExpenses();
    const newExpense = { ...expense, id: Date.now().toString() };
    saveToStorage('expenses', [...expenses, newExpense]);
    return newExpense;
  },
  updateExpense: (updatedExpense: Expense): Expense => {
    let expenses = api.getExpenses();
    expenses = expenses.map(e => e.id === updatedExpense.id ? updatedExpense : e);
    saveToStorage('expenses', expenses);
    return updatedExpense;
  },
  deleteExpense: (id: string): void => {
    let expenses = api.getExpenses();
    expenses = expenses.filter(e => e.id !== id);
    saveToStorage('expenses', expenses);
  },

  // Categories
  getCategories: (): Category[] => getFromStorage('categories', []),
  addCategory: (category: Omit<Category, 'id'>): Category => {
    const categories = api.getCategories();
    const newCategory = { ...category, id: Date.now().toString() };
    saveToStorage('categories', [...categories, newCategory]);
    return newCategory;
  },
  updateCategory: (updatedCategory: Category): Category => {
    let categories = api.getCategories();
    categories = categories.map(c => c.id === updatedCategory.id ? updatedCategory : c);
    saveToStorage('categories', categories);
    return updatedCategory;
  },
  deleteCategory: (id: string): void => {
    let categories = api.getCategories();
    categories = categories.filter(c => c.id !== id);
    saveToStorage('categories', categories);
  },

  // People
  getPeople: (): Person[] => getFromStorage('people', []),
  addPerson: (person: Omit<Person, 'id'>): Person => {
    const people = api.getPeople();
    const newPerson = { ...person, id: Date.now().toString() };
    saveToStorage('people', [...people, newPerson]);
    return newPerson;
  },
  updatePerson: (updatedPerson: Person): Person => {
    let people = api.getPeople();
    people = people.map(p => p.id === updatedPerson.id ? updatedPerson : p);
    saveToStorage('people', people);
    return updatedPerson;
  },
  deletePerson: (id: string): void => {
    let people = api.getPeople();
    people = people.filter(p => p.id !== id);
    saveToStorage('people', people);
  },
  
  // Payment Modes
  getPaymentModes: (): PaymentMode[] => getFromStorage('paymentModes', []),
  addPaymentMode: (mode: Omit<PaymentMode, 'id'>): PaymentMode => {
    const modes = api.getPaymentModes();
    const newMode = { ...mode, id: Date.now().toString() };
    saveToStorage('paymentModes', [...modes, newMode]);
    return newMode;
  },
  updatePaymentMode: (updatedMode: PaymentMode): PaymentMode => {
    let modes = api.getPaymentModes();
    modes = modes.map(m => m.id === updatedMode.id ? updatedMode : m);
    saveToStorage('paymentModes', modes);
    return updatedMode;
  },
  deletePaymentMode: (id: string): void => {
    let modes = api.getPaymentModes();
    modes = modes.filter(m => m.id !== id);
    saveToStorage('paymentModes', modes);
  },

  // Debts
  getDebts: (): Debt[] => getFromStorage('debts', []),
  addDebt: (debt: Omit<Debt, 'id'>): Debt => {
    const debts = api.getDebts();
    const newDebt = { ...debt, id: Date.now().toString() };
    saveToStorage('debts', [...debts, newDebt]);
    return newDebt;
  },
  updateDebt: (updatedDebt: Debt): Debt => {
    let debts = api.getDebts();
    debts = debts.map(d => d.id === updatedDebt.id ? updatedDebt : d);
    saveToStorage('debts', debts);
    return updatedDebt;
  },
  deleteDebt: (id: string): void => {
    let debts = api.getDebts();
    debts = debts.filter(d => d.id !== id);
    saveToStorage('debts', debts);
  },
  
  // Chit Funds
  getChitFunds: (): ChitFund[] => getFromStorage('chitFunds', []),
  addChitFund: (chit: Omit<ChitFund, 'id'>): ChitFund => {
    const chits = api.getChitFunds();
    const newChit = { ...chit, id: Date.now().toString() };
    saveToStorage('chitFunds', [...chits, newChit]);
    return newChit;
  },
  updateChitFund: (updatedChit: ChitFund): ChitFund => {
    let chits = api.getChitFunds();
    chits = chits.map(c => c.id === updatedChit.id ? updatedChit : c);
    saveToStorage('chitFunds', chits);
    return updatedChit;
  },
  deleteChitFund: (id: string): void => {
    let chits = api.getChitFunds();
    chits = chits.filter(c => c.id !== id);
    saveToStorage('chitFunds', chits);
  },

  // Settings
  getSettings: (): Settings => getFromStorage('settings', initialSettings),
  updateSettings: (newSettings: Partial<Settings>): Settings => {
      const currentSettings = api.getSettings();
      const updatedSettings = { ...currentSettings, ...newSettings };
      saveToStorage('settings', updatedSettings);
      return updatedSettings;
  },
  
  // Users
  getUsers: (): User[] => getFromStorage('users', []),
  login: (email: string, password: string):User | null => {
      const users = api.getUsers();
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
      }
      return null;
  },
  register: (userData: Omit<User, 'id' | 'role'>): User | null => {
      const users = api.getUsers();
      if (users.some(u => u.email === userData.email)) {
          return null; // Email already exists
      }
      const newUser: User = { ...userData, id: Date.now().toString(), role: 'user' };
      saveToStorage('users', [...users, newUser]);
      const { password, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
  },
  addUser: (userData: Omit<User, 'id'>): User => {
    const users = api.getUsers();
    const newUser = { ...userData, id: Date.now().toString() };
    saveToStorage('users', [...users, newUser]);
    return newUser;
  },
  updateUser: (updatedUser: User): User => {
    let users = api.getUsers();
    
    const emailExists = users.some(u => u.email === updatedUser.email && u.id !== updatedUser.id);
    if (emailExists) {
        throw new Error("Email already in use by another account.");
    }
    
    const userToUpdate = users.find(u => u.id === updatedUser.id);
    if (userToUpdate) {
        // Retain password if not provided in update
        updatedUser.password = updatedUser.password || userToUpdate.password;
    }
    users = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    saveToStorage('users', users);
    return updatedUser;
  },
  deleteUser: (id: string): void => {
    let users = api.getUsers();
    users = users.filter(u => u.id !== id);
    saveToStorage('users', users);
  },
};