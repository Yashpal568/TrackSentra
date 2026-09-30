import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const Sites = () => {
  const { user } = useAuthStore();
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', address: '', timezone: 'UTC' });

  const fetchSites = async () => {
    try {
      const res = await api.get('/sites');
      setSites(res.data.sites);
    } catch (err) {
      setError('Failed to load sites.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/sites', formData);
      setSites([res.data.site, ...sites]);
      setIsCreating(false);
      setFormData({ name: '', address: '', timezone: 'UTC' });
    } catch (err) {
      setError('Failed to create site.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this site?')) return;
    try {
      await api.delete(`/sites/${id}`);
      setSites(sites.filter(s => s._id !== id));
    } catch (err) {
      setError('Failed to delete site.');
    }
  };

  const canManage = ['SUPER_ADMIN', 'COMPANY_ADMIN', 'SITE_MANAGER'].includes(user?.role || '');

  if (loading) return <div className="p-8">Loading sites...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Sites</h1>
        {canManage && !isCreating && (
          <Button onClick={() => setIsCreating(true)}>Add New Site</Button>
        )}
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded">{error}</div>}

      {isCreating && (
        <Card className="mb-6">
          <h2 className="text-lg font-medium mb-4">Create New Site</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Site Name</label>
              <input 
                type="text" required value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input 
                type="text" value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Create Site</Button>
              <Button variant="secondary" onClick={() => setIsCreating(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {sites.length === 0 && !isCreating ? (
        <Card className="text-center text-gray-500 py-12">
          No sites have been created yet.
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sites.map(site => (
            <Card key={site._id} className="flex flex-col">
              <div className="flex-1">
                <h3 className="font-bold text-lg">{site.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{site.address || 'No address provided'}</p>
                <div className="mt-4 flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${site.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {site.status}
                  </span>
                  <span className="text-xs text-gray-400">{site.timezone}</span>
                </div>
              </div>
              {canManage && (
                <div className="mt-6 pt-4 border-t flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => handleDelete(site._id)}>Delete</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
