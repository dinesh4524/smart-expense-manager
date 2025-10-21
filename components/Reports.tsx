import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import Card from './ui/Card';
import Button from './ui/Button';
import { Download } from 'lucide-react';
import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Reports: React.FC = () => {
    const { expenses, categories, people, settings, getCategoryName, getPersonName, getPaymentModeName } = useAppContext();

    const categoryChartData = React.useMemo(() => {
        const data = categories.map(cat => ({
            name: cat.name,
            value: expenses.filter(e => e.categoryId === cat.id).reduce((sum, e) => sum + e.amount, 0)
        }));
        return data.filter(d => d.value > 0);
    }, [expenses, categories]);

    const personChartData = React.useMemo(() => {
        const data = people.map(p => ({
            name: p.name,
            amount: expenses.filter(e => e.personId === p.id).reduce((sum, e) => sum + e.amount, 0)
        }));
        return data.filter(d => d.amount > 0);
    }, [expenses, people]);

    const monthlyTrendData = React.useMemo(() => {
        const trend: { [key: string]: number } = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        expenses.forEach(exp => {
            const date = new Date(exp.date);
            const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
            trend[monthKey] = (trend[monthKey] || 0) + exp.amount;
        });
        
        return Object.entries(trend).map(([name, amount]) => ({ name, amount })).slice(-12);
    }, [expenses]);
    
    const yearlyChartData = React.useMemo(() => {
        const yearlyTotals: { [year: string]: number } = {};
        expenses.forEach(exp => {
            const year = new Date(exp.date).getFullYear().toString();
            yearlyTotals[year] = (yearlyTotals[year] || 0) + exp.amount;
        });
        return Object.entries(yearlyTotals).map(([name, amount]) => ({ name, amount }));
    }, [expenses]);
  
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4242'];

    const handleExportExcel = () => {
        const dataToExport = expenses.map(e => ({
            Date: new Date(e.date).toLocaleDateString(),
            Description: e.description,
            Category: getCategoryName(e.categoryId),
            Person: getPersonName(e.personId),
            'Payment Mode': getPaymentModeName(e.paymentModeId),
            Amount: e.amount
        }));
        const ws = utils.json_to_sheet(dataToExport);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Expenses");
        writeFile(wb, "expenses.xlsx");
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text("Expense Report", 14, 16);
        (doc as any).autoTable({
            head: [['Date', 'Description', 'Category', 'Person', 'Payment Mode', 'Amount']],
            body: expenses.map(e => [
                new Date(e.date).toLocaleDateString(),
                e.description,
                getCategoryName(e.categoryId),
                getPersonName(e.personId),
                getPaymentModeName(e.paymentModeId),
                `${settings.currency}${e.amount.toFixed(2)}`
            ]),
        });
        doc.save('expenses.pdf');
    };

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Reports</h2>
                    <div className="flex gap-2">
                        <Button onClick={handleExportExcel} variant="secondary">
                            <Download size={18} className="mr-2" /> Excel
                        </Button>
                        <Button onClick={handleExportPDF} variant="secondary">
                             <Download size={18} className="mr-2" /> PDF
                        </Button>
                    </div>
                </div>
            </Card>
            
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
                <h3 className="text-lg font-semibold mb-4">Yearly Expense Summary</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={yearlyChartData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `${settings.currency}${value.toFixed(2)}`} />
                        <Legend />
                        <Bar dataKey="amount" fill="#ffc658" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
};

export default Reports;
