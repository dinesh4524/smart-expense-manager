import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import type { Income } from '../types';
import Button from './ui/Button';
import Modal from './ui/Modal';
import Card from './ui/Card';
import { Edit, Trash, PlusCircle, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const IncomeForm: React.FC<{ income?: Income; onSave: (income: Omit<Income, 'id'> | Income) => Promise<void>; onCancel: () => void; }> = ({ income, onSave, onCancel }) => {
    const [isSaving, setIsSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        date: income ? income.date.split('T')[0] : new Date().toISOString().split('T')[0],
        description: income?.description || '',
        amount: income?.amount || '',
        source: income?.source || 'Salary',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const parsedAmount = parseFloat(String(formData.amount));
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            toast.error("Amount must be a valid number greater than zero.");
            return;
        }
        
        setIsSaving(true);

        const incomeData = {
            ...formData,
            amount: parsedAmount,
            date: new Date(formData.date).toISOString(),
        };
        
        try {
            if (income) {
                await onSave({ ...income, ...incomeData });
            } else {
                await onSave(incomeData as Omit<Income, 'id'>);
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
                <label className="block text-sm font-medium">Source/Type</label>
                <select name="source" value={formData.source} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                    <option value="Salary">Salary</option>
                    <option value="Bonus">Bonus</option>
                    <option value="Investment">Investment Return</option>
                    <option value="Gift">Gift</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium">Description</label>
                <input type="text" name="description" value={formData.description} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
            </div>
            <div>
                <label className="block text-sm font-medium">Amount</label>
                <input type="number" name="amount" value={formData.amount} onChange={handleChange} required min="0.01" step="0.01" placeholder="0.00" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
            </div>
            
            <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Income'}
                </Button>
            </div>
        </form>
    );
};

const IncomeManager: React.FC = () => {
    const { incomes, addIncome, updateIncome, deleteIncome, settings } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingIncome, setEditingIncome] = useState<Income | undefined>(undefined);
    const [deletingIncome, setDeletingIncome] = useState<Income | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const openAddModal = () => {
        setEditingIncome(undefined);
        setModalOpen(true);
    };

    const openEditModal = (income: Income) => {
        setEditingIncome(income);
        setModalOpen(true);
    };

    const handleSave = async (incomeData: Omit<Income, 'id'> | Income) => {
        if ('id' in incomeData) {
            await updateIncome(incomeData);
        } else {
            await addIncome(incomeData);
        }
    };
    
    const confirmDelete = async () => {
        if (deletingIncome) {
            setIsDeleting(true);
            try {
                await deleteIncome(deletingIncome.id);
                setDeletingIncome(null);
            } catch (error) {
                console.error("Delete failed:", error);
            } finally {
                setIsDeleting(false);
            }
        }
    };
    
    const sortedIncomes = useMemo(() => 
        [...incomes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [incomes]);

    return (
        <Card>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Income Manager</h2>
                <Button onClick={openAddModal}>
                    <PlusCircle size={20} className="mr-2" />
                    Add Income
                </Button>
            </div>
            
            {sortedIncomes.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="p-3 whitespace-nowrap">Date</th>
                                <th className="p-3 whitespace-nowrap">Source</th>
                                <th className="p-3">Description</th>
                                <th className="p-3 whitespace-nowrap text-right">Amount</th>
                                <th className="p-3 whitespace-nowrap text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedIncomes.map(income => (
                                <tr key={income.id} className="border-b dark:border-gray-700">
                                    <td className="p-3 whitespace-nowrap">{new Date(income.date).toLocaleDateString()}</td>
                                    <td className="p-3 whitespace-nowrap">
                                        <span className="capitalize px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                            {income.source}
                                        </span>
                                    </td>
                                    <td className="p-3 text-gray-600 dark:text-gray-400">{income.description}</td>
                                    <td className="p-3 whitespace-nowrap text-right font-semibold text-green-600">{settings.currency}{income.amount.toFixed(2)}</td>
                                    <td className="p-3 whitespace-nowrap text-center space-x-2">
                                        <button onClick={() => openEditModal(income)} className="text-primary-600 hover:text-primary-800"><Edit size={18} /></button>
                                        <button onClick={() => setDeletingIncome(income)} className="text-red-600 hover:text-red-800"><Trash size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                    <p>No income records found. Add one to track your earnings!</p>
                </div>
            )}

             <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editingIncome ? 'Edit Income' : 'Add New Income'}>
                <IncomeForm
                    income={editingIncome}
                    onSave={handleSave}
                    onCancel={() => setModalOpen(false)}
                />
            </Modal>
            
            {deletingIncome && (
                <Modal 
                    isOpen={!!deletingIncome} 
                    onClose={() => setDeletingIncome(null)} 
                    title="Confirm Deletion"
                    footer={
                        <>
                            <Button variant="secondary" onClick={() => setDeletingIncome(null)} disabled={isDeleting}>Cancel</Button>
                            <Button variant="danger" onClick={confirmDelete} disabled={isDeleting}>
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </Button>
                        </>
                    }
                >
                    <p>Are you sure you want to delete the income record: <strong>{deletingIncome.description}</strong>? This action cannot be undone.</p>
                </Modal>
            )}
        </Card>
    );
};

export default IncomeManager;