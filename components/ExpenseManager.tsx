import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import type { Expense } from '../types';
import Button from './ui/Button';
import Modal from './ui/Modal';
import { Edit, Trash, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ExpenseForm: React.FC<{ expense?: Expense; onSave: (expense: Omit<Expense, 'id'> | Expense) => Promise<void>; onCancel: () => void; }> = ({ expense, onSave, onCancel }) => {
    const { categories, people, paymentModes, addPerson, addCategory, addPaymentMode } = useAppContext();
    const [isSaving, setIsSaving] = useState(false);
    
    const [showNewPersonInput, setShowNewPersonInput] = useState(false);
    const [newPersonName, setNewPersonName] = useState('');
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showNewPaymentModeInput, setShowNewPaymentModeInput] = useState(false);
    const [newPaymentModeName, setNewPaymentModeName] = useState('');
    
    const [formData, setFormData] = useState({
        date: expense ? expense.date.split('T')[0] : new Date().toISOString().split('T')[0],
        description: expense?.description || '',
        amount: expense?.amount || '',
        categoryId: expense?.categoryId || categories[0]?.id || '',
        personId: expense?.personId || people[0]?.id || '',
        paymentModeId: expense?.paymentModeId || paymentModes[0]?.id || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'personId' && value === '__add_new__') {
            setShowNewPersonInput(true);
        } else if (name === 'categoryId' && value === '__add_new__') {
            setShowNewCategoryInput(true);
        } else if (name === 'paymentModeId' && value === '__add_new__') {
            setShowNewPaymentModeInput(true);
        } else {
            if (name === 'personId') setShowNewPersonInput(false);
            if (name === 'categoryId') setShowNewCategoryInput(false);
            if (name === 'paymentModeId') setShowNewPaymentModeInput(false);
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const parsedAmount = parseFloat(String(formData.amount));
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            toast.error("Amount must be a valid number greater than zero.");
            return;
        }
        
        setIsSaving(true);
        let finalPersonId = formData.personId;
        let finalCategoryId = formData.categoryId;
        let finalPaymentModeId = formData.paymentModeId;

        if (showNewPersonInput && newPersonName.trim() !== '') {
            const newPerson = await addPerson({ name: newPersonName.trim() });
            if (newPerson) {
                finalPersonId = newPerson.id;
            } else {
                setIsSaving(false); return;
            }
        }
        
        if (showNewCategoryInput && newCategoryName.trim() !== '') {
            const newCategory = await addCategory({ name: newCategoryName.trim() });
            if (newCategory) {
                finalCategoryId = newCategory.id;
            } else {
                setIsSaving(false); return;
            }
        }

        if (showNewPaymentModeInput && newPaymentModeName.trim() !== '') {
            const newPaymentMode = await addPaymentMode({ name: newPaymentModeName.trim(), icon: '' });
            if (newPaymentMode) {
                finalPaymentModeId = newPaymentMode.id;
            } else {
                setIsSaving(false); return;
            }
        }

        if (!finalPersonId || finalPersonId === '__add_new__') {
            toast.error("Please select or add a person.");
            setIsSaving(false); return;
        }
        if (!finalCategoryId || finalCategoryId === '__add_new__') {
            toast.error("Please select or add a category.");
            setIsSaving(false); return;
        }
        if (!finalPaymentModeId || finalPaymentModeId === '__add_new__') {
            toast.error("Please select or add a payment mode.");
            setIsSaving(false); return;
        }

        const expenseData = {
            ...formData,
            amount: parsedAmount,
            personId: finalPersonId,
            categoryId: finalCategoryId,
            paymentModeId: finalPaymentModeId,
            date: new Date(formData.date).toISOString(),
        };
        
        try {
            if (expense) {
                await onSave({ ...expense, ...expenseData });
            } else {
                await onSave(expenseData as Omit<Expense, 'id'>);
            }
            onCancel();
        } catch (error) {
            console.error("Save failed in form:", error);
        } finally {
            setIsSaving(false);
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
                <input type="number" name="amount" value={formData.amount} onChange={handleChange} required min="0.01" step="0.01" placeholder="0.00" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
            </div>
            <div>
                <label className="block text-sm font-medium">Category</label>
                {showNewCategoryInput ? (
                    <div className="flex items-center gap-2 mt-1">
                        <input 
                            type="text" 
                            placeholder="New Category Name"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            autoFocus
                        />
                        <Button type="button" variant="secondary" size="sm" onClick={() => {
                            setShowNewCategoryInput(false);
                            setFormData(prev => ({ ...prev, categoryId: categories[0]?.id || '' }));
                        }}>Cancel</Button>
                    </div>
                ) : (
                    <select name="categoryId" value={formData.categoryId} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        <option value="__add_new__">-- Add New Category --</option>
                    </select>
                )}
            </div>
            <div>
                <label className="block text-sm font-medium">Person</label>
                {showNewPersonInput ? (
                    <div className="flex items-center gap-2 mt-1">
                        <input 
                            type="text" 
                            placeholder="New Person's Name"
                            value={newPersonName}
                            onChange={(e) => setNewPersonName(e.target.value)}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            autoFocus
                        />
                        <Button type="button" variant="secondary" size="sm" onClick={() => {
                            setShowNewPersonInput(false);
                            setFormData(prev => ({ ...prev, personId: people[0]?.id || '' }));
                        }}>Cancel</Button>
                    </div>
                ) : (
                    <select name="personId" value={formData.personId} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                        {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        <option value="__add_new__">-- Add New Person --</option>
                    </select>
                )}
            </div>
            <div>
                <label className="block text-sm font-medium">Payment Mode</label>
                {showNewPaymentModeInput ? (
                     <div className="flex items-center gap-2 mt-1">
                        <input 
                            type="text" 
                            placeholder="New Payment Mode Name"
                            value={newPaymentModeName}
                            onChange={(e) => setNewPaymentModeName(e.target.value)}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            autoFocus
                        />
                        <Button type="button" variant="secondary" size="sm" onClick={() => {
                            setShowNewPaymentModeInput(false);
                            setFormData(prev => ({ ...prev, paymentModeId: paymentModes[0]?.id || '' }));
                        }}>Cancel</Button>
                    </div>
                ) : (
                    <select name="paymentModeId" value={formData.paymentModeId} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                        {paymentModes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        <option value="__add_new__">-- Add New Payment Mode --</option>
                    </select>
                )}
            </div>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save'}
                </Button>
            </div>
        </form>
    );
};

const ExpenseManager: React.FC = () => {
    const { expenses, addExpense, updateExpense, deleteExpense, getCategoryName, getPersonName, getPaymentModeName, settings } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
    const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const openAddModal = () => {
        setEditingExpense(undefined);
        setModalOpen(true);
    };

    const openEditModal = (expense: Expense) => {
        setEditingExpense(expense);
        setModalOpen(true);
    };

    const handleSave = async (expenseData: Omit<Expense, 'id'> | Expense) => {
        if ('id' in expenseData) {
            await updateExpense(expenseData);
        } else {
            await addExpense(expenseData);
        }
    };
    
    const confirmDelete = async () => {
        if (deletingExpense) {
            setIsDeleting(true);
            try {
                await deleteExpense(deletingExpense.id);
                setDeletingExpense(null);
            } catch (error) {
                console.error("Delete failed:", error);
            } finally {
                setIsDeleting(false);
            }
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
                            <Button variant="secondary" onClick={() => setDeletingExpense(null)} disabled={isDeleting}>Cancel</Button>
                            <Button variant="danger" onClick={confirmDelete} disabled={isDeleting}>
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </Button>
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