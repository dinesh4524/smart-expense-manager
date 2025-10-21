import React from 'react';
import Button from './ui/Button';
import Card from './ui/Card';
import { ArrowLeft } from 'lucide-react';
import Footer from './Footer';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/src/integrations/supabase/client';

interface LoginPageProps {
  onNavigateToLanding: () => void;
  onNavigateToRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigateToLanding, onNavigateToRegister }) => {
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
            <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200">Sign in to ExpenseMgr</h1>
            <p className="text-gray-500 dark:text-gray-400">Welcome back!</p>
          </div>
          <Auth
            supabaseClient={supabase}
            providers={[]} // No third-party providers unless specified
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(210 70% 40%)', // primary-600
                    brandAccent: 'hsl(210 70% 30%)', // primary-700
                  },
                },
              },
            }}
            theme="light" // Use light theme
            view="sign_in"
            redirectTo={window.location.origin} // Redirect to the app's origin after login
          />
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