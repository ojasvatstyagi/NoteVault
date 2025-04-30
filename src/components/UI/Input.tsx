import React, { useState, forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, required, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!props.value);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(!!e.target.value);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    const labelActive = isFocused || hasValue;

    return (
      <div className="relative mb-4">
        <div className="relative">
          <input
            type={type}
            className={cn(
              "peer w-full rounded-lg border px-4 pt-6 pb-2 text-sm outline-none transition-all",
              "placeholder:text-transparent focus:ring-2",
              labelActive ? "border-brand-orange" : "border-brand-dark/20 dark:border-brand-light/20",
              error
                ? "border-brand-red focus:border-brand-red focus:ring-brand-red/20"
                : "focus:border-brand-orange focus:ring-brand-orange/20",
              "bg-white dark:bg-brand-dark/90",
              "text-brand-dark dark:text-brand-light",
              className
            )}
            placeholder={label}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />
          <label
            className={cn(
              "absolute left-4 top-4 z-10 origin-[0] transform text-sm transition-all duration-200",
              labelActive
                ? "-translate-y-2 scale-75 text-brand-orange"
                : "text-brand-dark/60 dark:text-brand-light/60",
              error && labelActive && "text-brand-red"
            )}
          >
            {label}
            {required && <span className="text-brand-red ml-1">*</span>}
          </label>
        </div>
        {error && (
          <div className="mt-1 flex items-center text-xs text-brand-red">
            <AlertCircle size={12} className="mr-1" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;