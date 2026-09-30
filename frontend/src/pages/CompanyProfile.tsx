import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Building2, Settings, Shield } from 'lucide-react';

export const CompanyProfile = () => {
  const { user } = useAuthStore();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    address: '', 
    timezone: '',
    contactEmail: '',
    contactPhone: '',
    settings: {
      patrol: { requireGps: true, gpsAccuracyThreshold: 50 },
      security: { sessionTimeoutMinutes: 60 }
    }
  });

  const fetchCompany = async () => {
    try {
      const res = await api.get('/companies');
      if (res.data.companies.length > 0) {
        const c = res.data.companies[0];
        setCompany(c);
        setFormData({
          name: c.name,
          address: c.address || '',
          timezone: c.timezone || 'UTC',
          contactEmail: c.contactEmail || '',
          contactPhone: c.contactPhone || '',
          settings: {
            patrol: {
              requireGps: c.settings?.patrol?.requireGps ?? true,
              gpsAccuracyThreshold: c.settings?.patrol?.gpsAccuracyThreshold ?? 50
            },
            security: {
              sessionTimeoutMinutes: c.settings?.security?.sessionTimeoutMinutes ?? 60
            }
          }
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
        <h1 className="text-2xl font-bold flex items-center gap-2"><Building2 /> Company Settings</h1>
        {canEdit && !isEditing && (
          <Button onClick={() => setIsEditing(true)}>Edit Configuration</Button>
        )}
      </div>

      <Card>
        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-6 p-2">
            <div>
              <h2 className="text-lg font-bold mb-4 border-b pb-2 flex items-center gap-2"><Building2 size={18} /> Basic Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Name</label>
                  <input 
                    type="text" required value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input 
                    type="text" value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                  <input 
                    type="email" value={formData.contactEmail}
                    onChange={e => setFormData({...formData, contactEmail: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                  <input 
                    type="text" value={formData.contactPhone}
                    onChange={e => setFormData({...formData, contactPhone: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold mb-4 border-b pb-2 flex items-center gap-2"><Settings size={18} /> Patrol Configuration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 mt-4">
                  <input 
                    type="checkbox" 
                    id="requireGps"
                    checked={formData.settings.patrol.requireGps}
                    onChange={e => setFormData({
                      ...formData, 
                      settings: { ...formData.settings, patrol: { ...formData.settings.patrol, requireGps: e.target.checked } }
                    })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                  />
                  <label htmlFor="requireGps" className="text-sm font-medium text-gray-700">Require GPS for Checkpoints</label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">GPS Accuracy Threshold (meters)</label>
                  <input 
                    type="number" value={formData.settings.patrol.gpsAccuracyThreshold}
                    onChange={e => setFormData({
                      ...formData, 
                      settings: { ...formData.settings, patrol: { ...formData.settings.patrol, gpsAccuracyThreshold: parseInt(e.target.value) } }
                    })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold mb-4 border-b pb-2 flex items-center gap-2"><Shield size={18} /> Security Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Session Timeout (Minutes)</label>
                  <input 
                    type="number" value={formData.settings.security.sessionTimeoutMinutes}
                    onChange={e => setFormData({
                      ...formData, 
                      settings: { ...formData.settings, security: { ...formData.settings.security, sessionTimeoutMinutes: parseInt(e.target.value) } }
                    })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button type="submit">Save Configuration</Button>
              <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </form>
        ) : (
          <div className="space-y-8 p-2">
            <div>
              <h2 className="text-lg font-bold mb-4 border-b pb-2 flex items-center gap-2"><Building2 size={18} /> Basic Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Company Name</h3>
                  <p className="mt-1 text-gray-900">{company.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Timezone</h3>
                  <p className="mt-1 text-gray-900">{company.timezone}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500">Address</h3>
                  <p className="mt-1 text-gray-900">{company.address || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Contact Email</h3>
                  <p className="mt-1 text-gray-900">{company.contactEmail || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Contact Phone</h3>
                  <p className="mt-1 text-gray-900">{company.contactPhone || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize mt-1 ${company.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {company.status}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold mb-4 border-b pb-2 flex items-center gap-2"><Settings size={18} /> Patrol Configuration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Require GPS for Checkpoints</h3>
                  <p className="mt-1 text-gray-900">{company.settings?.patrol?.requireGps ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">GPS Accuracy Threshold</h3>
                  <p className="mt-1 text-gray-900">{company.settings?.patrol?.gpsAccuracyThreshold || 50} meters</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold mb-4 border-b pb-2 flex items-center gap-2"><Shield size={18} /> Security Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Session Timeout</h3>
                  <p className="mt-1 text-gray-900">{company.settings?.security?.sessionTimeoutMinutes || 60} minutes</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
