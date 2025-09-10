'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuthContext } from '@/contexts/AuthContext';
import { useAlert } from '@/contexts/AlertContext';
import { ROUTES } from '@/lib/constants';
import { ApiService } from '@/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';
// Removed tokenStorage - using API service instead

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();
  const { showSuccess, showError } = useAlert();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone_number: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(ROUTES.pages.dashboard);
    }
  }, [isAuthenticated, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phone_number) {
      newErrors.phone_number = 'Phone number is required';
    } else if (formData.phone_number.length < 10) {
      newErrors.phone_number = 'Phone number must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const { confirmPassword, ...registrationData } = formData;
      const response = await ApiService.register(registrationData);
      
      // Registration successful - tokens are automatically stored by API service
      if (response.ok && response.user) {
        showSuccess('Registration successful! Welcome!', 'Success');
        router.push(ROUTES.pages.dashboard);
      } else {
        showSuccess('Registration successful! Please log in.', 'Success');
        router.push(ROUTES.pages.home);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
      showError(errorMessage, 'Registration Error');
      
      // Handle specific validation errors from server
      if (error.response?.data?.details) {
        const serverErrors: Record<string, string> = {};
        error.response.data.details.forEach((detail: any) => {
          if (detail.path && detail.message) {
            serverErrors[detail.path[0]] = detail.message;
          }
        });
        setErrors(serverErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>
        
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-semibold text-center text-gray-900 dark:text-white">Create Account</h1>
            <p className="text-sm text-gray-700 dark:text-white/70 text-center">Join the alert system</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-gray-700 dark:text-white/70">Email Address</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  placeholder="Enter your email"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-xs text-red-400 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-700 dark:text-white/70">Username (Optional)</label>
                <Input
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange('username')}
                  placeholder="Choose a username"
                />
              </div>

              <div>
                <label className="text-xs text-gray-700 dark:text-white/70">Password</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  placeholder="Create a password"
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && (
                  <p className="text-xs text-red-400 mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-700 dark:text-white/70">Confirm Password</label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  placeholder="Confirm your password"
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-400 mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-700 dark:text-white/70">Phone Number</label>
                <Input
                  type="tel"
                  value={formData.phone_number}
                  onChange={handleInputChange('phone_number')}
                  placeholder="Enter your phone number"
                  className={errors.phone_number ? 'border-red-500' : ''}
                />
                {errors.phone_number && (
                  <p className="text-xs text-red-400 mt-1">{errors.phone_number}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-800 dark:text-white/70">
                Already have an account?{' '}
                <button
                  onClick={() => router.push(ROUTES.pages.home)}
                  className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 underline"
                >
                  Sign in
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
