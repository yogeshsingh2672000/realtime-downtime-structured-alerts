'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuthContext } from '@/contexts/AuthContext';
import { useAlert } from '@/contexts/AlertContext';
import { ROUTES } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';
import { tokenStorage } from '@/lib/tokenStorage';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, error, login, clearError } = useAuthContext();
  const { showSuccess, showError } = useAlert();
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoginLoading(true);
    setErrors({});

    try {
      const result = await login(formData);
      
      if (result.success) {
        showSuccess('Login successful!', 'Welcome');
        router.replace(ROUTES.pages.dashboard);
      } else {
        showError(result.error || 'Login failed', 'Login Error');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      showError(errorMessage, 'Login Error');
    } finally {
      setIsLoginLoading(false);
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
            <h1 className="text-2xl font-semibold text-center text-gray-900 dark:text-white">Welcome Back</h1>
            <p className="text-sm text-gray-700 dark:text-white/70 text-center">Sign in to your account</p>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <p className="text-sm text-gray-700 dark:text-white/70 text-center">Checking session…</p>
            )}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
                <button 
                  onClick={clearError}
                  className="mt-2 text-xs text-red-400 hover:text-red-300 underline"
                >
                  Dismiss
                </button>
              </div>
            )}
            {!isLoading && !isAuthenticated && (
              <form onSubmit={handleLogin} className="space-y-4">
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
                  <label className="text-xs text-gray-700 dark:text-white/70">Password</label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    placeholder="Enter your password"
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  {errors.password && (
                    <p className="text-xs text-red-400 mt-1">{errors.password}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoginLoading}
                  className="w-full"
                >
                  {isLoginLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-800 dark:text-white/70">
                Don't have an account?{' '}
                <button
                  onClick={() => router.push(ROUTES.pages.register)}
                  className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 underline"
                >
                  Create one
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
