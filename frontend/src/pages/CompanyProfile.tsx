import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const CompanyProfile = () => {
  const { user } = useAuthStore();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', address: '', timezone: '' });

  const fetchCompany = async () => {
    try {
      // Assuming user has companyId implicitly, backend handles fetching correct company
      const res = await api.get('/companies');
      if (res.data.companies.length > 0) {
        setCompany(res.data.companies[0]);
        setFormData({
          name: res.data.companies[0].name,
          address: res.data.companies[0].address || '',
          timezone: res.data.companies[0].timezone || 'UTC'
        });
      }
    } catch (err) {
      setError('Failed to load company details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.put(`/companies/${company._id}`, formData);
      setCompany(res.data.company);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update company.');
    }
  };

  if (loading) return <div className="p-8">Loading company profile...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!company) return <div className="p-8">No company associated with this account.</div>;

  const canEdit = user?.role === 'SUPER_ADMIN' || user?.role === 'COMPANY_ADMIN';

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Company Profile</h1>
        {canEdit && !isEditing && (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        )}
      </div>

      <Card>
        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name</label>
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
            <div>
              <label className="block text-sm font-medium text-gray-700">Timezone</label>
              <input 
                type="text" value={formData.timezone}
                onChange={e => setFormData({...formData, timezone: e.target.value})}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Save Changes</Button>
              <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Company Name</h3>
              <p className="mt-1 text-lg text-gray-900">{company.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Address</h3>
              <p className="mt-1 text-gray-900">{company.address || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Timezone</h3>
              <p className="mt-1 text-gray-900">{company.timezone}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize mt-1 ${company.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {company.status}
              </span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
