export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export const validateEmail = (email: string): string | null => {
  if (!email) {
    return 'Email is required';
  }
  
  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  
  return null;
};

export const validateUsername = (username: string): string | null => {
  if (!username) {
    return 'Username is required';
  }
  
  if (username.length < 3) {
    return 'Username must be at least 3 characters';
  }
  
  if (username.length > 20) {
    return 'Username must be less than 20 characters';
  }
  
  // Allow only alphanumeric characters, underscores, and hyphens
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) {
    return 'Username can only contain letters, numbers, underscores, and hyphens';
  }
  
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Password is required';
  }
  
  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  
  return null;
};

export const validateLogin = (values: { username: string; password: string }): ValidationResult => {
  const errors: Record<string, string> = {};
  
  const usernameError = validateUsername(values.username);
  if (usernameError) errors.username = usernameError;
  
  const passwordError = validatePassword(values.password);
  if (passwordError) errors.password = passwordError;
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateRegister = (values: { username: string; email: string; password: string }): ValidationResult => {
  const errors: Record<string, string> = {};
  
  const usernameError = validateUsername(values.username);
  if (usernameError) errors.username = usernameError;
  
  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validatePassword(values.password);
  if (passwordError) errors.password = passwordError;
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};