import React, { ReactNode } from 'react';
import ThemeToggle from './ThemeToggle';
import { Shield } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  const { theme } = useTheme();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className={`w-full max-w-md space-y-8 rounded-xl p-8 shadow-lg transition-all duration-300 ${
        theme === 'dark' ? 'bg-brand-dark/80 shadow-black/30' : 'bg-white shadow-brand-dark/10'
      }`}>
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-brand-yellow/20 p-2 dark:bg-brand-yellow/10">
            <Shield className="h-8 w-8 text-brand-orange dark:text-brand-yellow" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-brand-dark dark:text-brand-light">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-sm text-brand-dark/60 dark:text-brand-light/60">
              {subtitle}
            </p>
          )}
        </div>
        
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;