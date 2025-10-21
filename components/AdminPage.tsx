import React from 'react';
import Card from './ui/Card';
import { User } from 'lucide-react';
import { useSession } from '../src/contexts/SessionContext';

interface AdminPageProps {
    // currentUser is now fetched from useSession, but we keep the prop for type compatibility if needed later
    currentUser: any; 
}

const AdminPage: React.FC<AdminPageProps> = () => {
    const { user } = useSession();

    return (
        <Card>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Admin Panel</h2>
            </div>
            
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Current User Information (Supabase Auth)</h3>
                <div className="space-y-2">
                    <p><strong>ID:</strong> {user?.id}</p>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Role:</strong> <span className="capitalize">{user?.user_metadata?.role || 'user'}</span></p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                        User management (adding/editing users) is handled directly by Supabase Authentication.
                    </p>
                </div>
            </div>
        </Card>
    );
};

export default AdminPage;