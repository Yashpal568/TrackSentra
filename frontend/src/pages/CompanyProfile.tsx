import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { 
  Building2, Shield, Edit3, Phone, Mail, MapPin, Globe, Copy, 
  ChevronRight, ChevronDown, Check, Target, Clock, MonitorSmartphone
} from 'lucide-react';

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
      patrol: { requireGps: true, gpsAccuracyThreshold: 50, scanWindowMinutes: 5, autoComplete: true },
      security: { sessionTimeoutMinutes: 60, multiDeviceLogin: false, requireDeviceLocation: true, loginAttemptLimit: 5, passwordExpiryDays: 90 }
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
          timezone: c.timezone || 'Asia/Kolkata',
          contactEmail: c.contactEmail || '',
          contactPhone: c.contactPhone || '',
          settings: {
            patrol: {
              requireGps: c.settings?.patrol?.requireGps ?? true,
              gpsAccuracyThreshold: c.settings?.patrol?.gpsAccuracyThreshold ?? 50,
              scanWindowMinutes: c.settings?.patrol?.scanWindowMinutes ?? 5,
              autoComplete: c.settings?.patrol?.autoComplete ?? true
            },
            security: {
              sessionTimeoutMinutes: c.settings?.security?.sessionTimeoutMinutes ?? 60,
              multiDeviceLogin: c.settings?.security?.multiDeviceLogin ?? false,
              requireDeviceLocation: c.settings?.security?.requireDeviceLocation ?? true,
              loginAttemptLimit: c.settings?.security?.loginAttemptLimit ?? 5,
              passwordExpiryDays: c.settings?.security?.passwordExpiryDays ?? 90
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

  const handleQuickUpdate = async (section: 'patrol' | 'security', field: string, value: any) => {
    if (!canEdit) return;
    try {
      setError(''); // clear previous errors
      const updatedSettings = {
        ...company.settings,
        [section]: {
          ...company.settings[section],
          [field]: value
        }
      };
      
      // Optimistic Update
      setCompany({ ...company, settings: updatedSettings });
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [section]: {
            ...prev.settings[section],
            [field]: value
          }
        }
      }));

      // API Call
      const res = await api.put(`/companies/${company._id}`, { settings: updatedSettings });
      setCompany(res.data.company);
    } catch (err) {
      setError('Failed to quick-update setting.');
      fetchCompany(); // Revert on failure
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
    <div className="w-full pb-12 animate-in fade-in duration-500">
      
      {/* Premium Header Area with Breadcrumbs and Background */}
      <div className="relative bg-surface-sidebar border-b border-border-subtle pt-5 pb-6 overflow-hidden shadow-sm">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-5 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-linear-to-r from-emerald-900/20 to-transparent"></div>
        
        <div className="relative z-10 max-w-350 mx-auto px-6 sm:px-10">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-medium text-text-muted mb-4">
            <span className="hover:text-text-main cursor-pointer transition-colors">Company</span>
            <ChevronRight size={12} />
            <span className="text-text-main">Settings</span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-text-main tracking-tight mb-2">
                Company Settings
              </h1>
              <p className="text-text-secondary text-sm">Manage your organization's profile, security protocols, and operational settings.</p>
            </div>
            {canEdit && !isEditing && (
              <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-emerald-primary text-background font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-900/20 transition-all border-none h-10 px-5 rounded-lg shrink-0">
                <Edit3 size={16} /> Edit Configuration
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-350 mx-auto px-6 sm:px-10 mt-6 relative z-20 space-y-8">
      
        {error && (
          <div className="p-4 bg-danger/10 text-danger border border-danger/30 rounded-lg flex items-center gap-3 shadow-sm">
            <Shield size={20} /> {error}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-8 bg-surface-card border border-border-subtle rounded-xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border-subtle">
              <Building2 size={24} className="text-emerald-primary" />
              <h2 className="text-xl font-bold text-text-main">Edit Profile Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label className="mb-2 text-text-secondary font-medium text-xs uppercase tracking-wider">Registered Company Name <span className="text-danger">*</span></Label>
                <Input 
                  type="text" required value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Company Name"
                  className="bg-surface-main border-border-subtle"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="mb-2 text-text-secondary font-medium text-xs uppercase tracking-wider">Headquarters / Primary Address</Label>
                <Input 
                  type="text" value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  placeholder="123 Corporate Blvd"
                  className="bg-surface-main border-border-subtle"
                />
              </div>
              <div>
                <Label className="mb-2 text-text-secondary font-medium text-xs uppercase tracking-wider">Corporate Contact Email</Label>
                <Input 
                  type="email" value={formData.contactEmail}
                  onChange={e => setFormData({...formData, contactEmail: e.target.value})}
                  placeholder="contact@company.com"
                  className="bg-surface-main border-border-subtle"
                />
              </div>
              <div>
                <Label className="mb-2 text-text-secondary font-medium text-xs uppercase tracking-wider">Corporate Contact Phone</Label>
                <Input 
                  type="text" value={formData.contactPhone}
                  onChange={e => setFormData({...formData, contactPhone: e.target.value})}
                  placeholder="+1 (555) 000-0000"
                  className="bg-surface-main border-border-subtle"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="mb-2 text-text-secondary font-medium text-xs uppercase tracking-wider">Default Operational Timezone</Label>
                <select
                  value={formData.timezone}
                  onChange={e => setFormData({...formData, timezone: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-border-subtle bg-surface-main px-3 py-2 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-emerald-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                >
                  <option value="Asia/Kolkata">IST (Indian Standard Time)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-border-subtle">
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin size={18} className="text-text-muted" />
                  <h3 className="text-lg font-bold text-text-main">Patrol Requirements</h3>
                </div>
                
                <div className="bg-surface-main p-4 rounded-lg border border-border-subtle">
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      id="requireGps"
                      checked={formData.settings.patrol.requireGps}
                      onChange={e => setFormData({
                        ...formData, 
                        settings: { ...formData.settings, patrol: { ...formData.settings.patrol, requireGps: e.target.checked } }
                      })}
                      className="mt-1 h-4 w-4 rounded border-border-subtle bg-surface-main text-emerald-primary focus:ring-emerald-primary/50"
                    />
                    <div>
                      <Label htmlFor="requireGps" className="text-text-main font-bold block cursor-pointer">Enforce Strict GPS Verification</Label>
                      <p className="text-xs text-text-secondary mt-1">When enabled, QR scans will be rejected if the guard's device cannot acquire a GPS lock within the designated checkpoint radius.</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="mb-2 text-text-secondary font-medium text-xs uppercase tracking-wider">Global GPS Accuracy Tolerance (Meters)</Label>
                  <Input 
                    type="number" min="5" max="500" value={formData.settings.patrol.gpsAccuracyThreshold}
                    onChange={e => setFormData({
                      ...formData, 
                      settings: { ...formData.settings, patrol: { ...formData.settings.patrol, gpsAccuracyThreshold: parseInt(e.target.value) } }
                    })}
                    className="bg-surface-main border-border-subtle"
                  />
                  <p className="text-xs text-text-muted mt-2">Maximum acceptable GPS deviation before a scan is flagged as invalid. Recommended: 50m.</p>
                </div>

                <div>
                  <Label className="mb-2 text-text-secondary font-medium text-xs uppercase tracking-wider">Checkpoint Scan Window (Minutes)</Label>
                  <Input 
                    type="number" min="1" max="60" value={formData.settings.patrol.scanWindowMinutes}
                    onChange={e => setFormData({
                      ...formData, 
                      settings: { ...formData.settings, patrol: { ...formData.settings.patrol, scanWindowMinutes: parseInt(e.target.value) } }
                    })}
                    className="bg-surface-main border-border-subtle"
                  />
                  <p className="text-xs text-text-muted mt-2">Allowed time window to scan a checkpoint before it is considered missed.</p>
                </div>

                <div className="bg-surface-main p-4 rounded-lg border border-border-subtle">
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      id="autoComplete"
                      checked={formData.settings.patrol.autoComplete}
                      onChange={e => setFormData({
                        ...formData, 
                        settings: { ...formData.settings, patrol: { ...formData.settings.patrol, autoComplete: e.target.checked } }
                      })}
                      className="mt-1 h-4 w-4 rounded border-border-subtle bg-surface-main text-emerald-primary focus:ring-emerald-primary/50"
                    />
                    <div>
                      <Label htmlFor="autoComplete" className="text-text-main font-bold block cursor-pointer">Auto Complete Patrol</Label>
                      <p className="text-xs text-text-secondary mt-1">Automatically mark the patrol session as complete once all assigned checkpoints have been scanned.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield size={18} className="text-text-muted" />
                  <h3 className="text-lg font-bold text-text-main">Security Parameters</h3>
                </div>
                
                <div>
                  <Label className="mb-2 text-text-secondary font-medium text-xs uppercase tracking-wider">Idle Session Timeout (Minutes)</Label>
                  <Input 
                    type="number" min="5" max="1440" value={formData.settings.security.sessionTimeoutMinutes}
                    onChange={e => setFormData({
                      ...formData, 
                      settings: { ...formData.settings, security: { ...formData.settings.security, sessionTimeoutMinutes: parseInt(e.target.value) } }
                    })}
                    className="bg-surface-main border-border-subtle"
                  />
                  <p className="text-xs text-text-muted mt-2">Time before an inactive dashboard user is automatically logged out.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 text-text-secondary font-medium text-xs uppercase tracking-wider">Login Attempt Limit</Label>
                    <Input 
                      type="number" min="1" max="10" value={formData.settings.security.loginAttemptLimit}
                      onChange={e => setFormData({
                        ...formData, 
                        settings: { ...formData.settings, security: { ...formData.settings.security, loginAttemptLimit: parseInt(e.target.value) } }
                      })}
                      className="bg-surface-main border-border-subtle"
                    />
                  </div>
                  <div>
                    <Label className="mb-2 text-text-secondary font-medium text-xs uppercase tracking-wider">Password Expiry (Days)</Label>
                    <Input 
                      type="number" min="0" max="365" value={formData.settings.security.passwordExpiryDays}
                      onChange={e => setFormData({
                        ...formData, 
                        settings: { ...formData.settings, security: { ...formData.settings.security, passwordExpiryDays: parseInt(e.target.value) } }
                      })}
                      className="bg-surface-main border-border-subtle"
                    />
                  </div>
                </div>

                <div className="bg-surface-main p-4 rounded-lg border border-border-subtle space-y-4">
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      id="multiDeviceLogin"
                      checked={formData.settings.security.multiDeviceLogin}
                      onChange={e => setFormData({
                        ...formData, 
                        settings: { ...formData.settings, security: { ...formData.settings.security, multiDeviceLogin: e.target.checked } }
                      })}
                      className="mt-1 h-4 w-4 rounded border-border-subtle bg-surface-main text-emerald-primary focus:ring-emerald-primary/50"
                    />
                    <div>
                      <Label htmlFor="multiDeviceLogin" className="text-text-main font-bold block cursor-pointer">Allow Multi-Device Login</Label>
                      <p className="text-xs text-text-secondary mt-1">Allow users to be logged into multiple devices concurrently.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-4 border-t border-border-subtle">
                    <input 
                      type="checkbox" 
                      id="requireDeviceLocation"
                      checked={formData.settings.security.requireDeviceLocation}
                      onChange={e => setFormData({
                        ...formData, 
                        settings: { ...formData.settings, security: { ...formData.settings.security, requireDeviceLocation: e.target.checked } }
                      })}
                      className="mt-1 h-4 w-4 rounded border-border-subtle bg-surface-main text-emerald-primary focus:ring-emerald-primary/50"
                    />
                    <div>
                      <Label htmlFor="requireDeviceLocation" className="text-text-main font-bold block cursor-pointer">Require Device Location</Label>
                      <p className="text-xs text-text-secondary mt-1">Require location permissions to be active on guard devices at all times during shifts.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-border-subtle mt-8">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="bg-surface-main text-text-main hover:bg-surface-hover h-10 px-5 border-border-subtle font-semibold">
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-primary text-background hover:bg-emerald-600 h-10 px-5 shadow-sm border-none font-bold">
                Save Configuration
              </Button>
            </div>
          </form>
        ) : (
          <>
            {/* Unified Organization Profile Card */}
            <div className="bg-surface-card border border-border-subtle rounded-xl shadow-lg flex flex-col md:flex-row overflow-hidden">
              
              {/* Left Identity Section */}
              <div className="p-6 sm:p-8 border-b md:border-b-0 md:border-r border-border-subtle md:w-[45%] lg:w-2/5 shrink-0 bg-surface-sidebar/50">
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 rounded-xl bg-emerald-primary/10 flex items-center justify-center shrink-0 border border-emerald-primary/20 text-emerald-primary">
                    <Building2 size={32} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">
                      Organization {user?.isDemoUser && <span className="text-emerald-primary ml-1 normal-case italic opacity-80">(Demo Data)</span>}
                    </div>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h2 className="text-2xl font-black text-text-main truncate" title={company.name}>{company.name}</h2>
                      {company.status === 'active' ? (
                        <span className="bg-emerald-primary/20 text-emerald-primary text-[10px] uppercase font-bold tracking-wider py-0.5 px-2.5 rounded-full border border-emerald-primary/30">
                          Active
                        </span>
                      ) : (
                        <span className="bg-danger/20 text-danger text-[10px] uppercase font-bold tracking-wider py-0.5 px-2.5 rounded-full border border-danger/30">
                          {company.status}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-secondary font-mono bg-surface-main w-fit px-2 py-1 rounded border border-border-subtle group">
                      <span>Tenant ID: <span className="text-text-muted">{company._id}</span></span>
                      <button onClick={() => navigator.clipboard.writeText(company._id)} className="text-text-muted hover:text-emerald-primary transition-colors opacity-70 group-hover:opacity-100" title="Copy Tenant ID">
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Info Grid */}
              <div className="p-6 sm:p-8 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 h-full">
                  
                  <div className="flex items-start gap-3 group">
                    <div className="w-8 h-8 rounded-full bg-surface-main flex items-center justify-center text-text-muted border border-border-subtle shrink-0">
                      <MapPin size={14} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Headquarters</div>
                      {company.address ? (
                        <div className="text-sm font-medium text-text-main">{company.address}</div>
                      ) : (
                        <div>
                          <div className="text-sm italic text-text-muted mb-1">Not configured</div>
                          {canEdit && <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-emerald-primary hover:text-emerald-400 hover:underline">Add Address</button>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 group">
                    <div className="w-8 h-8 rounded-full bg-surface-main flex items-center justify-center text-text-muted border border-border-subtle shrink-0">
                      <Globe size={14} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Timezone</div>
                      <div className="text-sm font-medium text-text-main mb-1">IST (Indian Standard Time)</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 group">
                    <div className="w-8 h-8 rounded-full bg-surface-main flex items-center justify-center text-text-muted border border-border-subtle shrink-0">
                      <Mail size={14} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Support Email</div>
                      {company.contactEmail ? (
                        <div className="text-sm font-medium text-text-main">{company.contactEmail}</div>
                      ) : (
                        <div>
                          <div className="text-sm italic text-text-muted mb-1">Not configured</div>
                          {canEdit && <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-emerald-primary hover:text-emerald-400 hover:underline">Add Email</button>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 group">
                    <div className="w-8 h-8 rounded-full bg-surface-main flex items-center justify-center text-text-muted border border-border-subtle shrink-0">
                      <Phone size={14} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Support Phone</div>
                      {company.contactPhone ? (
                        <div className="text-sm font-medium text-text-main">{company.contactPhone}</div>
                      ) : (
                        <div>
                          <div className="text-sm italic text-text-muted mb-1">Not configured</div>
                          {canEdit && <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-emerald-primary hover:text-emerald-400 hover:underline">Add Phone</button>}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Unified Single-Page Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 pb-12 animate-in fade-in duration-500">
              {/* Patrol Configuration */}
              <div className="bg-surface-card border border-border-subtle rounded-xl shadow-lg overflow-hidden flex flex-col hover:border-emerald-primary/30 transition-colors">
                <div className="px-6 py-5 border-b border-border-subtle">
                  <div className="flex items-center gap-3">
                    <MapPin size={20} className="text-emerald-primary drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <div>
                      <h3 className="text-lg font-bold text-text-main">Patrol Configuration</h3>
                      <p className="text-xs text-text-secondary mt-1">Configure how patrols are tracked and validated.</p>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-border-subtle flex-1 flex flex-col">
                  <div className="px-6 py-4 flex items-center justify-between hover:bg-surface-hover/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <Target size={18} className="text-text-muted" />
                      <div>
                        <div className="text-sm font-bold text-text-main">Strict GPS Verification</div>
                        <div className="text-xs text-text-secondary mt-0.5">Require guards to be within checkpoint radius.</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {company.settings?.patrol?.requireGps && (
                        <span className="text-[10px] font-black tracking-wider uppercase text-emerald-primary bg-emerald-primary/10 px-2 py-0.5 rounded border border-emerald-primary/20">Enforced</span>
                      )}
                      <div onClick={() => canEdit && handleQuickUpdate('patrol', 'requireGps', !company.settings?.patrol?.requireGps)} className={`w-10 h-5 rounded-full relative transition-colors ${!canEdit ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${company.settings?.patrol?.requireGps ? 'bg-emerald-primary' : 'bg-surface-main border border-border-subtle'}`}>
                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${company.settings?.patrol?.requireGps ? 'translate-x-5' : 'translate-x-0'}`}></div>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4 flex items-center justify-between hover:bg-surface-hover/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <MapPin size={18} className="text-text-muted" />
                      <div>
                        <div className="text-sm font-bold text-text-main">GPS Accuracy Tolerance</div>
                        <div className="text-xs text-text-secondary mt-0.5">Maximum allowed GPS inaccuracy.</div>
                      </div>
                    </div>
                    <div className="relative flex items-center justify-between px-3 py-1 bg-surface-main border border-border-subtle rounded-md group-hover:border-emerald-primary/50 transition-colors">
                      <select disabled={!canEdit} value={company.settings?.patrol?.gpsAccuracyThreshold || 50} onChange={(e) => handleQuickUpdate('patrol', 'gpsAccuracyThreshold', parseInt(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed">
                        <option value={10}>10 m</option><option value={20}>20 m</option><option value={50}>50 m</option><option value={100}>100 m</option>
                      </select>
                      <span className="text-sm font-bold text-text-main pointer-events-none">{company.settings?.patrol?.gpsAccuracyThreshold || 50} m</span>
                      <ChevronDown size={14} className="text-text-muted ml-2 pointer-events-none" />
                    </div>
                  </div>
                  <div className="px-6 py-4 flex items-center justify-between hover:bg-surface-hover/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <Clock size={18} className="text-text-muted" />
                      <div>
                        <div className="text-sm font-bold text-text-main">Checkpoint Scan Window</div>
                        <div className="text-xs text-text-secondary mt-0.5">Allowed time window for each checkpoint.</div>
                      </div>
                    </div>
                    <div className="relative flex items-center justify-between px-3 py-1 bg-surface-main border border-border-subtle rounded-md group-hover:border-emerald-primary/50 transition-colors">
                      <select disabled={!canEdit} value={company.settings?.patrol?.scanWindowMinutes || 5} onChange={(e) => handleQuickUpdate('patrol', 'scanWindowMinutes', parseInt(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed">
                        <option value={1}>1 min</option><option value={2}>2 min</option><option value={5}>5 min</option><option value={10}>10 min</option>
                      </select>
                      <span className="text-sm font-bold text-text-main pointer-events-none">{company.settings?.patrol?.scanWindowMinutes || 5} min</span>
                      <ChevronDown size={14} className="text-text-muted ml-2 pointer-events-none" />
                    </div>
                  </div>
                  <div className="px-6 py-4 flex flex-1 items-center justify-between hover:bg-surface-hover/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <Check size={18} className="text-text-muted" />
                      <div>
                        <div className="text-sm font-bold text-text-main">Auto Complete Patrol</div>
                        <div className="text-xs text-text-secondary mt-0.5">Automatically mark complete after all checkpoints.</div>
                      </div>
                    </div>
                    <div onClick={() => canEdit && handleQuickUpdate('patrol', 'autoComplete', !company.settings?.patrol?.autoComplete)} className={`w-10 h-5 rounded-full relative transition-colors ${!canEdit ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${company.settings?.patrol?.autoComplete ? 'bg-emerald-primary' : 'bg-surface-main border border-border-subtle'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${company.settings?.patrol?.autoComplete ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Policies */}
              <div className="bg-surface-card border border-border-subtle rounded-xl shadow-lg overflow-hidden flex flex-col hover:border-emerald-primary/30 transition-colors">
                <div className="px-6 py-5 border-b border-border-subtle">
                  <div className="flex items-center gap-3">
                    <Shield size={20} className="text-emerald-primary drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <div>
                      <h3 className="text-lg font-bold text-text-main">Security Policies</h3>
                      <p className="text-xs text-text-secondary mt-1">Manage session, access and security policies.</p>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-border-subtle flex-1 flex flex-col">
                  <div className="px-6 py-4 flex items-center justify-between hover:bg-surface-hover/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <Clock size={18} className="text-text-muted" />
                      <div>
                        <div className="text-sm font-bold text-text-main">Idle Session Timeout</div>
                        <div className="text-xs text-text-secondary mt-0.5">Automatically log out inactive users.</div>
                      </div>
                    </div>
                    <div className="relative flex items-center justify-between px-3 py-1 bg-surface-main border border-border-subtle rounded-md group-hover:border-emerald-primary/50 transition-colors">
                      <select disabled={!canEdit} value={company.settings?.security?.sessionTimeoutMinutes || 60} onChange={(e) => handleQuickUpdate('security', 'sessionTimeoutMinutes', parseInt(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed">
                        <option value={15}>15 m</option><option value={30}>30 m</option><option value={60}>60 m</option><option value={120}>120 m</option>
                      </select>
                      <span className="text-sm font-bold text-text-main pointer-events-none">{company.settings?.security?.sessionTimeoutMinutes || 60} m</span>
                      <ChevronDown size={14} className="text-text-muted ml-2 pointer-events-none" />
                    </div>
                  </div>
                  <div className="px-6 py-4 flex items-center justify-between hover:bg-surface-hover/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <MonitorSmartphone size={18} className="text-text-muted" />
                      <div>
                        <div className="text-sm font-bold text-text-main">Multi-Device Login</div>
                        <div className="text-xs text-text-secondary mt-0.5">Allow multiple devices for the same account.</div>
                      </div>
                    </div>
                    <div onClick={() => canEdit && handleQuickUpdate('security', 'multiDeviceLogin', !company.settings?.security?.multiDeviceLogin)} className={`w-10 h-5 rounded-full relative transition-colors ${!canEdit ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${company.settings?.security?.multiDeviceLogin ? 'bg-emerald-primary' : 'bg-surface-main border border-border-subtle'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${company.settings?.security?.multiDeviceLogin ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </div>
                  </div>
                  <div className="px-6 py-4 flex items-center justify-between hover:bg-surface-hover/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <MapPin size={18} className="text-text-muted" />
                      <div>
                        <div className="text-sm font-bold text-text-main">Require Device Location</div>
                        <div className="text-xs text-text-secondary mt-0.5">Require location for guard operations.</div>
                      </div>
                    </div>
                    <div onClick={() => canEdit && handleQuickUpdate('security', 'requireDeviceLocation', !company.settings?.security?.requireDeviceLocation)} className={`w-10 h-5 rounded-full relative transition-colors ${!canEdit ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${company.settings?.security?.requireDeviceLocation !== false ? 'bg-emerald-primary' : 'bg-surface-main border border-border-subtle'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${company.settings?.security?.requireDeviceLocation !== false ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </div>
                  </div>
                  <div className="px-6 py-4 flex flex-1 items-center justify-between hover:bg-surface-hover/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <Shield size={18} className="text-text-muted" />
                      <div>
                        <div className="text-sm font-bold text-text-main">Login Attempt Limit</div>
                        <div className="text-xs text-text-secondary mt-0.5">Max failed login attempts before lockout.</div>
                      </div>
                    </div>
                    <div className="relative flex items-center justify-between px-3 py-1 bg-surface-main border border-border-subtle rounded-md group-hover:border-emerald-primary/50 transition-colors">
                      <select disabled={!canEdit} value={company.settings?.security?.loginAttemptLimit || 5} onChange={(e) => handleQuickUpdate('security', 'loginAttemptLimit', parseInt(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed">
                        <option value={3}>3</option><option value={5}>5</option><option value={10}>10</option>
                      </select>
                      <span className="text-sm font-bold text-text-main pointer-events-none">{company.settings?.security?.loginAttemptLimit || 5} attempts</span>
                      <ChevronDown size={14} className="text-text-muted ml-2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* System Metadata */}
              <div className="bg-surface-card border border-border-subtle rounded-xl shadow-lg overflow-hidden flex flex-col hover:border-emerald-primary/30 transition-colors">
                <div className="px-6 py-5 border-b border-border-subtle">
                  <div className="flex items-center gap-3">
                    <Building2 size={20} className="text-emerald-primary drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <div>
                      <h3 className="text-lg font-bold text-text-main">System Metadata</h3>
                      <p className="text-xs text-text-secondary mt-1">Core platform identifiers and lifecycle dates.</p>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-border-subtle flex-1 flex flex-col">
                  <div className="px-6 py-4 flex items-center justify-between hover:bg-surface-hover/30 transition-colors">
                    <div className="text-sm font-medium text-text-secondary">Account Status</div>
                    <div className="text-sm font-bold text-text-main uppercase">
                      {company.status === 'active' ? (
                        <span className="text-emerald-primary">Active</span>
                      ) : (
                        <span className="text-danger">{company.status}</span>
                      )}
                    </div>
                  </div>
                  <div className="px-6 py-4 flex items-center justify-between hover:bg-surface-hover/30 transition-colors">
                    <div className="text-sm font-medium text-text-secondary">Tenant ID</div>
                    <div className="text-sm font-mono text-text-muted">{company._id}</div>
                  </div>
                  <div className="px-6 py-4 flex items-center justify-between hover:bg-surface-hover/30 transition-colors">
                    <div className="text-sm font-medium text-text-secondary">Created On</div>
                    <div className="text-sm font-medium text-text-main">
                      {new Date(company.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                  <div className="px-6 py-4 flex-1 flex items-center justify-between hover:bg-surface-hover/30 transition-colors">
                    <div className="text-sm font-medium text-text-secondary">Last Modified</div>
                    <div className="text-sm font-medium text-text-main">
                      {new Date(company.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Integrations */}
              <div className="bg-surface-card border border-border-subtle rounded-xl shadow-lg flex flex-col items-center justify-center p-8 hover:border-emerald-primary/30 transition-colors">
                <div className="w-16 h-16 bg-surface-main border border-border-subtle rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                  <Globe size={28} className="text-text-muted drop-shadow-md" />
                </div>
                <h3 className="text-xl font-bold text-text-main mb-3">No Active Integrations</h3>
                <p className="text-sm text-text-secondary mb-8 text-center max-w-sm">
                  Connect TrackSentra with your existing security tools and workflows. Webhooks, API access, and third-party integrations will appear here once configured.
                </p>
                <Button disabled className="bg-surface-main text-text-muted border border-border-subtle cursor-not-allowed rounded-full px-6 shadow-sm">
                  Configure Integrations
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
