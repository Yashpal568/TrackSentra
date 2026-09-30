import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const Dashboard = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <Button variant="secondary" onClick={() => logout()}>
            Sign out
          </Button>
        </div>

        <Card>
          <h2 className="text-xl font-semibold mb-4">Welcome, {user?.firstName}!</h2>
          <div className="space-y-2 text-gray-600">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> {user?.role}</p>
          </div>
        </Card>
      </div>
    </div>
  );
};
