import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback, useEffect } from 'react';
import type { AppContextType, Expense, Category, HouseholdMember, Settings, PaymentMode, Debt, ChitFund } from '../types';
import { supabaseApi } from '../services/supabaseApi';
import { useSession } from '../src/contexts/SessionContext';

// Define initial state structure
interface AppState {
    expenses: Expense[];
    categories: Category[];
    people: HouseholdMember[];
    paymentModes: PaymentMode[];
    debts: Debt[];
    chitFunds: ChitFund[];
    settings: Settings;
    isLoadingData: boolean;
}

const initialAppState: AppState = {
    expenses: [],
    categories: [],
    people: [],
    paymentModes: [],
    debts: [],
    chitFunds: [],
    settings: { currency: '₹', theme: 'light' },
    isLoadingData: true,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, session } = useSession();
    const [state, setState] = useState<AppState>(initialAppState);

    const userId = user?.id;

    const fetchData = useCallback(async () => {
        if (!userId) return;
        setState(prev => ({ ...prev, isLoadingData: true }));
        try {
            const data = await supabaseApi.fetchAllData(userId);
            setState({
                ...data,
                isLoadingData: false,
            });
        } catch (error) {
            console.error("Failed to fetch initial data:", error);
            setState(prev => ({ ...prev, isLoadingData: false }));
        }
    }, [userId]);

    useEffect(() => {
        if (session) {
            fetchData();
        }
    }, [session, fetchData]);

    // Helper function to wrap API calls, handle errors, and refresh data
    const wrapApiCall = useCallback(
        <TArgs extends any[]>(apiCall: (...args: TArgs) => Promise<any>) => {
            return async (...args: TArgs) => {
                try {
                    await apiCall(...args);
                    await fetchData(); // Refresh data on success
                } catch (e) {
                    const error = e as Error;
                    console.error("API call failed:", error.message);
                    alert(`Operation failed: ${error.message}`);
                }
            };
        },
        [fetchData]
    );

    // CRUD operations
    const addExpense = wrapApiCall(async (expense: Omit<Expense, 'id'>) => {
        if (!userId) throw new Error("User not authenticated");
        await supabaseApi.addExpense(expense, userId);
    });
    const updateExpense = wrapApiCall(supabaseApi.updateExpense);
    const deleteExpense = wrapApiCall(supabaseApi.deleteExpense);

    const addCategory = wrapApiCall(async (category: Omit<Category, 'id'>) => {
        if (!userId) throw new Error("User not authenticated");
        await supabaseApi.addCategory(category, userId);
    });
    const updateCategory = wrapApiCall(supabaseApi.updateCategory);
    const deleteCategory = wrapApiCall(supabaseApi.deleteCategory);

    const addPerson = wrapApiCall(async (person: Omit<HouseholdMember, 'id'>) => {
        if (!userId) throw new Error("User not authenticated");
        await supabaseApi.addPerson(person, userId);
    });
    const updatePerson = wrapApiCall(supabaseApi.updatePerson);
    const deletePerson = wrapApiCall(supabaseApi.deletePerson);

    const addPaymentMode = wrapApiCall(async (mode: Omit<PaymentMode, 'id'>) => {
        if (!userId) throw new Error("User not authenticated");
        await supabaseApi.addPaymentMode(mode, userId);
    });
    const updatePaymentMode = wrapApiCall(supabaseApi.updatePaymentMode);
    const deletePaymentMode = wrapApiCall(supabaseApi.deletePaymentMode);

    const addDebt = wrapApiCall(async (debt: Omit<Debt, 'id'>) => {
        if (!userId) throw new Error("User not authenticated");
        await supabaseApi.addDebt(debt, userId);
    });
    const updateDebt = wrapApiCall(supabaseApi.updateDebt);
    const deleteDebt = wrapApiCall(supabaseApi.deleteDebt);

    const addChitFund = wrapApiCall(async (chit: Omit<ChitFund, 'id'>) => {
        if (!userId) throw new Error("User not authenticated");
        await supabaseApi.addChitFund(chit, userId);
    });
    const updateChitFund = wrapApiCall(supabaseApi.updateChitFund);
    const deleteChitFund = wrapApiCall(supabaseApi.deleteChitFund);

    // Settings Management
    const updateSettings = (newSettings: Partial<Settings>) => {
        const updated = supabaseApi.updateSettings(newSettings);
        setState(prev => ({ ...prev, settings: updated }));
    };

    // Getters
    const getCategoryName = useCallback((id: string) => state.categories.find(c => c.id === id)?.name || 'Unknown', [state.categories]);
    const getPersonName = useCallback((id: string) => state.people.find(p => p.id === id)?.name || 'Unknown', [state.people]);
    const getPaymentModeName = useCallback((id: string) => state.paymentModes.find(p => p.id === id)?.name || 'Unknown', [state.paymentModes]);

    const value: AppContextType = useMemo(() => ({
        expenses: state.expenses, 
        categories: state.categories, 
        people: state.people, 
        paymentModes: state.paymentModes, 
        debts: state.debts, 
        chitFunds: state.chitFunds, 
        settings: state.settings,
        isLoadingData: state.isLoadingData,
        addExpense, 
        updateExpense, 
        deleteExpense,
        addCategory, 
        updateCategory, 
        deleteCategory,
        addPerson, 
        updatePerson, 
        deletePerson,
        addPaymentMode, 
        updatePaymentMode, 
        deletePaymentMode,
        addDebt, 
        updateDebt, 
        deleteDebt,
        addChitFund, 
        updateChitFund, 
        deleteChitFund,
        updateSettings,
        getCategoryName, 
        getPersonName, 
        getPaymentModeName,
    }), [
        state, 
        getCategoryName, 
        getPersonName, 
        getPaymentModeName,
        addExpense, updateExpense, deleteExpense,
        addCategory, updateCategory, deleteCategory,
        addPerson, updatePerson, deletePerson,
        addPaymentMode, updatePaymentMode, deletePaymentMode,
        addDebt, updateDebt, deleteDebt,
        addChitFund, updateChitFund, deleteChitFund,
        updateSettings
    ]);

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};