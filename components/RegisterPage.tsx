import React from 'react';
import Button from './ui/Button';
import Card from './ui/Card';
import { UserPlus } from 'lucide-react';
import Footer from './Footer';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../src/integrations/supabase/client'; // Corrected path

interface RegisterPageProps {
  onNavigateToLogin: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigateToLogin }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-sm px-4">
        <Card className="w-full">
          <div className="flex flex-col items-center mb-6">
            <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200">Create Your Account</h1>
            <p className="text-gray-500 dark:text-gray-400">Get started with ExpenseMgr</p>
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
            view="sign_up"
            redirectTo={window.location.origin} // Redirect to the app's origin after signup
          />
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