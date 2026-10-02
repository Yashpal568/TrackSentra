import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Badge } from '../components/ui/Badge';
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
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-primary"></div>
    </div>
  );

  if (!company) return (
    <div className="flex flex-col justify-center items-center h-64 p-8 text-center animate-in fade-in duration-500">
      <Building2 size={48} className="text-text-muted mb-4" />
      <h2 className="text-xl font-bold text-text-main">No Company Profile</h2>
      <p className="text-text-secondary max-w-md mt-2">There is no company profile associated with this account. Please contact technical support.</p>
    </div>
  );

  const canEdit = user?.role === 'SUPER_ADMIN' || user?.role === 'COMPANY_ADMIN';

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <Building2 className="text-emerald-primary" /> Company Settings
          </h1>
          <p className="text-text-secondary text-sm mt-1">Manage organizational profile, security protocols, and operational thresholds.</p>
        </div>
        {canEdit && !isEditing && (
          <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
            <Edit3 size={16} /> Edit Configuration
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-danger/10 text-danger border border-danger/30 rounded-lg flex items-center gap-3">
          <Shield size={20} /> {error}
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleUpdate} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="overflow-hidden border-t-4 border-t-emerald-primary shadow-lg bg-surface-card border-border-subtle">
            <div className="px-6 py-4 bg-surface-sidebar border-b border-border-subtle flex items-center gap-2">
              <Building2 size={18} className="text-emerald-primary" />
              <h2 className="text-lg font-bold text-text-main">Basic Profile Information</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label className="mb-2">Registered Company Name <span className="text-danger">*</span></Label>
                <Input 
                  type="text" required value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Company Name"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="mb-2">Headquarters / Primary Address</Label>
                <Input 
                  type="text" value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  placeholder="123 Corporate Blvd"
                />
              </div>
              <div>
                <Label className="mb-2">Corporate Contact Email</Label>
                <Input 
                  type="email" value={formData.contactEmail}
                  onChange={e => setFormData({...formData, contactEmail: e.target.value})}
                  placeholder="contact@company.com"
                />
              </div>
              <div>
                <Label className="mb-2">Corporate Contact Phone</Label>
                <Input 
                  type="text" value={formData.contactPhone}
                  onChange={e => setFormData({...formData, contactPhone: e.target.value})}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="mb-2">Default Operational Timezone</Label>
                <select
                  value={formData.timezone}
                  onChange={e => setFormData({...formData, timezone: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-border-subtle bg-surface-main px-3 py-2 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-emerald-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                >
                  <option value="UTC">UTC (Universal Time)</option>
                  <option value="Asia/Kolkata">IST (Indian Standard Time)</option>
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
            <Card className="overflow-hidden border-t-4 border-t-info shadow-md bg-surface-card border-border-subtle">
              <div className="px-6 py-4 bg-surface-sidebar border-b border-border-subtle flex items-center gap-2">
                <MapPin size={18} className="text-info" />
                <h2 className="text-lg font-bold text-text-main">Patrol Requirements</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="bg-info/10 p-4 rounded-lg border border-info/30">
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      id="requireGps"
                      checked={formData.settings.patrol.requireGps}
                      onChange={e => setFormData({
                        ...formData, 
                        settings: { ...formData.settings, patrol: { ...formData.settings.patrol, requireGps: e.target.checked } }
                      })}
                      className="mt-1 h-5 w-5 rounded border-border-subtle bg-surface-main text-info focus:ring-info/50"
                    />
                    <div>
                      <Label htmlFor="requireGps" className="text-info block">Enforce Strict GPS Verification</Label>
                      <p className="text-xs text-text-secondary mt-1">When enabled, QR scans will be rejected if the guard's device cannot acquire a GPS lock within the designated checkpoint radius.</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="mb-2">Global GPS Accuracy Threshold (Meters)</Label>
                  <Input 
                    type="number" min="5" max="500" value={formData.settings.patrol.gpsAccuracyThreshold}
                    onChange={e => setFormData({
                      ...formData, 
                      settings: { ...formData.settings, patrol: { ...formData.settings.patrol, gpsAccuracyThreshold: parseInt(e.target.value) } }
                    })}
                  />
                  <p className="text-xs text-text-secondary mt-2">Maximum acceptable GPS deviation before a scan is flagged as invalid. Recommended: 50m.</p>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden border-t-4 border-t-warning shadow-md bg-surface-card border-border-subtle">
              <div className="px-6 py-4 bg-surface-sidebar border-b border-border-subtle flex items-center gap-2">
                <Shield size={18} className="text-warning" />
                <h2 className="text-lg font-bold text-text-main">Security Parameters</h2>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <Label className="mb-2">Idle Session Timeout (Minutes)</Label>
                  <Input 
                    type="number" min="5" max="1440" value={formData.settings.security.sessionTimeoutMinutes}
                    onChange={e => setFormData({
                      ...formData, 
                      settings: { ...formData.settings, security: { ...formData.settings.security, sessionTimeoutMinutes: parseInt(e.target.value) } }
                    })}
                  />
                  <p className="text-xs text-text-secondary mt-2">Time before an inactive dashboard user is automatically logged out. For SOC environments, 60-120 minutes is typical.</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border-subtle">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="flex items-center gap-2">
              <X size={16} /> Cancel
            </Button>
            <Button type="submit" className="flex items-center gap-2">
              <Save size={16} /> Save Configuration
            </Button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Profile Info */}
          <Card className="lg:col-span-2 overflow-hidden shadow-lg border border-border-subtle bg-surface-card">
            <div className="px-6 py-4 bg-surface-sidebar border-b border-border-subtle flex items-center justify-between">
              <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
                <Building2 size={18} className="text-emerald-primary"/> 
                Organizational Profile
              </h2>
              {company.status === 'active' ? (
                <Badge variant="success" className="uppercase tracking-wider">
                  <CheckCircle2 size={12} className="mr-1" /> Active
                </Badge>
              ) : (
                <Badge variant="destructive" className="uppercase tracking-wider">
                  {company.status}
                </Badge>
              )}
            </div>
            <div className="p-6">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-2xl bg-emerald-primary/10 border border-emerald-primary/20 flex items-center justify-center text-emerald-primary shadow-inner">
                  <Building2 size={36} />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-text-main mb-1 tracking-tight">{company.name}</h1>
                  <Badge variant="outline" className="font-mono text-xs">Tenant ID: {company._id}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 mt-8 pt-8 border-t border-border-subtle">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-main flex items-center justify-center shrink-0 border border-border-subtle text-text-secondary">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Headquarters</h3>
                    <p className="text-text-main font-medium leading-snug">{company.address || 'Address not configured'}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-main flex items-center justify-center shrink-0 border border-border-subtle text-text-secondary">
                    <Globe size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Timezone</h3>
                    <p className="text-text-main font-medium">{company.timezone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-main flex items-center justify-center shrink-0 border border-border-subtle text-text-secondary">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Support Email</h3>
                    <p className="text-text-main font-medium">{company.contactEmail || 'Not configured'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-main flex items-center justify-center shrink-0 border border-border-subtle text-text-secondary">
                    <Phone size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Support Phone</h3>
                    <p className="text-text-main font-medium">{company.contactPhone || 'Not configured'}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Settings Cards */}
          <div className="space-y-6">
            <Card className="overflow-hidden shadow-lg border border-border-subtle bg-surface-card relative group hover:border-info/30 transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-info"></div>
              <div className="px-6 py-4 bg-surface-sidebar border-b border-border-subtle pl-7">
                <h2 className="text-sm font-bold text-text-main flex items-center gap-2"><MapPin size={16} className="text-info"/> Patrol Configuration</h2>
              </div>
              <div className="p-6 pl-7 space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary font-medium">Strict GPS Verification</span>
                  <Badge variant={company.settings?.patrol?.requireGps ? "success" : "secondary"} className="uppercase">
                    {company.settings?.patrol?.requireGps ? 'ENFORCED' : 'DISABLED'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary font-medium">GPS Accuracy Tolerance</span>
                  <span className="font-bold text-text-main text-lg">{company.settings?.patrol?.gpsAccuracyThreshold || 50}m</span>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden shadow-lg border border-border-subtle bg-surface-card relative group hover:border-warning/30 transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-warning"></div>
              <div className="px-6 py-4 bg-surface-sidebar border-b border-border-subtle pl-7">
                <h2 className="text-sm font-bold text-text-main flex items-center gap-2"><Shield size={16} className="text-warning"/> Security Policies</h2>
              </div>
              <div className="p-6 pl-7 space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary font-medium">Idle Session Timeout</span>
                  <span className="font-bold text-text-main flex items-center gap-1.5 text-lg">
                    <Clock size={16} className="text-text-muted"/> 
                    {company.settings?.security?.sessionTimeoutMinutes || 60} mins
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
