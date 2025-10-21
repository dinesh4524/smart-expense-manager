import React, { useEffect, useState } from 'react';
import { supabase } from '@/src/integrations/supabase/client';
import Card from './ui/Card';
import { User as AuthUser } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { useSession } from '@/src/contexts/SessionContext';

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
    const { session } = useSession();

    useEffect(() => {
        const fetchUsers = async () => {
            if (!session) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const { data, error } = await supabase.functions.invoke('get-all-users');
                
                if (error) {
                    // Don't show a toast for auth-related errors that can happen during logout
                    if (!error.message.toLowerCase().includes('function returned a non-2xx status code')) {
                        throw new Error(error.message);
                    }
                }

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
        };

        fetchUsers();
    }, [session]);

    return (
        <Card>
            <h2 className="text-2xl font-bold mb-6">Admin Dashboard: User Management</h2>
            
            {isLoading ? (
                <div className="text-center p-8">
                    <p>Loading users...</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="p-3">Name</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Role</th>
                                <th className="p-3">Signed Up</th>
                                <th className="p-3">Last Sign In</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-b dark:border-gray-700">
                                    <td className="p-3 font-medium">
                                        {user.first_name || user.last_name ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'N/A'}
                                    </td>
                                    <td className="p-3">{user.email}</td>
                                    <td className="p-3">
                                        <span className={`capitalize px-2 py-1 text-xs font-semibold rounded-full ${
                                            user.user_metadata?.role === 'admin' 
                                            ? 'bg-primary-100 text-primary-800' 
                                            : 'bg-gray-200 text-gray-800'
                                        }`}>
                                            {user.user_metadata?.role || 'user'}
                                        </span>
                                    </td>
                                    <td className="p-3">{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td className="p-3">{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
};

export default AdminDashboard;