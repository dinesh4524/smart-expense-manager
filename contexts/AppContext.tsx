import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { AppContextType, Expense, Category, Person, Settings, User, PaymentMode, Debt, ChitFund } from '../types';
import { api } from '../services/mockApi';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>(api.getExpenses);
  const [categories, setCategories] = useState<Category[]>(api.getCategories);
  const [people, setPeople] = useState<Person[]>(api.getPeople);
  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>(api.getPaymentModes);
  const [debts, setDebts] = useState<Debt[]>(api.getDebts);
  const [chitFunds, setChitFunds] = useState<ChitFund[]>(api.getChitFunds);
  const [users, setUsers] = useState<User[]>(api.getUsers);
  const [settings, setSettings] = useState<Settings>(api.getSettings);

  // Expense Management
  const addExpense = (expense: Omit<Expense, 'id'>) => {
    api.addExpense(expense);
    setExpenses(api.getExpenses());
  };
  const updateExpense = (expense: Expense) => {
    api.updateExpense(expense);
    setExpenses(api.getExpenses());
  };
  const deleteExpense = (id: string) => {
    api.deleteExpense(id);
    setExpenses(api.getExpenses());
  };

  // Category Management
  const addCategory = (category: Omit<Category, 'id'>) => {
    api.addCategory(category);
    setCategories(api.getCategories());
  };
  const updateCategory = (category: Category) => {
    api.updateCategory(category);
    setCategories(api.getCategories());
  };
  const deleteCategory = (id: string) => {
    api.deleteCategory(id);
    setCategories(api.getCategories());
  };

  // Person Management
  const addPerson = (person: Omit<Person, 'id'>) => {
    api.addPerson(person);
    setPeople(api.getPeople());
  };
  const updatePerson = (person: Person) => {
    api.updatePerson(person);
    setPeople(api.getPeople());
  };
  const deletePerson = (id: string) => {
    api.deletePerson(id);
    setPeople(api.getPeople());
  };

  // Payment Mode Management
  const addPaymentMode = (mode: Omit<PaymentMode, 'id'>) => {
    api.addPaymentMode(mode);
    setPaymentModes(api.getPaymentModes());
  };
  const updatePaymentMode = (mode: PaymentMode) => {
    api.updatePaymentMode(mode);
    setPaymentModes(api.getPaymentModes());
  };
  const deletePaymentMode = (id: string) => {
    api.deletePaymentMode(id);
    setPaymentModes(api.getPaymentModes());
  };

  // Debt Management
  const addDebt = (debt: Omit<Debt, 'id'>) => {
    api.addDebt(debt);
    setDebts(api.getDebts());
  };
  const updateDebt = (debt: Debt) => {
    api.updateDebt(debt);
    setDebts(api.getDebts());
  };
  const deleteDebt = (id: string) => {
    api.deleteDebt(id);
    setDebts(api.getDebts());
  };

  // Chit Fund Management
  const addChitFund = (chit: Omit<ChitFund, 'id'>) => {
    api.addChitFund(chit);
    setChitFunds(api.getChitFunds());
  };
  const updateChitFund = (chit: ChitFund) => {
    api.updateChitFund(chit);
    setChitFunds(api.getChitFunds());
  };
  const deleteChitFund = (id: string) => {
    api.deleteChitFund(id);
    setChitFunds(api.getChitFunds());
  };

  // User Management
  const addUser = (user: Omit<User, 'id'>) => {
    const newUser = api.addUser(user);
    setUsers(api.getUsers());
    return newUser;
  };
  const updateUser = (user: User) => {
    try {
        const updatedUser = api.updateUser(user);
        setUsers(api.getUsers());
        return updatedUser;
    } catch (e) {
        const error = e as Error;
        console.error("Failed to update user:", error.message);
        alert(`Update failed: ${error.message}`);
        setUsers(api.getUsers());
        return users.find(u => u.id === user.id) || user;
    }
  };
  const deleteUser = (id: string) => {
    api.deleteUser(id);
    setUsers(api.getUsers());
  };
  
  // Settings Management
  const updateSettings = (newSettings: Partial<Settings>) => {
    const updated = api.updateSettings(newSettings);
    setSettings(updated);
  };
  
  // Getters
  const getCategoryName = useCallback((id: string) => {
    return categories.find(c => c.id === id)?.name || 'Unknown';
  }, [categories]);

  const getPersonName = useCallback((id: string) => {
    return people.find(p => p.id === id)?.name || 'Unknown';
  }, [people]);

  const getPaymentModeName = useCallback((id: string) => {
    return paymentModes.find(p => p.id === id)?.name || 'Unknown';
  }, [paymentModes]);


  const value = useMemo(() => ({
    expenses, categories, people, paymentModes, debts, chitFunds, users, settings,
    addExpense, updateExpense, deleteExpense,
    addCategory, updateCategory, deleteCategory,
    addPerson, updatePerson, deletePerson,
    addPaymentMode, updatePaymentMode, deletePaymentMode,
    addDebt, updateDebt, deleteDebt,
    addChitFund, updateChitFund, deleteChitFund,
    addUser, updateUser, deleteUser,
    updateSettings,
    getCategoryName, getPersonName, getPaymentModeName
  }), [expenses, categories, people, paymentModes, debts, chitFunds, users, settings, getCategoryName, getPersonName, getPaymentModeName]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
