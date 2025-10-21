import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/src/integrations/supabase/client';
import Card from './ui/Card';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { User as AuthUser } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { useSession } from '@/src/contexts/SessionContext';
import { PlusCircle, Trash2 } from 'lucide-react';

type AppUser = AuthUser & {
    user_metadata: {
        role?: string;
    };
    first_name?: string | null;
    last_name?: string | null;
}

const AdminDashboard: React.FC = () => {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddUserModalOpen, setAddUserModalOpen] = useState(false);
    const [deletingUser, setDeletingUser] = useState<AppUser | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const { session } = useSession();

    const fetchUsers = useCallback(async () => {
        if (!session) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('get-all-users');
            if (error) throw new Error(error.message);
            if (data && data.users) {
                setUsers(data.users as AppUser[]);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error(`Failed to fetch users: ${(error as Error).message}`);
        } finally {
            setIsLoading(false);
        }
    }, [session]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleAddUser = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsProcessing(true);
        const formData = new FormData(event.currentTarget);
        const payload = {
            email: formData.get('email') as string,
            password: formData.get('password') as string,
            first_name: formData.get('first_name') as string,
            last_name: formData.get('last_name') as string,
        };

        try {
            const { error } = await supabase.functions.invoke('manage-user', {
                body: { action: 'CREATE_USER', payload }
            });
            if (error) throw error;
            toast.success('User created successfully!');
            setAddUserModalOpen(false);
            fetchUsers();
        } catch (error) {
            toast.error(`Failed to create user: ${(error as Error).message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!deletingUser) return;
        setIsProcessing(true);
        try {
            const { error } = await supabase.functions.invoke('manage-user', {
                body: { action: 'DELETE_USER', payload: { userId: deletingUser.id } }
            });
            if (error) throw error;
            toast.success('User deleted successfully!');
            setDeletingUser(null);
            fetchUsers();
        } catch (error) {
            toast.error(`Failed to delete user: ${(error as Error).message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Admin Dashboard: User Management</h2>
                <Button onClick={() => setAddUserModalOpen(true)}>
                    <PlusCircle size={20} className="mr-2" />
                    Add User
                </Button>
            </div>
            
            {isLoading ? (
                <div className="text-center p-8">
                    <p>Loading users...</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="p-3 whitespace-nowrap">Name</th>
                                <th className="p-3 whitespace-nowrap">Email</th>
                                <th className="p-3 whitespace-nowrap">Role</th>
                                <th className="p-3 whitespace-nowrap">Signed Up</th>
                                <th className="p-3 whitespace-nowrap">Last Sign In</th>
                                <th className="p-3 whitespace-nowrap text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-b dark:border-gray-700">
                                    <td className="p-3 whitespace-nowrap font-medium">
                                        {user.first_name || user.last_name ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'N/A'}
                                    </td>
                                    <td className="p-3 whitespace-nowrap">{user.email}</td>
                                    <td className="p-3 whitespace-nowrap">
                                        <span className={`capitalize px-2 py-1 text-xs font-semibold rounded-full ${
                                            user.user_metadata?.role === 'admin' 
                                            ? 'bg-primary-100 text-primary-800' 
                                            : 'bg-gray-200 text-gray-800'
                                        }`}>
                                            {user.user_metadata?.role || 'user'}
                                        </span>
                                    </td>
                                    <td className="p-3 whitespace-nowrap">{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td className="p-3 whitespace-nowrap">{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}</td>
                                    <td className="p-3 whitespace-nowrap text-center">
                                        <button 
                                            onClick={() => setDeletingUser(user)} 
                                            className="text-red-600 hover:text-red-800"
                                            title="Delete User"
                                            disabled={user.id === session?.user.id}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={isAddUserModalOpen} onClose={() => setAddUserModalOpen(false)} title="Add New User">
                <form onSubmit={handleAddUser} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">First Name</label>
                        <input type="text" name="first_name" required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Last Name</label>
                        <input type="text" name="last_name" required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Email Address</label>
                        <input type="email" name="email" required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Password</label>
                        <input type="password" name="password" required minLength={6} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="secondary" onClick={() => setAddUserModalOpen(false)} disabled={isProcessing}>Cancel</Button>
                        <Button type="submit" disabled={isProcessing}>
                            {isProcessing ? 'Creating...' : 'Create User'}
                        </Button>
                    </div>
                </form>
            </Modal>
            
            {deletingUser && (
                <Modal 
                    isOpen={!!deletingUser} 
                    onClose={() => setDeletingUser(null)} 
                    title="Confirm Deletion"
                    footer={
                        <>
                            <Button variant="secondary" onClick={() => setDeletingUser(null)} disabled={isProcessing}>Cancel</Button>
                            <Button variant="danger" onClick={handleDeleteUser} disabled={isProcessing}>
                                {isProcessing ? 'Deleting...' : 'Delete'}
                            </Button>
                        </>
                    }
                >
                    <p>Are you sure you want to delete the user <strong>{deletingUser.email}</strong>? This action is irreversible.</p>
                </Modal>
            )}
        </Card>
    );
};

export default AdminDashboard;