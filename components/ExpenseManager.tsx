import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import type { Expense } from '../types';
import Button from './ui/Button';
import Modal from './ui/Modal';
import { Edit, Trash, PlusCircle } from 'lucide-react';

const ExpenseForm: React.FC<{ expense?: Expense; onSave: (expense: Omit<Expense, 'id'> | Expense) => void; onCancel: () => void; }> = ({ expense, onSave, onCancel }) => {
    const { categories, people, paymentModes } = useAppContext();
    const [formData, setFormData] = useState({
        date: expense ? expense.date.split('T')[0] : new Date().toISOString().split('T')[0],
        description: expense?.description || '',
        amount: expense?.amount || 0,
        categoryId: expense?.categoryId || categories[0]?.id || '',
        personId: expense?.personId || people[0]?.id || '',
        paymentModeId: expense?.paymentModeId || paymentModes[0]?.id || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.amount <= 0) {
            alert("Amount must be greater than zero.");
            return;
        }
        const expenseData = {
            ...formData,
            date: new Date(formData.date).toISOString(),
        };
        if (expense) {
            onSave({ ...expense, ...expenseData });
        } else {
            onSave(expenseData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium">Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
            </div>
            <div>
                <label className="block text-sm font-medium">Description</label>
                <input type="text" name="description" value={formData.description} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
            </div>
            <div>
                <label className="block text-sm font-medium">Amount</label>
                <input type="number" name="amount" value={formData.amount} onChange={handleChange} required min="0.01" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
            </div>
            <div>
                <label className="block text-sm font-medium">Category</label>
                <select name="categoryId" value={formData.categoryId} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium">Person</label>
                <select name="personId" value={formData.personId} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                    {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium">Payment Mode</label>
                <select name="paymentModeId" value={formData.paymentModeId} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                    {paymentModes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save</Button>
            </div>
        </form>
    );
};

const ExpenseManager: React.FC = () => {
    const { expenses, addExpense, updateExpense, deleteExpense, getCategoryName, getPersonName, getPaymentModeName, settings } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
    const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

    const openAddModal = () => {
        setEditingExpense(undefined);
        setModalOpen(true);
    };

    const openEditModal = (expense: Expense) => {
        setEditingExpense(expense);
        setModalOpen(true);
    };

    const handleSave = (expenseData: Omit<Expense, 'id'> | Expense) => {
        if ('id' in expenseData) {
            updateExpense(expenseData);
        } else {
            addExpense(expenseData);
        }
        setModalOpen(false);
    };
    
    const confirmDelete = () => {
        if (deletingExpense) {
            deleteExpense(deletingExpense.id);
            setDeletingExpense(null);
        }
    };

    const [filter, setFilter] = useState({ category: 'all', person: 'all', search: '' });
    const [sort, setSort] = useState({ key: 'date', order: 'desc' });
    
    const filteredAndSortedExpenses = useMemo(() => {
        return expenses
            .filter(e => 
                (filter.category === 'all' || e.categoryId === filter.category) &&
                (filter.person === 'all' || e.personId === filter.person) &&
                (e.description.toLowerCase().includes(filter.search.toLowerCase()))
            )
            .sort((a, b) => {
                const valA = sort.key === 'date' ? new Date(a.date).getTime() : a.amount;
                const valB = sort.key === 'date' ? new Date(b.date).getTime() : b.amount;
                return sort.order === 'asc' ? valA - valB : valB - valA;
            });
    }, [expenses, filter, sort]);


    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Expense Manager</h2>
                <Button onClick={openAddModal}>
                    <PlusCircle size={20} className="mr-2" />
                    Add Expense
                </Button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                {filteredAndSortedExpenses.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Description</th>
                                    <th className="p-3">Category</th>
                                    <th className="p-3">Person</th>
                                    <th className="p-3">Payment Mode</th>
                                    <th className="p-3 text-right">Amount</th>
                                    <th className="p-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAndSortedExpenses.map(expense => (
                                    <tr key={expense.id} className="border-b dark:border-gray-700">
                                        <td className="p-3">{new Date(expense.date).toLocaleDateString()}</td>
                                        <td className="p-3">{expense.description}</td>
                                        <td className="p-3">{getCategoryName(expense.categoryId)}</td>
                                        <td className="p-3">{getPersonName(expense.personId)}</td>
                                        <td className="p-3">{getPaymentModeName(expense.paymentModeId)}</td>
                                        <td className="p-3 text-right font-medium">{settings.currency}{expense.amount.toFixed(2)}</td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => openEditModal(expense)} className="text-primary-600 hover:text-primary-800 mr-2"><Edit size={18} /></button>
                                            <button onClick={() => setDeletingExpense(expense)} className="text-red-600 hover:text-red-800"><Trash size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 ) : (
                    <div className="text-center p-8">
                        <h3 className="text-xl font-semibold">No Expenses Found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Get started by adding your first expense.</p>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editingExpense ? 'Edit Expense' : 'Add Expense'}>
                <ExpenseForm 
                    expense={editingExpense} 
                    onSave={handleSave} 
                    onCancel={() => setModalOpen(false)} 
                />
            </Modal>
            
            {deletingExpense && (
                <Modal 
                    isOpen={!!deletingExpense} 
                    onClose={() => setDeletingExpense(null)} 
                    title="Confirm Deletion"
                    footer={
                        <>
                            <Button variant="secondary" onClick={() => setDeletingExpense(null)}>Cancel</Button>
                            <Button variant="danger" onClick={confirmDelete}>Delete</Button>
                        </>
                    }
                >
                    <p>Are you sure you want to delete the expense: <strong>{deletingExpense.description}</strong>? This action cannot be undone.</p>
                </Modal>
            )}
        </div>
    );
};

export default ExpenseManager;
