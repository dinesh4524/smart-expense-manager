import React, { useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import Card from './ui/Card';
import Button from './ui/Button';
import { DollarSign, Tag, User, PlusCircle, HandCoins } from 'lucide-react';
import type { Expense, Category, HouseholdMember, Debt, Settings } from '../types';

interface DashboardProps {
  setView?: (view: 'expenses' | 'reports' | 'categories' | 'people' | 'debts') => void;
  dashboardData?: {
    expenses: Expense[];
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
  const { expenses, categories, people, debts, settings } = dashboardData || appContext;
  
  // Recreate getters locally if data is passed via props
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Unknown';
  const getPersonName = (id: string) => people.find(p => p.id === id)?.name || 'Unknown';

  const currentMonthExpenses = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return expenses.filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate >= startOfMonth && expenseDate <= endOfMonth;
    });
  }, [expenses]);
  
  const totalMonthlyExpense = useMemo(() => 
    currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0), 
  [currentMonthExpenses]);

  const totalOutstandingDebt = useMemo(() => {
    return debts.reduce((total, debt) => {
        if (debt.status === 'pending') {
            return debt.type === 'borrowed' ? total + debt.amount : total - debt.amount;
        }
        return total;
    }, 0);
  }, [debts]);

  const { topCategory, topSpender } = useMemo(() => {
    if (currentMonthExpenses.length === 0) return { topCategory: 'N/A', topSpender: 'N/A' };
    
    const categorySpending = currentMonthExpenses.reduce((acc, e) => {
        acc[e.categoryId] = (acc[e.categoryId] || 0) + e.amount;
        return acc;
    }, {} as Record<string, number>);

    const personSpending = currentMonthExpenses.reduce((acc, e) => {
        acc[e.personId] = (acc[e.personId] || 0) + e.amount;
        return acc;
    }, {} as Record<string, number>);

    const topCatId = Object.keys(categorySpending).length > 0 ? Object.keys(categorySpending).reduce((a, b) => categorySpending[a] > categorySpending[b] ? a : b) : '';
    const topPersonId = Object.keys(personSpending).length > 0 ? Object.keys(personSpending).reduce((a, b) => personSpending[a] > personSpending[b] ? a : b) : '';
    
    return {
        topCategory: getCategoryName(topCatId) || 'N/A',
        topSpender: getPersonName(topPersonId) || 'N/A',
    };
  }, [currentMonthExpenses, getCategoryName, getPersonName]);

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
    const trend: { [key: string]: number } = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    expenses.filter(exp => new Date(exp.date) >= sixMonthsAgo).forEach(exp => {
        const date = new Date(exp.date);
        const monthKey = `${monthNames[date.getMonth()]} '${date.getFullYear().toString().substring(2)}`;
        trend[monthKey] = (trend[monthKey] || 0) + exp.amount;
    });
    
    return Object.entries(trend).map(([name, amount]) => ({ name, amount }));
  }, [expenses]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4242'];

  const recentExpenses = useMemo(() => 
    [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
  [expenses]);

  if (expenses.length === 0 && setView) {
    return (
        <Card className="text-center p-10">
            <h2 className="text-2xl font-bold mb-2">Welcome to ExpenseMgr!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">You haven't added any expenses yet. Let's get started.</p>
            <Button onClick={() => setView('expenses')}>
                <PlusCircle size={20} className="mr-2" />
                Add Your First Expense
            </Button>
        </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard title="Monthly Expense" value={`${settings.currency}${totalMonthlyExpense.toFixed(2)}`} icon={<DollarSign />} color="bg-primary-500" />
        <SummaryCard title="Outstanding Debt" value={`${settings.currency}${totalOutstandingDebt.toFixed(2)}`} icon={<HandCoins />} color="bg-red-500" onClick={setView ? () => setView('debts') : undefined}/>
        <SummaryCard title="Top Category" value={topCategory} icon={<Tag />} color="bg-green-500" />
        <SummaryCard title="Top Spender" value={topSpender} icon={<User />} color="bg-yellow-500" />
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
          <h3 className="text-lg font-semibold mb-4">Monthly Spending Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${settings.currency}${value.toFixed(2)}`} />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
          </ResponsiveContainer>
      </Card>
      
      <Card>
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
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