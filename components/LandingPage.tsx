import React from 'react';
import Button from './ui/Button';
import Footer from './Footer';
import { TrendingUp, PieChart, Users, ShieldCheck, LogIn } from 'lucide-react';

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
}

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center flex flex-col items-center">
    <div className="flex-shrink-0 inline-block p-4 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 rounded-full mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400">{description}</p>
  </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToLogin, onNavigateToRegister }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">ExpenseMgr</h1>
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

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 px-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-800 dark:text-gray-100">
                Manage Your Home Expenses, The Smart Way.
              </h2>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8">
                ExpenseMgr helps you track spending, visualize reports, and take control of your family's finances with ease.
              </p>
              <Button onClick={onNavigateToRegister} size="lg">
                Get Started Now
              </Button>
            </div>
            <div className="hidden lg:block">
              {/* Placeholder Image for Hero */}
              <img 
                src="https://images.unsplash.com/photo-1553729459-efe14ef6aa4e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="Expense Manager Dashboard Preview" 
                className="rounded-xl shadow-2xl w-full h-auto object-cover"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-100 dark:bg-gray-900 px-4">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-200">Why Choose ExpenseMgr?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard 
                icon={<TrendingUp size={32} />} 
                title="Track Everything" 
                description="Easily add, edit, and manage all your expenses in one place. Never lose track of a single penny."
              />
              <FeatureCard 
                icon={<PieChart size={32} />} 
                title="Visualize Insights" 
                description="Interactive charts and reports help you understand where your money is going."
              />
              <FeatureCard 
                icon={<Users size={32} />} 
                title="Family Focused" 
                description="Manage expenses by person to see who is spending what, perfect for families and shared households."
              />
              <FeatureCard 
                icon={<ShieldCheck size={32} />} 
                title="Secure & Private" 
                description="Your financial data is yours alone. We prioritize your privacy and data security."
              />
            </div>
          </div>
        </section>
        
        {/* Call to Action Section */}
        <section className="py-16 bg-primary-600 dark:bg-primary-700 text-white text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to take control of your finances?</h3>
            <p className="text-lg mb-8 opacity-90">Join thousands of smart homeowners managing their budget effortlessly.</p>
            <Button onClick={onNavigateToRegister} size="lg" variant="secondary" className="bg-white text-primary-600 hover:bg-gray-100">
                Start Your Free Trial
            </Button>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;