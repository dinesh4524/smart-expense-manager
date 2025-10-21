import React, { useEffect, useState } from 'react';
import { supabase } from '@/src/integrations/supabase/client';
import toast from 'react-hot-toast';
import Dashboard from './Dashboard';
import Card from './ui/Card';
import Button from './ui/Button';
import { ArrowLeft } from 'lucide-react';
import type { Expense, Category, HouseholdMember, Debt, Settings, ChitFund, PaymentMode } from '../types';

interface UserDashboardViewerProps {
  userId: string;
  userName: string;
  onBack: () => void;
}

type DashboardData = {
  expenses: Expense[];
  categories: Category[];
  people: HouseholdMember[];
  paymentModes: PaymentMode[];
  debts: Debt[];
  chitFunds: ChitFund[];
  settings: Settings;
}

const UserDashboardViewer: React.FC<UserDashboardViewerProps> = ({ userId, userName, onBack }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('get-user-dashboard-data', {
          body: { userId }
        });
        if (error) throw error;
        
        // Settings are stored locally per user, so we use a default for viewing.
        const defaultSettings = { currency: '₹', theme: 'light' };
        setDashboardData({ ...data, settings: defaultSettings });

      } catch (err) {
        toast.error(`Failed to load user data: ${(err as Error).message}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Viewing Dashboard for: {userName}</h2>
        <Button onClick={onBack} variant="secondary">
          <ArrowLeft size={18} className="mr-2" />
          Back to Admin
        </Button>
      </div>
      {isLoading && <p className="text-center p-8">Loading dashboard...</p>}
      {!isLoading && !dashboardData && <p className="text-center p-8 text-red-500">Could not load data for this user.</p>}
      {!isLoading && dashboardData && (
        <div className="border-t dark:border-gray-700 pt-4 mt-4">
          <Dashboard dashboardData={dashboardData} />
        </div>
      )}
    </Card>
  );
};

export default UserDashboardViewer;