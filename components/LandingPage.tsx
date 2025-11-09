import React from 'react';
import Button from './ui/Button';
import Footer from './Footer';
import { TrendingUp, PieChart, Users, ShieldCheck, LogIn, Zap, DollarSign, HandCoins, LayoutGrid } from 'lucide-react';

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
}

const FeatureCard = ({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl text-center flex flex-col items-center transform transition duration-300 hover:scale-[1.02] hover:shadow-2xl border border-gray-100 dark:border-gray-700">
    <div className={`flex-shrink-0 inline-block p-4 ${color} text-white rounded-full mb-4 shadow-lg`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400">{description}</p>
  </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToLogin, onNavigateToRegister }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-400">ExpenseMgr</h1>
        <div className="flex items-center gap-2">
            <Button onClick={onNavigateToLogin} size="sm" variant="secondary">
                <LogIn size={16} className="mr-1" />
                Sign In
            </Button>
            <Button onClick={onNavigateToRegister} size="sm">
                Sign Up
            </Button>
        </div>
      </header>

      {/* Hero Section - Vibrant and Dynamic */}
      <section className="py-24 px-4 bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 border-b dark:border-gray-700 relative overflow-hidden">
        {/* Subtle background animation effect (simulated 3D/dynamic feel) */}
        <div className="absolute inset-0 opacity-10 dark:opacity-5">
            <div className="w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob absolute top-0 left-0"></div>
            <div className="w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000 absolute bottom-0 right-0"></div>
        </div>
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="text-center lg:text-left">
            <h2 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight text-gray-900 dark:text-gray-50">
              Take <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-500">Control</span> of Your Finances.
            </h2>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-10">
              ExpenseMgr provides secure, insightful, and easy-to-use tools for managing every aspect of your household spending.
            </p>
            <Button onClick={onNavigateToRegister} size="lg" className="shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition duration-200">
              <Zap size={24} className="mr-2" />
              Start Tracking for Free
            </Button>
          </div>
          <div className="hidden lg:block">
            {/* Placeholder Image for Hero - Updated to look more like a modern app screenshot */}
            <div className="bg-white dark:bg-gray-700 p-4 rounded-2xl shadow-2xl border-4 border-primary-500/50 transform rotate-3 hover:rotate-0 transition duration-500">
                <img 
                    src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1911&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                    alt="Expense Manager Dashboard Preview" 
                    className="rounded-xl w-full h-auto object-cover"
                />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - More Colorful Cards */}
      <section className="py-20 bg-gray-100 dark:bg-gray-900 px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-bold text-center mb-12 text-gray-800 dark:text-gray-200">Powerful Features, Simple Interface</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<TrendingUp size={32} />} 
              title="Real-time Tracking" 
              description="Log, categorize, and analyze all your expenses instantly across multiple devices."
              color="bg-green-500"
            />
            <FeatureCard 
              icon={<PieChart size={32} />} 
              title="Visual Reports" 
              description="Interactive charts show you exactly where your money is going, helping you budget better."
              color="bg-yellow-500"
            />
            <FeatureCard 
              icon={<Users size={32} />} 
              title="Household Sharing" 
              description="Track spending by family member, making shared finances transparent and easy to manage."
              color="bg-blue-500"
            />
            <FeatureCard 
              icon={<ShieldCheck size={32} />} 
              title="Secure & Private" 
              description="Built on Supabase with mandatory Row Level Security to keep your data safe."
              color="bg-red-500"
            />
            {/* Adding more colorful feature cards for variety */}
            <FeatureCard 
              icon={<DollarSign size={32} />} 
              title="Income Management" 
              description="Track all sources of income to get a complete picture of your cash flow."
              color="bg-purple-600"
            />
            <FeatureCard 
              icon={<HandCoins size={32} />} 
              title="Debt & Loans" 
              description="Keep a clear record of money borrowed and loaned, including due dates."
              color="bg-pink-500"
            />
            <FeatureCard 
              icon={<LayoutGrid size={32} />} 
              title="Custom Categories" 
              description="Define and manage custom categories and payment modes to fit your lifestyle."
              color="bg-indigo-600"
            />
            <FeatureCard 
              icon={<Zap size={32} />} 
              title="Fast Performance" 
              description="Built with modern tools like React and Vite for a lightning-fast user experience."
              color="bg-orange-500"
            />
          </div>
        </div>
      </section>
      
      {/* CTA Section - High Contrast */}
      <section className="py-16 px-4 bg-primary-600 dark:bg-primary-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to Master Your Money?</h3>
            <p className="text-xl mb-8 opacity-90">Join thousands of smart households taking control of their financial future today.</p>
            <Button onClick={onNavigateToRegister} size="lg" variant="secondary" className="bg-white text-primary-600 hover:bg-gray-100 shadow-xl">
                Sign Up in 30 Seconds
            </Button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;