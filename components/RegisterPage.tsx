import React, { useState } from 'react';
import Button from './ui/Button';
import Card from './ui/Card';
import { UserPlus } from 'lucide-react';
import Footer from './Footer';

interface RegisterPageProps {
  onRegister: (name: string, email: string, password: string) => boolean;
  onRegisterSuccess: () => void;
  onNavigateToLogin: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, onRegisterSuccess, onNavigateToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    const success = onRegister(name, email, password);
    if (success) {
      alert("Registration successful! Please log in.");
      onRegisterSuccess();
    } else {
      setError('An account with this email already exists.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-sm px-4">
        <Card className="w-full">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-primary-500 text-white p-3 rounded-full mb-4">
              <UserPlus size={32} />
            </div>
            <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200">Create Your Account</h1>
            <p className="text-gray-500 dark:text-gray-400">Get started with ExpenseMgr</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                placeholder="John Doe"
                className="mt-1 block w-full px-3 py-2 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
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
                minLength={6}
                autoComplete="new-password"
                placeholder="••••••••"
                className="mt-1 block w-full px-3 py-2 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
             <div>
              <label htmlFor="confirm-password"  className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="••••••••"
                className="mt-1 block w-full px-3 py-2 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <Button type="submit" className="w-full">
              Create Account
            </Button>
          </form>
           <div className="mt-6 text-center text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <button
                onClick={onNavigateToLogin}
                className="font-medium text-primary-600 hover:underline focus:outline-none"
              >
                Sign in
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

export default RegisterPage;
