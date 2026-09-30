import { useState } from 'react';
import { api } from '../lib/axios';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const ActivateGuard = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (!token || !email) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md border border-gray-100 text-center">
          <div className="bg-red-50 text-red-800 p-4 rounded-md">Invalid activation link. Missing token or email.</div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }
    
    setStatus('submitting');
    try {
      await api.post('/auth/activate-guard', { email, token, password });
      setStatus('success');
      setMessage('Account activated successfully! You can now log in.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.error?.message || 'Invalid or expired activation token.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md border border-gray-100">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">Activate Account</h2>
        
        {status === 'success' ? (
          <div className="text-center">
            <div className="bg-green-50 text-green-800 p-4 rounded-md mb-6">{message}</div>
            <Link to="/login"><Button className="w-full">Proceed to Login</Button></Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {status === 'error' && (
              <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm">{message}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" disabled value={email} className="mt-1 block w-full rounded border px-3 py-2 bg-gray-50 text-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Set Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} minLength={8} className="mt-1 block w-full rounded border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} minLength={8} className="mt-1 block w-full rounded border px-3 py-2" />
            </div>
            <Button type="submit" disabled={status === 'submitting'} className="w-full mt-4">
              {status === 'submitting' ? 'Activating...' : 'Activate Account'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
