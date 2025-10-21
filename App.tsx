import React, { useState, useEffect } from 'react';
import { Home, CreditCard, Users, PieChart, Settings, Menu, X, LogOut, Shield, LayoutGrid, WalletCards, HandCoins, Landmark } from 'lucide-react';

import Dashboard from './components/Dashboard';
import ExpenseManager from './components/ExpenseManager';
import CategoryManager from './components/CategoryManager';
import PeopleManager from './components/PeopleManager';
import PaymentModeManager from './components/PaymentModeManager';
import DebtManager from './components/DebtManager';
import ChitManager from './components/ChitManager';
import Reports from './components/Reports';
import SettingsPage from './components/SettingsPage';
import LoginPage from './components/LoginPage';
import LandingPage from './components/LandingPage';
import RegisterPage from './components/RegisterPage';
import AdminDashboard from './components/AdminDashboard';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { SessionContextProvider, useSession } from '@/src/contexts/SessionContext';
import { supabase } from '@/src/integrations/supabase/client';

type View = 'dashboard' | 'expenses' | 'categories' | 'people' | 'paymentModes' | 'debts' | 'chits' | 'reports' | 'settings' | 'admin';
type UnauthenticatedView = 'landing' | 'login' | 'register';

const AppContentInner: React.FC = () => {
  const { isLoadingData } = useAppContext();
  const { session, user } = useSession(); 
  const [view, setView] = useState<View>('dashboard');
  const [unauthenticatedView, setUnauthenticatedView] = useState<UnauthenticatedView>('landing');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('dashboard'); // Reset view after logout
    setUnauthenticatedView('login'); // Redirect to login after logout
  };

  const NavItem = ({ icon, label, currentView, targetView }: { icon: React.ReactNode, label: string, currentView: View, targetView: View }) => (
    <li
      onClick={() => {
        setView(targetView);
        setSidebarOpen(false);
      }}
      className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors ${
        currentView === targetView
          ? 'bg-primary-500 text-white'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </li>
  );

  const renderView = () => {
    if (isLoadingData) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <p className="text-lg text-gray-600 dark:text-gray-300">Loading user data...</p>
            </div>
        );
    }
    
    const isAdmin = user?.user_metadata?.role === 'admin';
    switch (view) {
      case 'dashboard':
        return <Dashboard setView={setView} />;
      case 'expenses':
        return <ExpenseManager />;
      case 'categories':
        return <CategoryManager />;
      case 'people':
        return <PeopleManager />;
      case 'paymentModes':
        return <PaymentModeManager />;
      case 'debts':
        return <DebtManager />;
      case 'chits':
        return <ChitManager />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <SettingsPage theme={theme} toggleTheme={toggleTheme} />;
      case 'admin':
        return isAdmin ? <AdminDashboard /> : <Dashboard setView={setView} />; 
      default:
        return <Dashboard setView={setView} />;
    }
  };

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">ExpenseMgr</h1>
        <div className="lg:hidden">
            <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                <X size={24} />
            </button>
        </div>
      </div>
      <nav className="p-4 flex flex-col justify-between h-[calc(100%-65px)]">
        <ul className="flex-grow overflow-y-scroll">
          <NavItem icon={<Home size={20} />} label="Dashboard" currentView={view} targetView="dashboard" />
          <NavItem icon={<CreditCard size={20} />} label="Expenses" currentView={view} targetView="expenses" />
          <NavItem icon={<PieChart size={20} />} label="Reports" currentView={view} targetView="reports" />
          <li className="px-3 pt-4 pb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Manage</li>
          <NavItem icon={<LayoutGrid size={20} />} label="Categories" currentView={view} targetView="categories" />
          <NavItem icon={<Users size={20} />} label="People" currentView={view} targetView="people" />
          <NavItem icon={<WalletCards size={20} />} label="Payment Modes" currentView={view} targetView="paymentModes" />
          <li className="px-3 pt-4 pb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Finance</li>
          <NavItem icon={<HandCoins size={20} />} label="Loans / Debts" currentView={view} targetView="debts" />
          <NavItem icon={<Landmark size={20} />} label="Chit Funds" currentView={view} targetView="chits" />
          <li className="px-3 pt-4 pb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">System</li>
          <NavItem icon={<Settings size={20} />} label="Settings" currentView={view} targetView="settings" />
          {user?.user_metadata?.role === 'admin' && ( // Check admin role from Supabase user metadata
            <NavItem icon={<Shield size={20} />} label="Admin" currentView={view} targetView="admin" />
          )}
        </ul>
        <div>
           <li
            onClick={handleLogout}
            className="flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <LogOut size={20} />
            <span className="ml-3">Logout</span>
          </li>
        </div>
      </nav>
    </>
  );
  
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-30 bg-black bg-opacity-50 transition-opacity lg:hidden ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-white dark:bg-gray-800 shadow-md">
        {sidebarContent}
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-md lg:justify-end">
          <button className="lg:hidden text-gray-600 dark:text-gray-300" onClick={() => setSidebarOpen(!isSidebarOpen)}>
            <Menu size={24} />
          </button>
          <div className="font-semibold text-lg capitalize">{view}</div>
        </header>
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

const AppContent: React.FC = () => {
    const { session, isLoading } = useSession();
    const [unauthenticatedView, setUnauthenticatedView] = useState<'landing' | 'login' | 'register'>('landing');

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <p className="text-lg text-gray-600 dark:text-gray-300">Loading application...</p>
            </div>
        );
    }

    if (!session) {
        switch (unauthenticatedView) {
            case 'landing':
                return <LandingPage onNavigateToLogin={() => setUnauthenticatedView('login')} onNavigateToRegister={() => setUnauthenticatedView('register')} />;
            case 'login':
                return <LoginPage onNavigateToLanding={() => setUnauthenticatedView('landing')} onNavigateToRegister={() => setUnauthenticatedView('register')} />;
            case 'register':
                return <RegisterPage onNavigateToLogin={() => setUnauthenticatedView('login')} />;
            default:
                return <LandingPage onNavigateToLogin={() => setUnauthenticatedView('login')} onNavigateToRegister={() => setUnauthenticatedView('register')} />;
        }
    }

    return (
        <AppProvider>
            <AppContentInner />
        </AppProvider>
    );
};

const App: React.FC = () => (
  <SessionContextProvider>
    <AppContent />
  </SessionContextProvider>
);

export default App;