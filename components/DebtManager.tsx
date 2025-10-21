import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import type { Debt } from '../types';
import Button from './ui/Button';
import Modal from './ui/Modal';
import Card from './ui/Card';
import { Edit, Trash, PlusCircle, CheckCircle } from 'lucide-react';

const DebtForm: React.FC<{ debt?: Debt; onSave: (debt: Omit<Debt, 'id'> | Debt) => void; onCancel: () => void; }> = ({ debt, onSave, onCancel }) => {
    const { people } = useAppContext();
    const [formData, setFormData] = useState({
        personId: debt?.personId || people[0]?.id || '',
        amount: debt?.amount || 0,
        type: debt?.type || 'loaned',
        description: debt?.description || '',
        issueDate: debt ? debt.issueDate.split('T')[0] : new Date().toISOString().split('T')[0],
        dueDate: debt ? debt.dueDate.split('T')[0] : new Date().toISOString().split('T')[0],
        status: debt?.status || 'pending',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const debtData = {
            ...formData,
            issueDate: new Date(formData.issueDate).toISOString(),
            dueDate: new Date(formData.dueDate).toISOString(),
        };
        if (debt) {
            onSave({ ...debt, ...debtData });
        } else {
            onSave(debtData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">Person</label>
                    <select name="personId" value={formData.personId} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                        {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium">Type</label>
                    <select name="type" value={formData.type} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                        <option value="loaned">I Loaned Money</option>
                        <option value="borrowed">I Borrowed Money</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium">Amount</label>
                <input type="number" name="amount" value={formData.amount} onChange={handleChange} required min="0.01" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
            </div>
             <div>
                <label className="block text-sm font-medium">Description</label>
                <input type="text" name="description" value={formData.description} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">Issue Date</label>
                    <input type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
                </div>
                <div>
                    <label className="block text-sm font-medium">Due Date</label>
                    <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
                </div>
            </div>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Debt</Button>
            </div>
        </form>
    );
};

const DebtManager: React.FC = () => {
    const { debts, people, settings, getPersonName, addDebt, updateDebt, deleteDebt } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingDebt, setEditingDebt] = useState<Debt | undefined>(undefined);
    const [deletingDebt, setDeletingDebt] = useState<Debt | null>(null);

    const openAddModal = () => {
        setEditingDebt(undefined);
        setModalOpen(true);
    };

    const openEditModal = (debt: Debt) => {
        setEditingDebt(debt);
        setModalOpen(true);
    };

    const handleSave = (debtData: Omit<Debt, 'id'> | Debt) => {
        if ('id' in debtData) {
            updateDebt(debtData);
        } else {
            addDebt(debtData);
        }
        setModalOpen(false);
    };

    const confirmDelete = () => {
        if (deletingDebt) {
            deleteDebt(deletingDebt.id);
            setDeletingDebt(null);
        }
    };
    
    const handleMarkAsPaid = (debt: Debt) => {
        updateDebt({ ...debt, status: 'paid' });
    };
    
    const isOverdue = (debt: Debt) => {
        return new Date(debt.dueDate) < new Date() && debt.status === 'pending';
    }

    return (
        <Card>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Debt Manager</h2>
                <Button onClick={openAddModal}>
                    <PlusCircle size={20} className="mr-2" />
                    Add Debt/Loan
                </Button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="p-3">Person</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Description</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3">Due Date</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {debts.map(debt => (
                            <tr key={debt.id} className={`border-b dark:border-gray-700 ${isOverdue(debt) ? 'bg-red-100 dark:bg-red-900/50' : ''}`}>
                                <td className="p-3 font-medium">{getPersonName(debt.personId)}</td>
                                <td className="p-3">
                                    <span className={`capitalize px-2 py-1 text-xs font-semibold rounded-full ${debt.type === 'loaned' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {debt.type}
                                    </span>
                                </td>
                                <td className="p-3 text-gray-600 dark:text-gray-400">{debt.description}</td>
                                <td className="p-3 font-semibold">{settings.currency}{debt.amount.toFixed(2)}</td>
                                <td className={`p-3 ${isOverdue(debt) ? 'font-bold text-red-600' : ''}`}>{new Date(debt.dueDate).toLocaleDateString()}</td>
                                <td className="p-3">
                                    <span className={`capitalize px-2 py-1 text-xs font-semibold rounded-full ${debt.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                                        {debt.status}
                                    </span>
                                </td>
                                <td className="p-3 text-center space-x-2">
                                    {debt.status === 'pending' && (
                                        <button onClick={() => handleMarkAsPaid(debt)} title="Mark as Paid" className="text-green-600 hover:text-green-800"><CheckCircle size={18} /></button>
                                    )}
                                    <button onClick={() => openEditModal(debt)} className="text-primary-600 hover:text-primary-800"><Edit size={18} /></button>
                                    <button onClick={() => setDeletingDebt(debt)} className="text-red-600 hover:text-red-800"><Trash size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

             <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editingDebt ? 'Edit Debt' : 'Add New Debt'}>
                <DebtForm
                    debt={editingDebt}
                    onSave={handleSave}
                    onCancel={() => setModalOpen(false)}
                />
            </Modal>
            
            {deletingDebt && (
                <Modal 
                    isOpen={!!deletingDebt} 
                    onClose={() => setDeletingDebt(null)} 
                    title="Confirm Deletion"
                    footer={
                        <>
                            <Button variant="secondary" onClick={() => setDeletingDebt(null)}>Cancel</Button>
                            <Button variant="danger" onClick={confirmDelete}>Delete</Button>
                        </>
                    }
                >
                    <p>Are you sure you want to delete this record? This action cannot be undone.</p>
                </Modal>
            )}
        </Card>
    );
};

export default DebtManager;
