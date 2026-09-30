import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MapPin, Plus, Trash2, Globe, CheckCircle2, AlertCircle, ShieldAlert, Building2, MoreVertical } from 'lucide-react';

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
    if (!window.confirm('Are you sure you want to delete this site? All associated checkpoints and shifts will be affected.')) return;
    try {
      await api.delete(`/sites/${id}`);
      setSites(sites.filter(s => s._id !== id));
    } catch (err) {
      setError('Failed to delete site.');
    }
  };

  const canManage = ['SUPER_ADMIN', 'COMPANY_ADMIN', 'SITE_MANAGER'].includes(user?.role || '');

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="text-blue-600" /> Site Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">Configure and manage operational facilities and locations.</p>
        </div>
        {canManage && !isCreating && (
          <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
            <Plus size={18} /> Add New Site
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-3">
          <ShieldAlert size={20} /> {error}
        </div>
      )}

      {/* Creation Form */}
      {isCreating && (
        <Card className="border-t-4 border-t-blue-600 shadow-lg">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="text-lg font-bold text-slate-800">Register New Site</h2>
            <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600">
              <span className="sr-only">Close</span>
              &times;
            </button>
          </div>
          <form onSubmit={handleCreate} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Facility Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" required value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 border"
                  placeholder="e.g. Northwood Corporate Campus"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Physical Address</label>
                <input 
                  type="text" value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 border"
                  placeholder="123 Corporate Blvd, Suite 100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Operational Timezone</label>
                <select
                  value={formData.timezone}
                  onChange={e => setFormData({...formData, timezone: e.target.value})}
                  className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 border bg-white"
                >
                  <option value="UTC">UTC (Universal Time)</option>
                  <option value="America/New_York">Eastern Time (US & Canada)</option>
                  <option value="America/Chicago">Central Time (US & Canada)</option>
                  <option value="America/Denver">Mountain Time (US & Canada)</option>
                  <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                  <option value="Europe/London">London</option>
                  <option value="Asia/Dubai">Dubai</option>
                  <option value="Asia/Singapore">Singapore</option>
                  <option value="Australia/Sydney">Sydney</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100">
              <Button type="submit" className="flex items-center gap-2"><Plus size={16}/> Register Site</Button>
              <Button type="button" variant="secondary" onClick={() => setIsCreating(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Empty State */}
      {sites.length === 0 && !isCreating ? (
        <Card className="text-center py-16 px-6 border-dashed border-2 border-slate-200 bg-slate-50">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
            <Building2 className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Sites Configured</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">Create your first facility or site to begin assigning checkpoints and patrol routes.</p>
          {canManage && <Button onClick={() => setIsCreating(true)}>Add First Site</Button>}
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {sites.map(site => (
            <Card key={site._id} className="group hover:shadow-md transition-all flex flex-col bg-white overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <div className="p-6 flex-1 pl-7">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight">{site.name}</h3>
                    <div className="mt-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${site.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                        {site.status === 'active' ? <CheckCircle2 size={12}/> : <AlertCircle size={12}/>} 
                        {site.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical size={20} />
                  </button>
                </div>
                
                <div className="space-y-3 mt-6">
                  <div className="flex items-start text-sm text-slate-600">
                    <MapPin className="w-4 h-4 mr-3 mt-0.5 text-slate-400 shrink-0" />
                    <span className="line-clamp-2">{site.address || 'Address not configured'}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Globe className="w-4 h-4 mr-3 text-slate-400 shrink-0" />
                    <span>Timezone: <span className="font-medium">{site.timezone}</span></span>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center pl-7">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Facility Details</span>
                {canManage && (
                  <button onClick={() => handleDelete(site._id)} className="text-sm font-semibold text-red-600 hover:text-red-800 flex items-center gap-1">
                    <Trash2 size={14} /> Remove
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
