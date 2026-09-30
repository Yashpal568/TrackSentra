import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const Guards = () => {
  const { user } = useAuthStore();
  const [guards, setGuards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ 
    firstName: '', lastName: '', email: '', employeeId: '', phone: '' 
  });

  useEffect(() => {
    fetchGuards();
  }, []);

  const fetchGuards = async () => {
    try {
      const res = await api.get('/guards');
      setGuards(res.data.guards);
    } catch (err) {
      setError('Failed to load guards.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/guards', formData);
      setGuards([res.data.guard, ...guards]);
      setIsCreating(false);
      setFormData({ firstName: '', lastName: '', email: '', employeeId: '', phone: '' });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create guard.');
    }
  };

  const canManage = ['SUPER_ADMIN', 'COMPANY_ADMIN', 'SITE_MANAGER'].includes(user?.role || '');

  if (loading) return <div className="p-8">Loading guards...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Guards</h1>
        {canManage && !isCreating && (
          <Button onClick={() => setIsCreating(true)}>Onboard Guard</Button>
        )}
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded">{error}</div>}

      {isCreating && (
        <Card className="mb-6">
          <h2 className="text-lg font-medium mb-4">Onboard New Guard</h2>
          <form onSubmit={handleCreate} className="space-y-4 grid grid-cols-2 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium">First Name</label>
              <input type="text" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2" />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium">Last Name</label>
              <input type="text" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2" />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium">Email</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2" />
              <p className="text-xs text-gray-500 mt-1">An activation link will be sent to this email.</p>
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium">Employee ID</label>
              <input type="text" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2" />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium">Phone Number</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2" />
            </div>
            <div className="col-span-2 flex gap-2 mt-4">
              <Button type="submit">Onboard Guard</Button>
              <Button variant="secondary" onClick={() => setIsCreating(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {guards.length === 0 && !isCreating ? (
        <Card className="text-center text-gray-500 py-12">No guards onboarded yet.</Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {guards.map(guard => (
            <Card key={guard._id} className="flex flex-col">
              <div className="flex-1">
                <h3 className="font-bold text-lg">{guard.userId?.firstName} {guard.userId?.lastName}</h3>
                <p className="text-sm text-gray-500 mt-1">{guard.userId?.email}</p>
                {guard.employeeId && <p className="text-sm text-gray-500">ID: {guard.employeeId}</p>}
                <div className="mt-4 flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs uppercase font-semibold rounded-full ${guard.status === 'active' ? 'bg-green-100 text-green-800' : guard.status === 'invited' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                    {guard.status}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
