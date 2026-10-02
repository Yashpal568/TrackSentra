import { useEffect, useState } from 'react';
import { api } from '../lib/axios';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token || !email) {
      setStatus('error');
      setMessage('Invalid verification link. Missing token or email.');
      return;
    }

    const verify = async () => {
      try {
        await api.post('/auth/verify-email', { email, token });
        setStatus('success');
        setMessage('Your email has been successfully verified! You can now log in.');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.error?.message || 'Invalid or expired verification token.');
      }
    };

    verify();
  }, [token, email]);

  const handleResend = async () => {
    if (!email) return;
    setStatus('verifying');
    try {
      await api.post('/auth/resend-verification', { email });
      setStatus('error');
      setMessage('If the account exists and is unverified, a new verification link has been sent to your email.');
    } catch (e) {
      setStatus('error');
      setMessage('Failed to request new verification link. Please try again later.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-surface-card p-8 rounded-lg shadow-md border border-gray-100 text-center">
        <h2 className="text-3xl font-extrabold text-text-main mb-6">Email Verification</h2>
        
        {status === 'verifying' && (
          <div className="text-gray-600">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Verifying your email address...</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="bg-emerald-primary/10 text-emerald-primary p-4 rounded-md mb-6">
              {message}
            </div>
            <Link to="/login">
              <Button className="w-full">Proceed to Login</Button>
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
              {message}
            </div>
            <div className="space-y-4">
              {email && (
                <Button variant="secondary" onClick={handleResend} className="w-full">
                  Resend Verification Email
                </Button>
              )}
              <Link to="/login" className="block">
                <Button className="w-full">Back to Login</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
