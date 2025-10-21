import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import type { PaymentMode } from '../types';
import Button from './ui/Button';
import Modal from './ui/Modal';
import { Edit, Trash, PlusCircle, WalletCards } from 'lucide-react';
import Card from './ui/Card';

const PaymentModeForm: React.FC<{ mode?: PaymentMode; onSave: (mode: Omit<PaymentMode, 'id'> | PaymentMode) => Promise<void>; onCancel: () => void; }> = ({ mode, onSave, onCancel }) => {
    const [name, setName] = useState(mode?.name || '');
    const [icon, setIcon] = useState(mode?.icon || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const modeData = { name, icon };
        try {
            if (mode) {
                await onSave({ ...mode, ...modeData });
            } else {
                await onSave(modeData);
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
                <label className="block text-sm font-medium">Payment Mode Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
            </div>
            <div>
                <label className="block text-sm font-medium">Icon (Optional Emoji)</label>
                <input type="text" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="e.g., 💳" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
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


const PaymentModeManager: React.FC = () => {
    const { paymentModes, addPaymentMode, updatePaymentMode, deletePaymentMode } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingMode, setEditingMode] = useState<PaymentMode | undefined>(undefined);
    const [deletingMode, setDeletingMode] = useState<PaymentMode | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const openAddModal = () => {
        setEditingMode(undefined);
        setModalOpen(true);
    };

    const openEditModal = (mode: PaymentMode) => {
        setEditingMode(mode);
        setModalOpen(true);
    };

    const handleSave = async (modeData: Omit<PaymentMode, 'id'> | PaymentMode) => {
        if ('id' in modeData) {
            await updatePaymentMode(modeData);
        } else {
            await addPaymentMode(modeData);
        }
    };
    
    const confirmDelete = async () => {
        if (deletingMode) {
            setIsDeleting(true);
            try {
                await deletePaymentMode(deletingMode.id);
                setDeletingMode(null);
            } catch (error) {
                console.error("Delete failed:", error);
            } finally {
                setIsDeleting(false);
            }
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
                               {mode.icon ? (
                                    <span className="text-2xl mr-4">{mode.icon}</span>
                                ) : (
                                    <span className="text-2xl mr-4 text-gray-400"><WalletCards /></span>
                                )}
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
                            <Button variant="secondary" onClick={() => setDeletingMode(null)} disabled={isDeleting}>Cancel</Button>
                            <Button variant="danger" onClick={confirmDelete} disabled={isDeleting}>
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </Button>
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