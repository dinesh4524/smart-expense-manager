import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import type { User } from '../types';
import Button from './ui/Button';
import Modal from './ui/Modal';
import Card from './ui/Card';
import { Edit, Trash, PlusCircle } from 'lucide-react';

const UserForm: React.FC<{ user?: User; onSave: (user: Omit<User, 'id'> | User) => void; onCancel: () => void; }> = ({ user, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        role: user?.role || 'user',
        password: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Don't submit an empty password for existing users unless it's being changed.
        const userData: any = { ...formData };
        if (user && !formData.password) {
            delete userData.password;
        }

        if (user) {
            onSave({ ...user, ...userData });
        } else {
            onSave(userData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
            </div>
            <div>
                <label className="block text-sm font-medium">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
            </div>
            <div>
                <label className="block text-sm font-medium">Password</label>
                <input type="password" name="password" value={formData.password} placeholder={user ? 'Leave blank to keep unchanged' : ''} required={!user} minLength={6} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
            </div>
            <div>
                <label className="block text-sm font-medium">Role</label>
                <select name="role" value={formData.role} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
            </div>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save User</Button>
            </div>
        </form>
    );
};

interface AdminPageProps {
    currentUser: User;
}

const AdminPage: React.FC<AdminPageProps> = ({ currentUser }) => {
    const { users, addUser, updateUser, deleteUser } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);

    const openAddModal = () => {
        setEditingUser(undefined);
        setModalOpen(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setModalOpen(true);
    };

    const handleSave = (userData: Omit<User, 'id'> | User) => {
        if ('id' in userData) {
            updateUser(userData);
        } else {
            addUser(userData as Omit<User, 'id'>);
        }
        setModalOpen(false);
    };
    
    const handleDelete = (user: User) => {
        if (user.id === currentUser.id) {
            alert("You cannot delete your own account.");
            return;
        }
        setDeletingUser(user);
    }
    
    const confirmDelete = () => {
        if (deletingUser) {
            deleteUser(deletingUser.id);
            setDeletingUser(null);
        }
    }

    return (
        <Card>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">User Management</h2>
                <Button onClick={openAddModal}>
                    <PlusCircle size={20} className="mr-2" />
                    Add User
                </Button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Role</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="border-b dark:border-gray-700">
                                <td className="p-3 font-medium">{user.name}</td>
                                <td className="p-3 text-gray-600 dark:text-gray-400">{user.email}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        user.role === 'admin' 
                                        ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200' 
                                        : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                                    }`}>
                                    {user.role}
                                    </span>
                                </td>
                                <td className="p-3 text-center">
                                    <button onClick={() => openEditModal(user)} className="text-primary-600 hover:text-primary-800 mr-4"><Edit size={18} /></button>
                                    <button onClick={() => handleDelete(user)} className="text-red-600 hover:text-red-800"><Trash size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

             <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editingUser ? 'Edit User' : 'Add New User'}>
                <UserForm
                    user={editingUser}
                    onSave={handleSave}
                    onCancel={() => setModalOpen(false)}
                />
            </Modal>

            {deletingUser && (
                <Modal 
                    isOpen={!!deletingUser} 
                    onClose={() => setDeletingUser(null)} 
                    title="Confirm Deletion"
                    footer={
                        <>
                            <Button variant="secondary" onClick={() => setDeletingUser(null)}>Cancel</Button>
                            <Button variant="danger" onClick={confirmDelete}>Delete</Button>
                        </>
                    }
                >
                    <p>Are you sure you want to delete the user <strong>{deletingUser.name}</strong>? This action cannot be undone.</p>
                </Modal>
            )}
        </Card>
    );
};

export default AdminPage;