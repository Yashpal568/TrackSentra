import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Building2, Shield, Edit3, Save, X, Phone, Mail, MapPin, Globe, Clock, CheckCircle2 } from 'lucide-react';

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
      setError('');
    } catch (err) {
      setError('Failed to update company configuration.');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
    </div>
  );

  if (!company) return (
    <div className="flex flex-col justify-center items-center h-64 p-8 text-center animate-in fade-in duration-500">
      <Building2 size={48} className="text-slate-300 mb-4" />
      <h2 className="text-xl font-bold text-slate-800">No Company Profile</h2>
      <p className="text-slate-500 max-w-md mt-2">There is no company profile associated with this account. Please contact technical support.</p>
    </div>
  );

  const canEdit = user?.role === 'SUPER_ADMIN' || user?.role === 'COMPANY_ADMIN';

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="text-slate-800" /> Company Settings
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage organizational profile, security protocols, and operational thresholds.</p>
        </div>
        {canEdit && !isEditing && (
          <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900">
            <Edit3 size={16} /> Edit Configuration
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-3">
          <Shield size={20} /> {error}
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleUpdate} className="space-y-8">
          <Card className="overflow-hidden border-t-4 border-t-slate-800 shadow-md">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <Building2 size={18} className="text-slate-500" />
              <h2 className="text-lg font-bold text-slate-800">Basic Profile Information</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Registered Company Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" required value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full rounded-md border-slate-300 shadow-sm focus:border-slate-800 focus:ring-slate-800 px-4 py-2 border"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Headquarters / Primary Address</label>
                <input 
                  type="text" value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full rounded-md border-slate-300 shadow-sm focus:border-slate-800 focus:ring-slate-800 px-4 py-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Corporate Contact Email</label>
                <input 
                  type="email" value={formData.contactEmail}
                  onChange={e => setFormData({...formData, contactEmail: e.target.value})}
                  className="w-full rounded-md border-slate-300 shadow-sm focus:border-slate-800 focus:ring-slate-800 px-4 py-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Corporate Contact Phone</label>
                <input 
                  type="text" value={formData.contactPhone}
                  onChange={e => setFormData({...formData, contactPhone: e.target.value})}
                  className="w-full rounded-md border-slate-300 shadow-sm focus:border-slate-800 focus:ring-slate-800 px-4 py-2 border"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Default Operational Timezone</label>
                <select
                  value={formData.timezone}
                  onChange={e => setFormData({...formData, timezone: e.target.value})}
                  className="w-full rounded-md border-slate-300 shadow-sm focus:border-slate-800 focus:ring-slate-800 px-4 py-2 border bg-white"
                >
                  <option value="UTC">UTC (Universal Time)</option>
                  <option value="America/New_York">Eastern Time (US & Canada)</option>
                  <option value="America/Chicago">Central Time (US & Canada)</option>
                  <option value="America/Denver">Mountain Time (US & Canada)</option>
                  <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                  <option value="Europe/London">London</option>
                </select>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="overflow-hidden border-t-4 border-t-blue-500 shadow-md">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                <MapPin size={18} className="text-blue-500" />
                <h2 className="text-lg font-bold text-slate-800">Patrol Requirements</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      id="requireGps"
                      checked={formData.settings.patrol.requireGps}
                      onChange={e => setFormData({
                        ...formData, 
                        settings: { ...formData.settings, patrol: { ...formData.settings.patrol, requireGps: e.target.checked } }
                      })}
                      className="mt-1 h-5 w-5 rounded border-blue-300 text-blue-600 focus:ring-blue-600"
                    />
                    <div>
                      <label htmlFor="requireGps" className="text-sm font-bold text-blue-900 block">Enforce Strict GPS Verification</label>
                      <p className="text-xs text-blue-700 mt-1">When enabled, QR scans will be rejected if the guard's device cannot acquire a GPS lock within the designated checkpoint radius.</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Global GPS Accuracy Threshold (Meters)</label>
                  <input 
                    type="number" min="5" max="500" value={formData.settings.patrol.gpsAccuracyThreshold}
                    onChange={e => setFormData({
                      ...formData, 
                      settings: { ...formData.settings, patrol: { ...formData.settings.patrol, gpsAccuracyThreshold: parseInt(e.target.value) } }
                    })}
                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 border"
                  />
                  <p className="text-xs text-slate-500 mt-2">Maximum acceptable GPS deviation before a scan is flagged as invalid. Recommended: 50m.</p>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden border-t-4 border-t-purple-500 shadow-md">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                <Shield size={18} className="text-purple-500" />
                <h2 className="text-lg font-bold text-slate-800">Security Parameters</h2>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Idle Session Timeout (Minutes)</label>
                  <input 
                    type="number" min="5" max="1440" value={formData.settings.security.sessionTimeoutMinutes}
                    onChange={e => setFormData({
                      ...formData, 
                      settings: { ...formData.settings, security: { ...formData.settings.security, sessionTimeoutMinutes: parseInt(e.target.value) } }
                    })}
                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 px-4 py-2 border"
                  />
                  <p className="text-xs text-slate-500 mt-2">Time before an inactive dashboard user is automatically logged out. For SOC environments, 60-120 minutes is typical.</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
            <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} className="flex items-center gap-2">
              <X size={16} /> Cancel Editing
            </Button>
            <Button type="submit" className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900">
              <Save size={16} /> Save Configuration
            </Button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Profile Info */}
          <Card className="lg:col-span-2 overflow-hidden shadow-sm border border-slate-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Building2 size={18} className="text-slate-500"/> Organizational Profile</h2>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${company.status === 'active' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                {company.status === 'active' && <CheckCircle2 size={12} />} {company.status}
              </span>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                  <Building2 size={32} />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900">{company.name}</h1>
                  <p className="text-slate-500 text-sm font-medium">Tenant ID: {company._id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 mt-8 pt-8 border-t border-slate-100">
                <div className="flex items-start gap-3">
                  <MapPin className="text-slate-400 mt-0.5 shrink-0" size={18} />
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Headquarters</h3>
                    <p className="text-slate-800 font-medium leading-snug">{company.address || 'Address not configured'}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Globe className="text-slate-400 mt-0.5 shrink-0" size={18} />
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Timezone</h3>
                    <p className="text-slate-800 font-medium">{company.timezone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="text-slate-400 mt-0.5 shrink-0" size={18} />
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Support Email</h3>
                    <p className="text-slate-800 font-medium">{company.contactEmail || 'Not configured'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="text-slate-400 mt-0.5 shrink-0" size={18} />
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Support Phone</h3>
                    <p className="text-slate-800 font-medium">{company.contactPhone || 'Not configured'}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Settings Cards */}
          <div className="space-y-6">
            <Card className="overflow-hidden shadow-sm border border-slate-200 relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 pl-7">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2"><MapPin size={16} className="text-blue-500"/> Patrol Configuration</h2>
              </div>
              <div className="p-6 pl-7 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 font-medium">Strict GPS Verification</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${company.settings?.patrol?.requireGps ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                    {company.settings?.patrol?.requireGps ? 'ENFORCED' : 'DISABLED'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 font-medium">GPS Accuracy Tolerance</span>
                  <span className="font-bold text-slate-900">{company.settings?.patrol?.gpsAccuracyThreshold || 50}m</span>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden shadow-sm border border-slate-200 relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 pl-7">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Shield size={16} className="text-purple-500"/> Security Policies</h2>
              </div>
              <div className="p-6 pl-7 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 font-medium">Idle Session Timeout</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1"><Clock size={14} className="text-slate-400"/> {company.settings?.security?.sessionTimeoutMinutes || 60} mins</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
