import React, { useState } from 'react';
import Button from './ui/Button';
import Card from './ui/Card';
import Footer from './Footer';
import { supabase } from '@/src/integrations/supabase/client';
import Input from './ui/Input';
import toast from 'react-hot-toast';

interface RegisterPageProps {
  onNavigateToLogin: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigateToLogin }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Registration successful! Please check your email to verify your account.');
      // Optionally navigate to login or show a success message
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-sm px-4">
        <Card className="w-full">
          <div className="flex flex-col items-center mb-6">
            <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200">Create Your Account</h1>
            <p className="text-gray-500 dark:text-gray-400">Get started with ExpenseMgr</p>
          </div>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input id="first-name" label="First Name" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                <Input id="last-name" label="Last Name" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
            <Input id="email" label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
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