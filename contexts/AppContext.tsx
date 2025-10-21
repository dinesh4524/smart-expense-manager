import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
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
            toast.error("Failed to load your data. Please try refreshing.");
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
        <TArgs extends any[]>(apiCall: (...args: TArgs) => Promise<any>, successMessage?: string) => {
            return async (...args: TArgs) => {
                const toastId = toast.loading('Saving...');
                try {
                    await apiCall(...args);
                    await fetchData(); // Refresh data on success
                    toast.success(successMessage || 'Operation successful!', { id: toastId });
                } catch (e) {
                    const error = e as Error;
                    console.error("API call failed:", error.message);
                    toast.error(`Operation failed: ${error.message}`, { id: toastId });
                }
            };
        },
        [fetchData]
    );

    // CRUD operations
    const addExpense = wrapApiCall(async (expense: Omit<Expense, 'id'>) => {
        if (!userId) throw new Error("User not authenticated");
        await supabaseApi.addExpense(expense, userId);
    }, 'Expense added');
    const updateExpense = wrapApiCall(supabaseApi.updateExpense, 'Expense updated');
    const deleteExpense = wrapApiCall(supabaseApi.deleteExpense, 'Expense deleted');

    const addCategory = wrapApiCall(async (category: Omit<Category, 'id'>) => {
        if (!userId) throw new Error("User not authenticated");
        await supabaseApi.addCategory(category, userId);
    }, 'Category added');
    const updateCategory = wrapApiCall(supabaseApi.updateCategory, 'Category updated');
    const deleteCategory = wrapApiCall(supabaseApi.deleteCategory, 'Category deleted');

    const addPerson = wrapApiCall(async (person: Omit<HouseholdMember, 'id'>) => {
        if (!userId) throw new Error("User not authenticated");
        await supabaseApi.addPerson(person, userId);
    }, 'Person added');
    const updatePerson = wrapApiCall(supabaseApi.updatePerson, 'Person updated');
    const deletePerson = wrapApiCall(supabaseApi.deletePerson, 'Person deleted');

    const addPaymentMode = wrapApiCall(async (mode: Omit<PaymentMode, 'id'>) => {
        if (!userId) throw new Error("User not authenticated");
        await supabaseApi.addPaymentMode(mode, userId);
    }, 'Payment mode added');
    const updatePaymentMode = wrapApiCall(supabaseApi.updatePaymentMode, 'Payment mode updated');
    const deletePaymentMode = wrapApiCall(supabaseApi.deletePaymentMode, 'Payment mode deleted');

    const addDebt = wrapApiCall(async (debt: Omit<Debt, 'id'>) => {
        if (!userId) throw new Error("User not authenticated");
        await supabaseApi.addDebt(debt, userId);
    }, 'Debt record added');
    const updateDebt = wrapApiCall(supabaseApi.updateDebt, 'Debt record updated');
    const deleteDebt = wrapApiCall(supabaseApi.deleteDebt, 'Debt record deleted');

    const addChitFund = wrapApiCall(async (chit: Omit<ChitFund, 'id'>) => {
        if (!userId) throw new Error("User not authenticated");
        await supabaseApi.addChitFund(chit, userId);
    }, 'Chit fund added');
    const updateChitFund = wrapApiCall(supabaseApi.updateChitFund, 'Chit fund updated');
    const deleteChitFund = wrapApiCall(supabaseApi.deleteChitFund, 'Chit fund deleted');

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