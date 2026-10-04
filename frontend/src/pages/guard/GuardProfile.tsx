import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import { Camera, Mail, Shield, ShieldAlert, Key, Globe, Bell, FileText, Check, ChevronRight, LogOut, Loader2, Calendar, User as UserIcon, Monitor, Trash2 } from 'lucide-react';
import { api } from '../../lib/axios';

export const GuardProfile = () => {
  const { user, logout, updateProfile } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();

  const [activeTab, setActiveTab] = useState('personal');
  
  // Personal Info Form State
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: (user as any)?.phone || '',
    language: (user as any)?.language || language || 'en',
    timezone: (user as any)?.timezone || 'UTC'
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  // Security Settings State
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Activity State
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: (user as any).phone || '',
        language: (user as any).language || language || 'en',
        timezone: (user as any).timezone || 'UTC'
      });
    }
  }, [user, language]);

  useEffect(() => {
    if (activeTab === 'security') fetchSessions();
    if (activeTab === 'activity') fetchActivities();
  }, [activeTab]);

  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      const res = await api.get('/auth/sessions');
      setSessions(res.data.sessions || []);
    } catch (e) {
      console.error('Failed to load sessions', e);
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchActivities = async () => {
    try {
      setLoadingActivities(true);
      const res = await api.get('/audit/me');
      setActivities(res.data.data || []);
    } catch (e) {
      console.error('Failed to load activities', e);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleRevokeSession = async (id: string) => {
    if (user?.isDemoUser) return;
    try {
      await api.delete(`/auth/sessions/${id}`);
      fetchSessions();
    } catch (e) {
      console.error('Failed to revoke session', e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSaveMessage(null);
  };

  const handleSaveChanges = async () => {
    if (user?.isDemoUser) {
      setSaveMessage({ type: 'error', text: 'Some information may be read-only in demo mode.' });
      return;
    }

    try {
      setIsSaving(true);
      setSaveMessage(null);
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        timezone: formData.timezone,
        language: formData.language
      });
      if (formData.language !== language) {
        setLanguage(formData.language as 'en' | 'hi');
      }
      setSaveMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (error: any) {
      setSaveMessage({ type: 'error', text: error.userMessage || 'Unable to save changes. Try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const formatRole = (role: string) => role?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';

  const tabs = [
    { id: 'personal', label: 'Personal Information', icon: UserIcon },
    { id: 'security', label: 'Security Settings', icon: ShieldAlert },
    { id: 'preferences', label: 'Preferences', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'activity', label: 'Account Activity', icon: FileText },
  ];

  const hasChanges = 
    formData.firstName !== (user?.firstName || '') ||
    formData.lastName !== (user?.lastName || '') ||
    formData.phone !== ((user as any)?.phone || '') ||
    formData.timezone !== ((user as any)?.timezone || 'UTC') ||
    formData.language !== ((user as any)?.language || language || 'en');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center text-sm font-medium text-text-muted">
          <span>TrackSentra SOC</span>
          <ChevronRight size={14} className="mx-1" />
          <span className="text-emerald-400">Profile & Settings</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-sidebar border border-border-subtle flex items-center justify-center text-emerald-500 shadow-inner">
            <UserIcon size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-main">Profile & Settings</h1>
            <p className="text-text-muted text-sm mt-1">Manage your personal information, account settings and preferences.</p>
          </div>
        </div>
      </div>

      {/* Profile Summary Card */}
      <div className="bg-[#0f1715] border border-border-subtle rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-linear-to-r from-emerald-500/5 to-transparent pointer-events-none"></div>
        
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#090e0c] border border-border-subtle flex items-center justify-center text-4xl sm:text-5xl font-bold text-emerald-400 shadow-inner">
            {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
          <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-surface-main border border-border-subtle flex items-center justify-center text-text-muted hover:text-emerald-400 hover:border-emerald-500/30 transition-colors shadow-lg">
            <Camera size={14} />
          </button>
        </div>

        {/* User Details */}
        <div className="flex-1 text-center sm:text-left min-w-0 flex flex-col justify-center h-full">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-main truncate">
              {user?.firstName} {user?.lastName}
            </h2>
            <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
              {formatRole(user?.role || '')}
            </span>
          </div>
          
          <div className="space-y-2 text-sm text-text-muted">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Mail size={14} className="opacity-70" />
              <span className="truncate">{user?.email}</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Shield size={14} className="opacity-70" />
              <span className="truncate">{(user as any)?.companyName || 'TrackSentra Demo Corp'}</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Globe size={14} className="opacity-70" />
              <span>Timezone: {(user as any)?.timezone || 'UTC'}</span>
            </div>
          </div>
        </div>

        {/* Status and Action */}
        <div className="flex flex-col items-center sm:items-end justify-between h-full min-w-50 shrink-0 border-t sm:border-t-0 sm:border-l border-border-subtle pt-6 sm:pt-0 sm:pl-6">
          <div className="w-full flex sm:flex-col justify-between items-center sm:items-end gap-4 mb-4 sm:mb-0">
            <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20 border border-emerald-400/20">
              <Camera size={14} /> Edit Profile
            </button>
          </div>
          
          <div className="space-y-3 w-full sm:text-right mt-auto pt-2">
            <div>
              <p className="text-[11px] text-text-muted uppercase tracking-wider font-semibold mb-1">Account Status</p>
              <div className="flex items-center sm:justify-end gap-1.5 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-emerald-400 capitalize">{(user as any)?.status || 'Active'}</span>
              </div>
            </div>
            <div>
              <p className="text-[11px] text-text-muted uppercase tracking-wider font-semibold mb-1 flex items-center justify-center sm:justify-end gap-1"><Calendar size={12}/> Last Login</p>
              <p className="text-sm text-text-main font-medium">{new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border-subtle overflow-x-auto no-scrollbar">
        <div className="flex gap-6 min-w-max px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 text-sm font-semibold transition-colors relative ${isActive ? 'text-emerald-400' : 'text-text-muted hover:text-text-main'}`}
              >
                <Icon size={16} />
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 shadow-[0_-2px_10px_rgba(16,185,129,0.5)]"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Main Tab Content) */}
        <div className="lg:col-span-2 space-y-6">
          {/* PERSONAL INFORMATION TAB */}
          {activeTab === 'personal' && (
            <div className="bg-[#0f1715] border border-border-subtle rounded-2xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-border-subtle bg-surface-sidebar/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <UserIcon size={16} className="text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-main">Personal Information</h3>
                    <p className="text-sm text-text-muted mt-0.5">Update your personal details and contact information.</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-main block">First Name</label>
                    <input 
                      type="text" 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full bg-[#090e0c] border border-border-subtle rounded-lg px-4 py-2.5 text-sm text-text-main focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors placeholder:text-text-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-main block">Last Name</label>
                    <input 
                      type="text" 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full bg-[#090e0c] border border-border-subtle rounded-lg px-4 py-2.5 text-sm text-text-main focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-main block">Email Address</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      disabled
                      className="w-full bg-surface-main border border-border-subtle rounded-lg px-4 py-2.5 text-sm text-text-muted cursor-not-allowed opacity-70"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-main block">Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#090e0c] border border-border-subtle rounded-lg px-4 py-2.5 text-sm text-text-main focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-main block">Language / भाषा</label>
                    <div className="relative">
                      <select 
                        name="language"
                        value={formData.language}
                        onChange={handleInputChange}
                        className="w-full appearance-none bg-[#090e0c] border border-border-subtle rounded-lg px-4 py-2.5 text-sm text-text-main focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors pr-10"
                      >
                        <option value="en">English</option>
                        <option value="hi">हिंदी</option>
                      </select>
                      <ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none rotate-90" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-main block">Timezone</label>
                    <div className="relative">
                      <select 
                        name="timezone"
                        value={formData.timezone}
                        onChange={handleInputChange}
                        className="w-full appearance-none bg-[#090e0c] border border-border-subtle rounded-lg px-4 py-2.5 text-sm text-text-main focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors pr-10"
                      >
                        <option value="UTC">UTC (Coordinated Universal Time)</option>
                        <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                        <option value="America/New_York">America/New_York (EST)</option>
                        <option value="Europe/London">Europe/London (GMT)</option>
                      </select>
                      <ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none rotate-90" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border-subtle bg-surface-sidebar/30 flex items-center justify-between">
                <div>
                  {saveMessage && (
                    <p className={`text-sm font-medium ${saveMessage.type === 'success' ? 'text-emerald-400' : 'text-danger'}`}>
                      {saveMessage.text}
                    </p>
                  )}
                  {!saveMessage && user?.isDemoUser && (
                    <p className="text-sm text-text-muted">Some information may be read-only in demo mode.</p>
                  )}
                </div>
                <button 
                  onClick={handleSaveChanges}
                  disabled={isSaving || (!hasChanges && !saveMessage)}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${isSaving || (!hasChanges && !saveMessage) ? 'bg-surface-hover text-text-muted cursor-not-allowed' : 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/20'}`}
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* SECURITY SETTINGS TAB */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-[#0f1715] border border-border-subtle rounded-2xl overflow-hidden shadow-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Key size={16} className="text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-main">Change Password</h3>
                    <p className="text-sm text-text-muted">Update your password to keep your account secure.</p>
                  </div>
                </div>
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-main block">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-[#090e0c] border border-border-subtle rounded-lg px-4 py-2.5 text-sm text-text-main focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-main block">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-[#090e0c] border border-border-subtle rounded-lg px-4 py-2.5 text-sm text-text-main focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" />
                  </div>
                  <button className="px-6 py-2.5 bg-surface-main border border-border-subtle hover:border-emerald-500/50 hover:text-emerald-400 rounded-lg text-sm font-bold transition-colors">
                    Update Password
                  </button>
                </div>
              </div>

              <div className="bg-[#0f1715] border border-border-subtle rounded-2xl overflow-hidden shadow-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Monitor size={16} className="text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-main">Active Sessions</h3>
                    <p className="text-sm text-text-muted">Manage your active sessions across devices.</p>
                  </div>
                </div>

                {loadingSessions ? (
                  <div className="flex justify-center p-8"><Loader2 className="animate-spin text-emerald-500" /></div>
                ) : (
                  <div className="space-y-3">
                    {sessions.map(s => (
                      <div key={s.id} className="flex items-center justify-between p-4 bg-[#090e0c] border border-border-subtle rounded-xl hover:border-border-hover transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${s.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-surface-hover text-text-muted'}`}>
                            <Globe size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-text-main">Web Session {s.isActive ? '(Current)' : ''}</p>
                            <p className="text-xs text-text-muted mt-0.5">Started {new Date(s.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {s.isActive && (
                          <button onClick={() => handleRevokeSession(s.id)} className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors" title="Revoke Session">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    {sessions.length === 0 && <p className="text-sm text-text-muted text-center py-4">No active sessions found.</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ACTIVITY TAB */}
          {activeTab === 'activity' && (
            <div className="bg-[#0f1715] border border-border-subtle rounded-2xl overflow-hidden shadow-xl p-6">
               <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <FileText size={16} className="text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-text-main">Account Activity</h3>
                      <p className="text-sm text-text-muted">Recent security events and actions.</p>
                    </div>
                  </div>
               </div>

               {loadingActivities ? (
                  <div className="flex justify-center p-8"><Loader2 className="animate-spin text-emerald-500" /></div>
                ) : (
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-border-subtle before:to-transparent">
                    {activities.map((act, i) => (
                      <div key={act._id || i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                         <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0f1715] bg-surface-main text-emerald-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            <Check size={14} />
                         </div>
                         <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border-subtle bg-[#090e0c] shadow-sm">
                            <div className="flex items-center justify-between space-x-2 mb-1">
                               <div className="font-bold text-sm text-text-main capitalize">{act.action.replace(/_/g, ' ').toLowerCase()}</div>
                               <time className="text-xs font-medium text-text-muted">{new Date(act.createdAt).toLocaleDateString()}</time>
                            </div>
                            <div className="text-sm text-text-secondary">
                               {typeof act.details === 'object' ? JSON.stringify(act.details) : (act.details || `Performed action on ${act.resource}`)}
                            </div>
                         </div>
                      </div>
                    ))}
                    {activities.length === 0 && <p className="text-sm text-text-muted text-center py-4">No recent activity.</p>}
                  </div>
                )}
            </div>
          )}

          {/* OTHER TABS PLACEHOLDERS */}
          {(activeTab === 'preferences' || activeTab === 'notifications') && (
            <div className="bg-[#0f1715] border border-border-subtle rounded-2xl p-12 text-center shadow-xl">
              <div className="w-16 h-16 rounded-full bg-surface-main border border-border-subtle mx-auto mb-4 flex items-center justify-center">
                 {activeTab === 'preferences' ? <Globe size={24} className="text-emerald-500 opacity-50" /> : <Bell size={24} className="text-emerald-500 opacity-50" />}
              </div>
              <h3 className="text-lg font-bold text-text-main capitalize mb-2">{activeTab}</h3>
              <p className="text-text-muted text-sm max-w-sm mx-auto">This section is currently under development. Preferences will be managed via the application settings soon.</p>
            </div>
          )}
        </div>

        {/* Right Column (Sidebar Cards) */}
        <div className="space-y-6">
          {/* Role & Permissions Card */}
          <div className="bg-[#0f1715] border border-border-subtle rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
               <Shield size={100} />
            </div>
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Shield size={16} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-main leading-tight">Role & Permissions</h3>
                <p className="text-xs text-text-muted mt-0.5">Your role and access permissions.</p>
              </div>
            </div>

            <div className="bg-[#15201d] border border-emerald-500/20 rounded-xl p-4 mb-6 relative z-10">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-yellow-500">👑</span>
                <span className="font-bold text-text-main text-sm">{formatRole(user?.role || '')}</span>
              </div>
              <p className="text-xs text-text-muted pl-8 leading-relaxed">
                {user?.role === 'SUPER_ADMIN' ? 'Full administrative access to the platform.' : 
                 user?.role === 'COMPANY_ADMIN' ? 'Full access to all company features and settings.' : 
                 'Limited access based on role assignments.'}
              </p>
            </div>

            <div className="relative z-10">
              <h4 className="text-xs font-bold text-emerald-500 mb-3 uppercase tracking-wider">Key Permissions</h4>
              <ul className="grid grid-cols-1 gap-2.5">
                {['Manage company settings', 'View reports and analytics', 'Manage sites, guards and patrols', 'Manage users and roles'].map((perm, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-text-secondary">
                    <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-tight">{perm}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Demo Mode Alert Card */}
          {user?.isDemoUser && (
            <div className="bg-surface-main border border-border-subtle rounded-2xl p-6 shadow-xl">
               <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-surface-sidebar border border-border-subtle flex items-center justify-center">
                  <Monitor size={16} className="text-text-muted" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-main leading-tight">Demo Mode</h3>
                  <p className="text-xs text-text-muted mt-0.5">You are currently using simulated demo data.</p>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex gap-3">
                 <ShieldAlert size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                 <div>
                    <h4 className="text-sm font-bold text-yellow-500 mb-1">Demo Mode Active</h4>
                    <p className="text-xs text-yellow-500/80 leading-relaxed">This is a read-only demonstration environment with simulated data.</p>
                 </div>
              </div>
            </div>
          )}

          {/* Sign Out Card */}
          <div className="bg-[#0f1715] border border-border-subtle rounded-2xl p-6 shadow-xl">
            <button 
              onClick={logout}
              className="w-full h-12 rounded-xl bg-danger/10 border border-danger/20 text-danger font-bold text-sm flex items-center justify-center gap-2 hover:bg-danger/20 transition-all"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
