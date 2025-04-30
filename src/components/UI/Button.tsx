import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    loadingText,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
  }, ref) => {
    const variantClasses = {
      primary: 'bg-brand-orange text-white hover:bg-brand-red',
      secondary: 'bg-brand-lightBlue text-white hover:bg-brand-blue',
      outline: 'border border-brand-dark bg-transparent text-brand-dark hover:bg-brand-light dark:border-brand-light dark:text-brand-light dark:hover:bg-brand-dark/50',
      ghost: 'bg-transparent text-brand-dark hover:bg-brand-light dark:text-brand-light dark:hover:bg-brand-dark/50',
      link: 'bg-transparent text-brand-blue hover:underline dark:text-brand-lightBlue',
    };

    const sizeClasses = {
      sm: 'h-9 px-3 text-xs',
      md: 'h-10 px-4 text-sm',
      lg: 'h-11 px-6 text-base',
    };

    return (
      <button
        className={cn(
          'relative inline-flex items-center justify-center rounded-lg font-medium transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2 dark:focus:ring-offset-brand-dark',
          'disabled:cursor-not-allowed disabled:opacity-60',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className={cn('animate-spin mr-2', loadingText ? 'mr-2' : '')} size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
            {loadingText || children}
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;