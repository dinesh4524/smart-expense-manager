import React, { useState } from 'react';
import Button from './ui/Button';
import Card from './ui/Card';
import { Home, ArrowLeft } from 'lucide-react';
import Footer from './Footer';

interface LoginPageProps {
  onLogin: (email: string, password: string) => boolean;
  onNavigateToLanding: () => void;
  onNavigateToRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigateToLanding, onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = onLogin(email, password);
    if (!success) {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-sm px-4">
        <button
          onClick={onNavigateToLanding}
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 mb-4"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Home
        </button>
        <Card className="w-full">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-primary-500 text-white p-3 rounded-full mb-4">
              <Home size={32} />
            </div>
            <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200">Sign in to ExpenseMgr</h1>
            <p className="text-gray-500 dark:text-gray-400">Welcome back!</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="user@example.com"
                className="mt-1 block w-full px-3 py-2 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div>
              <label htmlFor="password"  className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="mt-1 block w-full px-3 py-2 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
           <div className="mt-6 text-center text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <button
                onClick={onNavigateToRegister}
                className="font-medium text-primary-600 hover:underline focus:outline-none"
              >
                Sign up
              </button>
            </p>
          </div>
        </Card>
      </div>
      <div className="w-full mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default LoginPage;
