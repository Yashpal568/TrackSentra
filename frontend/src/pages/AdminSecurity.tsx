import { useState } from 'react';
import { Shield, Key, Globe, Lock, AlertTriangle, Fingerprint } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function AdminSecurity() {
  const [mfaEnforced, setMfaEnforced] = useState(false);
  const [ipRestriction, setIpRestriction] = useState(false);
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-main tracking-tight">Platform Security</h1>
          <p className="text-text-secondary mt-1">Global security controls, authentication policies, and threat protection.</p>
        </div>
        <Button className="bg-emerald-primary text-background hover:bg-emerald-hover">
          Save Configuration
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-card border border-border-subtle rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border-subtle bg-surface-main/50">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Fingerprint className="text-emerald-500" size={20} /> Authentication Policies
              </h2>
            </div>
            <div className="p-6 space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-text-main">Enforce Global 2FA</h3>
                  <p className="text-xs text-text-muted mt-1 max-w-md">Require all Company Admins and Super Admins to use Two-Factor Authentication.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={mfaEnforced} onChange={() => setMfaEnforced(!mfaEnforced)} />
                  <div className="w-11 h-6 bg-surface-main rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-muted after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-white"></div>
                </label>
              </div>

              <div className="h-px bg-border-subtle w-full"></div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-text-main">Session Timeout</h3>
                  <p className="text-xs text-text-muted mt-1 max-w-md">Automatically log users out after a period of inactivity.</p>
                </div>
                <select className="bg-surface-main border border-border-subtle p-2 rounded-lg text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                  <option>15 minutes</option>
                  <option>30 minutes</option>
                  <option>1 hour</option>
                  <option>4 hours</option>
                </select>
              </div>

              <div className="h-px bg-border-subtle w-full"></div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-text-main">Password Complexity</h3>
                  <p className="text-xs text-text-muted mt-1 max-w-md">Minimum requirements for user passwords.</p>
                </div>
                <div className="text-right text-xs font-bold text-emerald-400">
                  Strict (12+ chars, special)
                </div>
              </div>

            </div>
          </div>

          <div className="bg-surface-card border border-border-subtle rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border-subtle bg-surface-main/50">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Globe className="text-blue-500" size={20} /> Network Controls
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-text-main">Super Admin IP Whitelisting</h3>
                  <p className="text-xs text-text-muted mt-1 max-w-md">Only allow Super Admin logins from trusted IP ranges.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={ipRestriction} onChange={() => setIpRestriction(!ipRestriction)} />
                  <div className="w-11 h-6 bg-surface-main rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-muted after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 peer-checked:after:bg-white"></div>
                </label>
              </div>
              
              {ipRestriction && (
                <div className="p-4 bg-surface-main rounded-xl border border-border-subtle">
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Allowed CIDR Blocks</label>
                  <textarea 
                    className="w-full bg-surface-sidebar border border-border-subtle p-3 rounded-lg text-white font-mono text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                    rows={3} 
                    placeholder="e.g. 192.168.1.0/24"
                    defaultValue="203.0.113.0/24"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Sidebar */}
        <div className="space-y-6">
          <div className="bg-surface-card border border-border-subtle rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-text-main uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield className="text-emerald-500" size={16} /> Security Posture
            </h3>
            
            <div className="flex justify-center mb-6">
              <div className="w-32 h-32 rounded-full border-8 border-emerald-500/20 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border-8 border-emerald-500 border-t-transparent -rotate-45"></div>
                <div className="text-center">
                  <span className="text-3xl font-black text-white">A+</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-text-secondary flex items-center gap-1.5"><Lock size={12}/> TLS 1.3</span>
                <span className="text-emerald-400">Active</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-text-secondary flex items-center gap-1.5"><Key size={12}/> Encryption at Rest</span>
                <span className="text-emerald-400">AES-256</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-text-secondary flex items-center gap-1.5"><AlertTriangle size={12}/> Recent Threats</span>
                <span className="text-text-muted">0 blocked</span>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
