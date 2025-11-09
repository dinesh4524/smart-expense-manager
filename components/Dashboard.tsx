import React, { useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import Card from './ui/Card';
import Button from './ui/Button';
import { DollarSign, Tag, User, PlusCircle, HandCoins, TrendingUp, CreditCard } from 'lucide-react';
import type { Expense, Category, HouseholdMember, Debt, Settings, Income } from '../types';

interface DashboardProps {
  setView?: (view: 'expenses' | 'reports' | 'categories' | 'people' | 'debts' | 'incomes') => void;
  dashboardData?: {
    expenses: Expense[];
    incomes: Income[];
    categories: Category[];
    people: HouseholdMember[];
    debts: Debt[];
    settings: Settings;
  }
}

const SummaryCard = ({ title, value, icon, color, onClick }: { title: string; value: string; icon: React.ReactNode; color: string, onClick?: () => void }) => (
    <Card className={`flex items-center p-4 ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`} onClick={onClick}>
        <div className={`p-3 rounded-full ${color} text-white mr-4`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </Card>
);

const Dashboard: React.FC<DashboardProps> = ({ setView, dashboardData }) => {
  const appContext = useAppContext();

  // Use props if available, otherwise use context
  const { expenses, incomes, categories, people, debts, settings } = dashboardData || appContext;
  
  // Recreate getters locally if data is passed via props
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Unknown';
  const getPersonName = (id: string) => people.find(p => p.id === id)?.name || 'Unknown';

  const currentMonth = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const monthlyExpenses = expenses.filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate >= startOfMonth && expenseDate <= endOfMonth;
    });
    
    const monthlyIncomes = incomes.filter(i => {
        const incomeDate = new Date(i.date);
        return incomeDate >= startOfMonth && incomeDate <= endOfMonth;
    });
    
    const totalExpense = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = monthlyIncomes.reduce((sum, i) => sum + i.amount, 0);
    
    return { monthlyExpenses, monthlyIncomes, totalExpense, totalIncome };
  }, [expenses, incomes]);
  
  const { monthlyExpenses, totalExpense, totalIncome } = currentMonth;
  const totalMonthlyNet = totalIncome - totalExpense;

  const totalOutstandingDebt = useMemo(() => {
    return debts.reduce((total, debt) => {
        if (debt.status === 'pending') {
            return debt.type === 'borrowed' ? total + debt.amount : total - debt.amount;
        }
        return total;
    }, 0);
  }, [debts]);

  const { topCategory, topSpender } = useMemo(() => {
    if (monthlyExpenses.length === 0) return { topCategory: 'N/A', topSpender: 'N/A' };
    
    const categorySpending = monthlyExpenses.reduce((acc, e) => {
        acc[e.categoryId] = (acc[e.categoryId] || 0) + e.amount;
        return acc;
    }, {} as Record<string, number>);

    const personSpending = monthlyExpenses.reduce((acc, e) => {
        acc[e.personId] = (acc[e.personId] || 0) + e.amount;
        return acc;
    }, {} as Record<string, number>);

    const topCatId = Object.keys(categorySpending).length > 0 ? Object.keys(categorySpending).reduce((a, b) => categorySpending[a] > categorySpending[b] ? a : b) : '';
    const topPersonId = Object.keys(personSpending).length > 0 ? Object.keys(personSpending).reduce((a, b) => personSpending[a] > personSpending[b] ? a : b) : '';
    
    return {
        topCategory: getCategoryName(topCatId) || 'N/A',
        topSpender: getPersonName(topPersonId) || 'N/A',
    };
  }, [monthlyExpenses, getCategoryName, getPersonName]);

  const categoryChartData = useMemo(() => {
    const data = categories.map(cat => ({
      name: cat.name,
      value: expenses.filter(e => e.categoryId === cat.id).reduce((sum, e) => sum + e.amount, 0)
    }));
    return data.filter(d => d.value > 0);
  }, [expenses, categories]);

  const personChartData = useMemo(() => {
    const data = people.map(p => ({
      name: p.name,
      amount: expenses.filter(e => e.personId === p.id).reduce((sum, e) => sum + e.amount, 0)
    }));
    return data.filter(d => d.amount > 0);
  }, [expenses, people]);

  const monthlyTrendData = useMemo(() => {
    const trend: { [key: string]: { expense: number, income: number } } = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const filterAndMap = (items: (Expense | Income)[], type: 'expense' | 'income') => {
        items.filter(item => new Date(item.date) >= sixMonthsAgo).forEach(item => {
            const date = new Date(item.date);
            const monthKey = `${monthNames[date.getMonth()]} '${date.getFullYear().toString().substring(2)}`;
            trend[monthKey] = trend[monthKey] || { expense: 0, income: 0 };
            trend[monthKey][type] += item.amount;
        });
    };
    
    filterAndMap(expenses, 'expense');
    filterAndMap(incomes, 'income');
    
    return Object.entries(trend).map(([name, amounts]) => ({ name, ...amounts }));
  }, [expenses, incomes]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4242'];

  const recentExpenses = useMemo(() => 
    [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
  [expenses]);

  if (expenses.length === 0 && incomes.length === 0 && setView) {
    return (
        <Card className="text-center p-10">
            <h2 className="text-2xl font-bold mb-2">Welcome to ExpenseMgr!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">You haven't added any transactions yet. Let's get started.</p>
            <div className="flex justify-center gap-4">
                <Button onClick={() => setView('incomes')}>
                    <PlusCircle size={20} className="mr-2" />
                    Add Income
                </Button>
                <Button onClick={() => setView('expenses')} variant="secondary">
                    <PlusCircle size={20} className="mr-2" />
                    Add Expense
                </Button>
            </div>
        </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard title="Monthly Income" value={`${settings.currency}${totalIncome.toFixed(2)}`} icon={<DollarSign />} color="bg-green-500" onClick={setView ? () => setView('incomes') : undefined} />
        <SummaryCard title="Monthly Expense" value={`${settings.currency}${totalExpense.toFixed(2)}`} icon={<CreditCard />} color="bg-red-500" onClick={setView ? () => setView('expenses') : undefined} />
        <SummaryCard 
            title="Monthly Net Balance" 
            value={`${settings.currency}${totalMonthlyNet.toFixed(2)}`} 
            icon={<TrendingUp />} 
            color={totalMonthlyNet >= 0 ? "bg-primary-500" : "bg-red-700"} 
        />
        <SummaryCard title="Outstanding Debt" value={`${settings.currency}${totalOutstandingDebt.toFixed(2)}`} icon={<HandCoins />} color="bg-yellow-500" onClick={setView ? () => setView('debts') : undefined}/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <h3 className="text-lg font-semibold mb-4">Expenses by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={categoryChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                        {categoryChartData.map((_entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${settings.currency}${value.toFixed(2)}`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </Card>
        <Card>
            <h3 className="text-lg font-semibold mb-4">Expenses by Person</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={personChartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${settings.currency}${value.toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="amount" fill="#82ca9d" />
                </BarChart>
            </ResponsiveContainer>
        </Card>
      </div>

      <Card>
          <h3 className="text-lg font-semibold mb-4">Monthly Cash Flow Trend (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${settings.currency}${value.toFixed(2)}`} />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#10b981" name="Income" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="expense" stroke="#ef4444" name="Expense" activeDot={{ r: 8 }} />
              </LineChart>
          </ResponsiveContainer>
      </Card>
      
      <Card>
        <h3 className="text-lg font-semibold mb-4">Recent Expenses</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="p-2 whitespace-nowrap">Date</th>
                <th className="p-2">Description</th>
                <th className="p-2 whitespace-nowrap">Category</th>
                <th className="p-2 whitespace-nowrap">Person</th>
                <th className="p-2 whitespace-nowrap text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentExpenses.map((exp) => (
                <tr key={exp.id} className="border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="p-2 whitespace-nowrap">{new Date(exp.date).toLocaleDateString()}</td>
                  <td className="p-2">{exp.description}</td>
                  <td className="p-2 whitespace-nowrap">{getCategoryName(exp.categoryId)}</td>
                  <td className="p-2 whitespace-nowrap">{getPersonName(exp.personId)}</td>
                  <td className="p-2 whitespace-nowrap text-right font-medium">{settings.currency}{exp.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
};

export default Dashboard;