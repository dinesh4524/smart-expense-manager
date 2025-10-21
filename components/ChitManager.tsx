import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import type { ChitFund } from '../types';
import Button from './ui/Button';
import Modal from './ui/Modal';
import Card from './ui/Card';
import { Edit, Trash, PlusCircle } from 'lucide-react';

const ChitFundForm: React.FC<{ chit?: ChitFund; onSave: (chit: Omit<ChitFund, 'id'> | ChitFund) => void; onCancel: () => void; }> = ({ chit, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: chit?.name || '',
        totalAmount: chit?.totalAmount || 0,
        monthlyInstallment: chit?.monthlyInstallment || 0,
        durationMonths: chit?.durationMonths || 0,
        startDate: chit ? chit.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
        status: chit?.status || 'active',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: ['totalAmount', 'monthlyInstallment', 'durationMonths'].includes(name) ? parseFloat(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const chitData = {
            ...formData,
            startDate: new Date(formData.startDate).toISOString(),
        };
        if (chit) {
            onSave({ ...chit, ...chitData });
        } else {
            onSave(chitData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium">Chit Fund Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium">Total Amount</label>
                    <input type="number" name="totalAmount" value={formData.totalAmount} onChange={handleChange} required min="0" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
                </div>
                <div>
                    <label className="block text-sm font-medium">Monthly Installment</label>
                    <input type="number" name="monthlyInstallment" value={formData.monthlyInstallment} onChange={handleChange} required min="0" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">Duration (Months)</label>
                    <input type="number" name="durationMonths" value={formData.durationMonths} onChange={handleChange} required min="1" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
                </div>
                <div>
                    <label className="block text-sm font-medium">Start Date</label>
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                </select>
            </div>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Chit Fund</Button>
            </div>
        </form>
    );
};

const ChitManager: React.FC = () => {
    const { chitFunds, settings, addChitFund, updateChitFund, deleteChitFund } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingChit, setEditingChit] = useState<ChitFund | undefined>(undefined);
    const [deletingChit, setDeletingChit] = useState<ChitFund | null>(null);

    const openAddModal = () => {
        setEditingChit(undefined);
        setModalOpen(true);
    };

    const openEditModal = (chit: ChitFund) => {
        setEditingChit(chit);
        setModalOpen(true);
    };

    const handleSave = (chitData: Omit<ChitFund, 'id'> | ChitFund) => {
        if ('id' in chitData) {
            updateChitFund(chitData);
        } else {
            addChitFund(chitData);
        }
        setModalOpen(false);
    };

    const confirmDelete = () => {
        if (deletingChit) {
            deleteChitFund(deletingChit.id);
            setDeletingChit(null);
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Chit Fund Manager</h2>
                <Button onClick={openAddModal}>
                    <PlusCircle size={20} className="mr-2" />
                    Add Chit Fund
                </Button>
            </div>
            
            {chitFunds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {chitFunds.map(chit => (
                        <Card key={chit.id}>
                           <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-primary-600 dark:text-primary-400">{chit.name}</h3>
                                     <span className={`capitalize px-2 py-1 text-xs font-semibold rounded-full ${chit.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                                        {chit.status}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openEditModal(chit)} className="text-primary-600 hover:text-primary-800"><Edit size={18} /></button>
                                    <button onClick={() => setDeletingChit(chit)} className="text-red-600 hover:text-red-800"><Trash size={18} /></button>
                                </div>
                           </div>
                           <div className="mt-4 space-y-2 text-sm">
                               <div className="flex justify-between">
                                   <span className="text-gray-500 dark:text-gray-400">Total Amount:</span>
                                   <span className="font-semibold">{settings.currency}{chit.totalAmount.toLocaleString('en-IN')}</span>
                               </div>
                               <div className="flex justify-between">
                                   <span className="text-gray-500 dark:text-gray-400">Installment:</span>
                                   <span className="font-semibold">{settings.currency}{chit.monthlyInstallment.toLocaleString('en-IN')} /mo</span>
                               </div>
                               <div className="flex justify-between">
                                   <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                                   <span className="font-semibold">{chit.durationMonths} Months</span>
                               </div>
                                <div className="flex justify-between">
                                   <span className="text-gray-500 dark:text-gray-400">Start Date:</span>
                                   <span className="font-semibold">{new Date(chit.startDate).toLocaleDateString()}</span>
                               </div>
                           </div>
                        </Card>
                    ))}
                </div>
             ) : (
                <Card className="text-center p-10">
                    <h3 className="text-xl font-semibold">No Chit Funds Tracked</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Get started by adding your first chit fund.</p>
                </Card>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editingChit ? 'Edit Chit Fund' : 'Add New Chit Fund'}>
                <ChitFundForm
                    chit={editingChit}
                    onSave={handleSave}
                    onCancel={() => setModalOpen(false)}
                />
            </Modal>
            
            {deletingChit && (
                <Modal 
                    isOpen={!!deletingChit} 
                    onClose={() => setDeletingChit(null)} 
                    title="Confirm Deletion"
                    footer={
                        <>
                            <Button variant="secondary" onClick={() => setDeletingChit(null)}>Cancel</Button>
                            <Button variant="danger" onClick={confirmDelete}>Delete</Button>
                        </>
                    }
                >
                    <p>Are you sure you want to delete the chit fund <strong>{deletingChit.name}</strong>? This action cannot be undone.</p>
                </Modal>
            )}
        </div>
    );
};

export default ChitManager;
