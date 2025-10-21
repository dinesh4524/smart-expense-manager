import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import type { PaymentMode } from '../types';
import Button from './ui/Button';
import Modal from './ui/Modal';
import { Edit, Trash, PlusCircle } from 'lucide-react';
import Card from './ui/Card';

const PaymentModeForm: React.FC<{ mode?: PaymentMode; onSave: (mode: Omit<PaymentMode, 'id'> | PaymentMode) => void; onCancel: () => void; }> = ({ mode, onSave, onCancel }) => {
    const [name, setName] = useState(mode?.name || '');
    const [icon, setIcon] = useState(mode?.icon || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const modeData = { name, icon };
        if (mode) {
            onSave({ ...mode, ...modeData });
        } else {
            onSave(modeData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium">Payment Mode Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
            </div>
            <div>
                <label className="block text-sm font-medium">Icon (Emoji)</label>
                <input type="text" value={icon} onChange={(e) => setIcon(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
            </div>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save</Button>
            </div>
        </form>
    );
};


const PaymentModeManager: React.FC = () => {
    const { paymentModes, addPaymentMode, updatePaymentMode, deletePaymentMode } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingMode, setEditingMode] = useState<PaymentMode | undefined>(undefined);
    const [deletingMode, setDeletingMode] = useState<PaymentMode | null>(null);

    const openAddModal = () => {
        setEditingMode(undefined);
        setModalOpen(true);
    };

    const openEditModal = (mode: PaymentMode) => {
        setEditingMode(mode);
        setModalOpen(true);
    };

    const handleSave = (modeData: Omit<PaymentMode, 'id'> | PaymentMode) => {
        if ('id' in modeData) {
            updatePaymentMode(modeData);
        } else {
            addPaymentMode(modeData);
        }
        setModalOpen(false);
    };
    
    const confirmDelete = () => {
        if (deletingMode) {
            deletePaymentMode(deletingMode.id);
            setDeletingMode(null);
        }
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Manage Payment Modes</h2>
                <Button onClick={openAddModal}>
                    <PlusCircle size={20} className="mr-2" />
                    Add Payment Mode
                </Button>
            </div>
            {paymentModes.length > 0 ? (
                <ul className="space-y-2">
                    {paymentModes.map(mode => (
                        <li key={mode.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center">
                               <span className="text-2xl mr-4">{mode.icon}</span>
                               <span className="font-medium">{mode.name}</span>
                            </div>
                            <div>
                                <button onClick={() => openEditModal(mode)} className="text-primary-600 hover:text-primary-800 mr-2"><Edit size={18} /></button>
                                <button onClick={() => setDeletingMode(mode)} className="text-red-600 hover:text-red-800"><Trash size={18} /></button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                 <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                    <p>No payment modes found. Add one to get started!</p>
                </div>
            )}
             <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editingMode ? 'Edit Payment Mode' : 'Add Payment Mode'}>
                <PaymentModeForm
                    mode={editingMode}
                    onSave={handleSave}
                    onCancel={() => setModalOpen(false)}
                />
            </Modal>
            
            {deletingMode && (
                <Modal 
                    isOpen={!!deletingMode} 
                    onClose={() => setDeletingMode(null)} 
                    title="Confirm Deletion"
                    footer={
                        <>
                            <Button variant="secondary" onClick={() => setDeletingMode(null)}>Cancel</Button>
                            <Button variant="danger" onClick={confirmDelete}>Delete</Button>
                        </>
                    }
                >
                    <p>Are you sure you want to delete the payment mode <strong>{deletingMode.name}</strong>? This action cannot be undone.</p>
                </Modal>
            )}
        </Card>
    );
};

export default PaymentModeManager;
