import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/ui/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { validateRegister } from '../utils/validation';
import { register, RegisterCredentials } from '../services/auth';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    username: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    if (formError) setFormError(null);
    if (formSuccess) setFormSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateRegister(credentials);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    
    setFormError(null);
    setFormSuccess(null);
    setIsLoading(true);
    
    try {
      const response = await register(credentials);
      
      if (response.success) {
        setFormSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setFormError(response.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setFormError('An unexpected error occurred. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Create your account" 
      subtitle="Join us today to get started"
    >
      {formError && (
        <div className="mb-4 flex items-center rounded-lg bg-brand-red/10 p-4 text-sm text-brand-red dark:bg-brand-red/5">
          <AlertCircle className="mr-2 h-4 w-4" />
          {formError}
        </div>
      )}
      
      {formSuccess && (
        <div className="mb-4 flex items-center rounded-lg bg-brand-yellow/10 p-4 text-sm text-brand-orange dark:bg-brand-yellow/5 dark:text-brand-yellow">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          {formSuccess}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Input
          label="Username"
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          value={credentials.username}
          onChange={handleChange}
          error={errors.username}
        />
        
        <Input
          label="Email address"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={credentials.email}
          onChange={handleChange}
          error={errors.email}
        />
        
        <Input
          label="Password"
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={credentials.password}
          onChange={handleChange}
          error={errors.password}
        />
        
        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            className="h-4 w-4 rounded border-brand-dark/20 text-brand-orange focus:ring-brand-orange dark:border-brand-light/20 dark:bg-brand-dark/90"
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-brand-dark dark:text-brand-light">
            I agree to the{' '}
            <a href="#" className="font-medium text-brand-orange hover:text-brand-red dark:text-brand-yellow dark:hover:text-brand-orange">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="font-medium text-brand-orange hover:text-brand-red dark:text-brand-yellow dark:hover:text-brand-orange">
              Privacy Policy
            </a>
          </label>
        </div>
        
        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
          loadingText="Creating account..."
        >
          Create account
        </Button>
        
        <div className="mt-4 text-center text-sm text-brand-dark/60 dark:text-brand-light/60">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-orange hover:text-brand-red dark:text-brand-yellow dark:hover:text-brand-orange">
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;