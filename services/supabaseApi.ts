import { supabase } from '../integrations/supabase/client';
import type { Expense, Category, HouseholdMember, PaymentMode, Debt, ChitFund, Settings } from '../types';

// Helper function to get the current user's ID
const getUserId = () => {
    const user = supabase.auth.getUser();
    if (!user) {
        throw new Error("User not authenticated.");
    }
    return user.id;
};

// --- Data Fetching Helpers ---

const fetchTable = async <T>(tableName: string): Promise<T[]> => {
    const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error(`Error fetching ${tableName}:`, error);
        throw new Error(`Failed to fetch ${tableName}`);
    }
    // Map snake_case from DB to camelCase for frontend types if necessary, 
    // but for now, we rely on Supabase's ability to handle simple mapping or keep DB columns close to types.
    return data as T[];
};

// --- CRUD Operations ---

export const supabaseApi = {
    // --- Fetch All Data ---
    fetchAllData: async (userId: string) => {
        // Note: RLS ensures we only get the current user's data, 
        // but we still need to fetch all tables.
        const [
            categories, 
            people, 
            paymentModes, 
            expenses, 
            debts, 
            chitFunds
        ] = await Promise.all([
            fetchTable<Category>('categories'),
            fetchTable<HouseholdMember>('household_members'),
            fetchTable<PaymentMode>('payment_modes'),
            fetchTable<Expense>('expenses'),
            fetchTable<Debt>('debts'),
            fetchTable<ChitFund>('chit_funds'),
        ]);
        
        // Settings are still stored locally for simplicity (currency/theme)
        const settings: Settings = JSON.parse(localStorage.getItem('settings') || '{"currency": "₹", "theme": "light"}');

        return { categories, people, paymentModes, expenses, debts, chitFunds, settings };
    },

    // --- Categories ---
    addCategory: async (category: Omit<Category, 'id'>, userId: string) => {
        const { error } = await supabase
            .from('categories')
            .insert([{ ...category, user_id: userId }]);
        if (error) throw new Error(error.message);
    },
    updateCategory: async (category: Category) => {
        const { error } = await supabase
            .from('categories')
            .update({ name: category.name, icon: category.icon })
            .eq('id', category.id);
        if (error) throw new Error(error.message);
    },
    deleteCategory: async (id: string) => {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);
        if (error) throw new Error(error.message);
    },

    // --- Household Members (People) ---
    addPerson: async (person: Omit<HouseholdMember, 'id'>, userId: string) => {
        const { error } = await supabase
            .from('household_members')
            .insert([{ ...person, user_id: userId }]);
        if (error) throw new Error(error.message);
    },
    updatePerson: async (person: HouseholdMember) => {
        const { error } = await supabase
            .from('household_members')
            .update({ name: person.name })
            .eq('id', person.id);
        if (error) throw new Error(error.message);
    },
    deletePerson: async (id: string) => {
        const { error } = await supabase
            .from('household_members')
            .delete()
            .eq('id', id);
        if (error) throw new Error(error.message);
    },

    // --- Payment Modes ---
    addPaymentMode: async (mode: Omit<PaymentMode, 'id'>, userId: string) => {
        const { error } = await supabase
            .from('payment_modes')
            .insert([{ ...mode, user_id: userId }]);
        if (error) throw new Error(error.message);
    },
    updatePaymentMode: async (mode: PaymentMode) => {
        const { error } = await supabase
            .from('payment_modes')
            .update({ name: mode.name, icon: mode.icon })
            .eq('id', mode.id);
        if (error) throw new Error(error.message);
    },
    deletePaymentMode: async (id: string) => {
        const { error } = await supabase
            .from('payment_modes')
            .delete()
            .eq('id', id);
        if (error) throw new Error(error.message);
    },

    // --- Expenses ---
    addExpense: async (expense: Omit<Expense, 'id'>, userId: string) => {
        // Map frontend type keys to database snake_case columns
        const dbExpense = {
            user_id: userId,
            amount: expense.amount,
            description: expense.description,
            date: expense.date.split('T')[0], // Ensure date is in YYYY-MM-DD format for DB
            category_id: expense.categoryId,
            household_member_id: expense.personId, // Mapping personId to household_member_id
            payment_mode_id: expense.paymentModeId,
        };
        const { error } = await supabase
            .from('expenses')
            .insert([dbExpense]);
        if (error) throw new Error(error.message);
    },
    updateExpense: async (expense: Expense) => {
        const dbExpense = {
            amount: expense.amount,
            description: expense.description,
            date: expense.date.split('T')[0],
            category_id: expense.categoryId,
            household_member_id: expense.personId,
            payment_mode_id: expense.paymentModeId,
        };
        const { error } = await supabase
            .from('expenses')
            .update(dbExpense)
            .eq('id', expense.id);
        if (error) throw new Error(error.message);
    },
    deleteExpense: async (id: string) => {
        const { error } = await supabase
            .from('expenses')
            .delete()
            .eq('id', id);
        if (error) throw new Error(error.message);
    },

    // --- Debts ---
    addDebt: async (debt: Omit<Debt, 'id'>, userId: string) => {
        const dbDebt = {
            user_id: userId,
            person_id: debt.personId,
            amount: debt.amount,
            type: debt.type,
            description: debt.description,
            issue_date: debt.issueDate.split('T')[0],
            due_date: debt.dueDate.split('T')[0],
            status: debt.status,
        };
        const { error } = await supabase
            .from('debts')
            .insert([dbDebt]);
        if (error) throw new Error(error.message);
    },
    updateDebt: async (debt: Debt) => {
        const dbDebt = {
            person_id: debt.personId,
            amount: debt.amount,
            type: debt.type,
            description: debt.description,
            issue_date: debt.issueDate.split('T')[0],
            due_date: debt.dueDate.split('T')[0],
            status: debt.status,
        };
        const { error } = await supabase
            .from('debts')
            .update(dbDebt)
            .eq('id', debt.id);
        if (error) throw new Error(error.message);
    },
    deleteDebt: async (id: string) => {
        const { error } = await supabase
            .from('debts')
            .delete()
            .eq('id', id);
        if (error) throw new Error(error.message);
    },

    // --- Chit Funds ---
    addChitFund: async (chit: Omit<ChitFund, 'id'>, userId: string) => {
        const dbChit = {
            user_id: userId,
            name: chit.name,
            total_amount: chit.totalAmount,
            monthly_installment: chit.monthlyInstallment,
            duration_months: chit.durationMonths,
            start_date: chit.startDate.split('T')[0],
            status: chit.status,
        };
        const { error } = await supabase
            .from('chit_funds')
            .insert([dbChit]);
        if (error) throw new Error(error.message);
    },
    updateChitFund: async (chit: ChitFund) => {
        const dbChit = {
            name: chit.name,
            total_amount: chit.totalAmount,
            monthly_installment: chit.monthlyInstallment,
            duration_months: chit.durationMonths,
            start_date: chit.startDate.split('T')[0],
            status: chit.status,
        };
        const { error } = await supabase
            .from('chit_funds')
            .update(dbChit)
            .eq('id', chit.id);
        if (error) throw new Error(error.message);
    },
    deleteChitFund: async (id: string) => {
        const { error } = await supabase
            .from('chit_funds')
            .delete()
            .eq('id', id);
        if (error) throw new Error(error.message);
    },
    
    // --- Settings (Still local for now) ---
    updateSettings: (newSettings: Partial<Settings>): Settings => {
        const currentSettings: Settings = JSON.parse(localStorage.getItem('settings') || '{"currency": "₹", "theme": "light"}');
        const updatedSettings = { ...currentSettings, ...newSettings };
        localStorage.setItem('settings', JSON.stringify(updatedSettings));
        return updatedSettings;
    },
};