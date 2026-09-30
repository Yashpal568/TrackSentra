import React, { useState } from 'react';
import { api } from '../lib/axios';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setStatus('error');
      setMessage('Password must be at least 8 characters long.');
      return;
    }

    setStatus('loading');
    try {
      const { data } = await api.post('/auth/reset-password', { email, token, newPassword: password });
      setStatus('success');
      setMessage(data.message || 'Password has been reset successfully.');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.error?.message || 'Invalid or expired reset token.');
    }
  };

  if (!token || !email) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="bg-red-50 text-red-800 p-6 rounded-md shadow-sm max-w-md w-full text-center">
          <p>Invalid password reset link. Missing token or email.</p>
          <Link to="/forgot-password" className="text-blue-600 hover:underline mt-4 block">Request a new link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md border border-gray-100">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Reset Password</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below.
          </p>
        </div>

        {status === 'success' ? (
          <div className="text-center">
            <div className="bg-green-50 text-green-800 p-4 rounded-md text-sm mb-4">
              {message}
            </div>
            <Link to="/login">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {status === 'error' && (
              <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm">
                {message}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" disabled={status === 'loading'} className="w-full">
              {status === 'loading' ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
