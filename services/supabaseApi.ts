import { supabase } from '@/src/integrations/supabase/client';
import type { Expense, Category, HouseholdMember, PaymentMode, Debt, ChitFund, Settings, ChitFundAuction, Income } from '../types';

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
            incomes, // Fetch incomes
            debts, 
            chitFunds,
            chitFundAuctions
        ] = await Promise.all([
            fetchTable<Category>('categories'),
            fetchTable<HouseholdMember>('household_members'),
            fetchTable<PaymentMode>('payment_modes'),
            fetchTable<any>('expenses'), 
            fetchTable<any>('incomes'), // Fetch incomes
            fetchTable<any>('debts'),
            fetchTable<any>('chit_funds'),
            fetchTable<any>('chit_fund_auctions'),
        ]);
        
        // Manually map snake_case to camelCase for frontend types
        const mappedExpenses: Expense[] = expenses.map((e: any) => ({
            id: e.id,
            date: e.date,
            description: e.description,
            amount: e.amount,
            categoryId: e.category_id,
            personId: e.household_member_id,
            paymentModeId: e.payment_mode_id,
            receiptUrl: e.receipt_url,
        }));
        
        const mappedIncomes: Income[] = incomes.map((i: any) => ({
            id: i.id,
            date: i.date,
            description: i.description,
            amount: i.amount,
            source: i.source,
        }));

        const mappedDebts: Debt[] = debts.map((d: any) => ({
            id: d.id,
            personId: d.person_id,
            amount: d.amount,
            type: d.type,
            description: d.description,
            issueDate: d.issue_date,
            dueDate: d.due_date,
            status: d.status,
        }));

        const mappedChitFunds: ChitFund[] = chitFunds.map((c: any) => ({
            id: c.id,
            name: c.name,
            totalAmount: c.total_amount,
            monthlyInstallment: c.monthly_installment,
            durationMonths: c.duration_months,
            startDate: c.start_date,
            foremanCommissionRate: c.foreman_commission_rate || 0.05, // Default to 5%
            status: c.status,
        }));
        
        const mappedChitFundAuctions: ChitFundAuction[] = chitFundAuctions.map((a: any) => ({
            id: a.id,
            chitFundId: a.chit_fund_id,
            monthNumber: a.month_number,
            auctionDate: a.auction_date,
            discountAmount: a.discount_amount,
            prizedSubscriberName: a.prized_subscriber_name,
            isUserPrized: a.is_user_prized,
        }));

        // Settings are still stored locally for simplicity (currency/theme)
        const settings: Settings = JSON.parse(localStorage.getItem('settings') || '{"currency": "₹", "theme": "light"}');

        return { 
            categories, 
            people, 
            paymentModes, 
            expenses: mappedExpenses, 
            incomes: mappedIncomes, // Return incomes
            debts: mappedDebts, 
            chitFunds: mappedChitFunds, 
            chitFundAuctions: mappedChitFundAuctions,
            settings 
        };
    },

    // --- Categories ---
    addCategory: async (category: Omit<Category, 'id'>, userId: string) => {
        const { data, error } = await supabase
            .from('categories')
            .insert([{ ...category, user_id: userId }])
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data;
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
        const { data, error } = await supabase
            .from('household_members')
            .insert([{ ...person, user_id: userId }])
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data;
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
        const { data, error } = await supabase
            .from('payment_modes')
            .insert([{ ...mode, user_id: userId }])
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data;
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
        const dbExpense = {
            user_id: userId,
            amount: expense.amount,
            description: expense.description,
            date: expense.date.split('T')[0],
            category_id: expense.categoryId,
            household_member_id: expense.personId,
            payment_mode_id: expense.paymentModeId,
        };
        const { data, error } = await supabase
            .from('expenses')
            .insert([dbExpense])
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data;
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
    
    // --- Incomes ---
    addIncome: async (income: Omit<Income, 'id'>, userId: string) => {
        const dbIncome = {
            user_id: userId,
            amount: income.amount,
            description: income.description,
            date: income.date.split('T')[0],
            source: income.source,
        };
        const { data, error } = await supabase
            .from('incomes')
            .insert([dbIncome])
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data;
    },
    updateIncome: async (income: Income) => {
        const dbIncome = {
            amount: income.amount,
            description: income.description,
            date: income.date.split('T')[0],
            source: income.source,
        };
        const { error } = await supabase
            .from('incomes')
            .update(dbIncome)
            .eq('id', income.id);
        if (error) throw new Error(error.message);
    },
    deleteIncome: async (id: string) => {
        const { error } = await supabase
            .from('incomes')
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
        const { data, error } = await supabase
            .from('debts')
            .insert([dbDebt])
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data;
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
            foreman_commission_rate: chit.foremanCommissionRate,
            status: chit.status,
        };
        const { data, error } = await supabase
            .from('chit_funds')
            .insert([dbChit])
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data;
    },
    updateChitFund: async (chit: ChitFund) => {
        const dbChit = {
            name: chit.name,
            total_amount: chit.totalAmount,
            monthly_installment: chit.monthlyInstallment,
            duration_months: chit.durationMonths,
            start_date: chit.startDate.split('T')[0],
            foreman_commission_rate: chit.foremanCommissionRate,
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
    
    // --- Chit Fund Auctions ---
    addChitFundAuction: async (auction: Omit<ChitFundAuction, 'id'>, userId: string) => {
        const dbAuction = {
            user_id: userId,
            chit_fund_id: auction.chitFundId,
            month_number: auction.monthNumber,
            auction_date: auction.auctionDate.split('T')[0],
            discount_amount: auction.discountAmount,
            prized_subscriber_name: auction.prizedSubscriberName,
            is_user_prized: auction.isUserPrized,
        };
        const { data, error } = await supabase
            .from('chit_fund_auctions')
            .insert([dbAuction])
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data;
    },
    updateChitFundAuction: async (auction: ChitFundAuction) => {
        const dbAuction = {
            month_number: auction.monthNumber,
            auction_date: auction.auctionDate.split('T')[0],
            discount_amount: auction.discountAmount,
            prized_subscriber_name: auction.prizedSubscriberName,
            is_user_prized: auction.isUserPrized,
        };
        const { error } = await supabase
            .from('chit_fund_auctions')
            .update(dbAuction)
            .eq('id', auction.id);
        if (error) throw new Error(error.message);
    },
    deleteChitFundAuction: async (id: string) => {
        const { error } = await supabase
            .from('chit_fund_auctions')
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