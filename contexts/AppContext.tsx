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

    // Helper function to wrap API calls and refresh data
    const wrapApiCall = useCallback((apiCall: () => Promise<void>) => async () => {
        try {
            await apiCall();
            await fetchData();
        } catch (e) {
            const error = e as Error;
            console.error("API call failed:", error.message);
            alert(`Operation failed: ${error.message}`);
        }
    }, [fetchData]);

    // Expense Management
    const addExpense = wrapApiCall(() => supabaseApi.addExpense(state.expenses[0], userId!)); // Placeholder, actual implementation below
    const updateExpense = wrapApiCall(() => supabaseApi.updateExpense(state.expenses[0])); // Placeholder, actual implementation below
    const deleteExpense = wrapApiCall(() => supabaseApi.deleteExpense('')); // Placeholder, actual implementation below

    // Re-implementing CRUD functions using the wrapper and correct arguments
    const addExpenseReal = wrapApiCall((expense: Omit<Expense, 'id'>) => supabaseApi.addExpense(expense, userId!));
    const updateExpenseReal = wrapApiCall((expense: Expense) => supabaseApi.updateExpense(expense));
    const deleteExpenseReal = wrapApiCall((id: string) => supabaseApi.deleteExpense(id));

    const addCategoryReal = wrapApiCall((category: Omit<Category, 'id'>) => supabaseApi.addCategory(category, userId!));
    const updateCategoryReal = wrapApiCall((category: Category) => supabaseApi.updateCategory(category));
    const deleteCategoryReal = wrapApiCall((id: string) => supabaseApi.deleteCategory(id));

    const addPersonReal = wrapApiCall((person: Omit<HouseholdMember, 'id'>) => supabaseApi.addPerson(person, userId!));
    const updatePersonReal = wrapApiCall((person: HouseholdMember) => supabaseApi.updatePerson(person));
    const deletePersonReal = wrapApiCall((id: string) => supabaseApi.deletePerson(id));

    const addPaymentModeReal = wrapApiCall((mode: Omit<PaymentMode, 'id'>) => supabaseApi.addPaymentMode(mode, userId!));
    const updatePaymentModeReal = wrapApiCall((mode: PaymentMode) => supabaseApi.updatePaymentMode(mode));
    const deletePaymentModeReal = wrapApiCall((id: string) => supabaseApi.deletePaymentMode(id));

    const addDebtReal = wrapApiCall((debt: Omit<Debt, 'id'>) => supabaseApi.addDebt(debt, userId!));
    const updateDebtReal = wrapApiCall((debt: Debt) => supabaseApi.updateDebt(debt));
    const deleteDebtReal = wrapApiCall((id: string) => supabaseApi.deleteDebt(id));

    const addChitFundReal = wrapApiCall((chit: Omit<ChitFund, 'id'>) => supabaseApi.addChitFund(chit, userId!));
    const updateChitFundReal = wrapApiCall((chit: ChitFund) => supabaseApi.updateChitFund(chit));
    const deleteChitFundReal = wrapApiCall((id: string) => supabaseApi.deleteChitFund(id));

    // Settings Management
    const updateSettings = (newSettings: Partial<Settings>) => {
        const updated = supabaseApi.updateSettings(newSettings);
        setState(prev => ({ ...prev, settings: updated }));
    };

    // Getters
    const getCategoryName = useCallback((id: string) => {
        return state.categories.find(c => c.id === id)?.name || 'Unknown';
    }, [state.categories]);

    const getPersonName = useCallback((id: string) => {
        return state.people.find(p => p.id === id)?.name || 'Unknown';
    }, [state.people]);

    const getPaymentModeName = useCallback((id: string) => {
        return state.paymentModes.find(p => p.id === id)?.name || 'Unknown';
    }, [state.paymentModes]);


    const value = useMemo(() => ({
        expenses: state.expenses, 
        categories: state.categories, 
        people: state.people, 
        paymentModes: state.paymentModes, 
        debts: state.debts, 
        chitFunds: state.chitFunds, 
        settings: state.settings,
        isLoadingData: state.isLoadingData,
        // CRUD functions
        addExpense: addExpenseReal, 
        updateExpense: updateExpenseReal, 
        deleteExpense: deleteExpenseReal,
        addCategory: addCategoryReal, 
        updateCategory: updateCategoryReal, 
        deleteCategory: deleteCategoryReal,
        addPerson: addPersonReal, 
        updatePerson: updatePersonReal, 
        deletePerson: deletePersonReal,
        addPaymentMode: addPaymentModeReal, 
        updatePaymentMode: updatePaymentModeReal, 
        deletePaymentMode: deletePaymentModeReal,
        addDebt: addDebtReal, 
        updateDebt: updateDebtReal, 
        deleteDebt: deleteDebtReal,
        addChitFund: addChitFundReal, 
        updateChitFund: updateChitFundReal, 
        deleteChitFund: deleteChitFundReal,
        // Settings
        updateSettings,
        // Getters
        getCategoryName, 
        getPersonName, 
        getPaymentModeName,
        // Dummy user functions removed as they are handled by Supabase Auth
        addUser: () => { throw new Error("User management is handled by Supabase Auth."); },
        updateUser: () => { throw new Error("User management is handled by Supabase Auth."); },
        deleteUser: () => { throw new Error("User management is handled by Supabase Auth."); },
        users: [], // Removed local user state
    }), [
        state, 
        getCategoryName, 
        getPersonName, 
        getPaymentModeName,
        addExpenseReal, updateExpenseReal, deleteExpenseReal,
        addCategoryReal, updateCategoryReal, deleteCategoryReal,
        addPersonReal, updatePersonReal, deletePersonReal,
        addPaymentModeReal, updatePaymentModeReal, deletePaymentModeReal,
        addDebtReal, updateDebtReal, deleteDebtReal,
        addChitFundReal, updateChitFundReal, deleteChitFundReal,
    ]);

    return <AppContext.Provider value={value as unknown as AppContextType}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};