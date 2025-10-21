import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import type { Debt } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Card from '../components/ui/Card';
import { Edit, Trash, PlusCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const DebtForm: React.FC<{ debt?: Debt; onSave: (debt: Omit<Debt, 'id'> | Debt) => Promise<void>; onCancel: () => void; }> = ({ debt, onSave, onCancel }) => {
    const { people, addPerson } = useAppContext();
    const [isSaving, setIsSaving] = useState(false);
    const [showNewPersonInput, setShowNewPersonInput] = useState(false);
    const [newPersonName, setNewPersonName] = useState('');
    
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
        if (name === 'personId' && value === '__add_new__') {
            setShowNewPersonInput(true);
        } else {
            if (name === 'personId') {
                setShowNewPersonInput(false);
            }
            setFormData(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) : value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        let finalPersonId = formData.personId;

        if (showNewPersonInput && newPersonName.trim() !== '') {
            const newPerson = await addPerson({ name: newPersonName.trim() });
            if (newPerson) {
                finalPersonId = newPerson.id;
            } else {
                setIsSaving(false);
                return; // Error toast is shown by addPerson
            }
        }

        if (!finalPersonId || finalPersonId === '__add_new__') {
            toast.error("Please select or add a person.");
            setIsSaving(false);
            return;
        }

        const debtData = {
            ...formData,
            personId: finalPersonId,
            issueDate: new Date(formData.issueDate).toISOString(),
            dueDate: new Date(formData.dueDate).toISOString(),
        };
        
        try {
            if (debt) {
                await onSave({ ...debt, ...debtData });
            } else {
                await onSave(debtData);
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Debt'}
                </Button>
            </div>
        </form>
    );
};

const DebtManager: React.FC = () => {
    const { debts, people, settings, getPersonName, addDebt, updateDebt, deleteDebt } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingDebt, setEditingDebt] = useState<Debt | undefined>(undefined);
    const [deletingDebt, setDeletingDebt] = useState<Debt | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const openAddModal = () => {
        setEditingDebt(undefined);
        setModalOpen(true);
    };

    const openEditModal = (debt: Debt) => {
        setEditingDebt(debt);
        setModalOpen(true);
    };

    const handleSave = async (debtData: Omit<Debt, 'id'> | Debt) => {
        if ('id' in debtData) {
            await updateDebt(debtData);
        } else {
            await addDebt(debtData);
        }
    };

    const confirmDelete = async () => {
        if (deletingDebt) {
            setIsDeleting(true);
            try {
                await deleteDebt(deletingDebt.id);
                setDeletingDebt(null);
            } catch (error) {
                console.error("Delete failed:", error);
            } finally {
                setIsDeleting(false);
            }
        }
    };
    
    const handleMarkAsPaid = async (debt: Debt) => {
        await updateDebt({ ...debt, status: 'paid' });
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
                            <th className="p-3 whitespace-nowrap">Person</th>
                            <th className="p-3 whitespace-nowrap">Type</th>
                            <th className="p-3">Description</th>
                            <th className="p-3 whitespace-nowrap">Amount</th>
                            <th className="p-3 whitespace-nowrap">Due Date</th>
                            <th className="p-3 whitespace-nowrap">Status</th>
                            <th className="p-3 whitespace-nowrap text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {debts.map(debt => (
                            <tr key={debt.id} className={`border-b dark:border-gray-700 ${isOverdue(debt) ? 'bg-red-100 dark:bg-red-900/50' : ''}`}>
                                <td className="p-3 whitespace-nowrap font-medium">{getPersonName(debt.personId)}</td>
                                <td className="p-3 whitespace-nowrap">
                                    <span className={`capitalize px-2 py-1 text-xs font-semibold rounded-full ${debt.type === 'loaned' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {debt.type}
                                    </span>
                                </td>
                                <td className="p-3 text-gray-600 dark:text-gray-400">{debt.description}</td>
                                <td className="p-3 whitespace-nowrap font-semibold">{settings.currency}{debt.amount.toFixed(2)}</td>
                                <td className={`p-3 whitespace-nowrap ${isOverdue(debt) ? 'font-bold text-red-600' : ''}`}>{new Date(debt.dueDate).toLocaleDateString()}</td>
                                <td className="p-3 whitespace-nowrap">
                                    <span className={`capitalize px-2 py-1 text-xs font-semibold rounded-full ${debt.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                                        {debt.status}
                                    </span>
                                </td>
                                <td className="p-3 whitespace-nowrap text-center space-x-2">
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
                            <Button variant="secondary" onClick={() => setDeletingDebt(null)} disabled={isDeleting}>Cancel</Button>
                            <Button variant="danger" onClick={confirmDelete} disabled={isDeleting}>
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </Button>
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