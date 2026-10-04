import { useState } from 'react';
import { Bell, Send, Megaphone, Users, Building2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function AdminNotifications() {
  const [sending, setSending] = useState(false);
  const [target, setTarget] = useState('all');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-main tracking-tight">Global Notifications</h1>
          <p className="text-text-secondary mt-1">Broadcast messages, maintenance alerts, and system announcements.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Composer */}
        <div className="lg:col-span-2">
          <div className="bg-surface-card border border-border-subtle rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border-subtle bg-surface-main/50">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Megaphone className="text-emerald-500" size={20} /> Compose Broadcast
              </h2>
            </div>
            <div className="p-6 space-y-6">
              
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Target Audience</label>
                <div className="flex gap-4">
                   <label className="flex items-center gap-2 cursor-pointer">
                     <input type="radio" name="target" value="all" checked={target === 'all'} onChange={(e) => setTarget(e.target.value)} className="accent-emerald-500" />
                     <span className="text-sm font-bold text-white flex items-center gap-1.5"><Globe size={14}/> All Users</span>
                   </label>
                   <label className="flex items-center gap-2 cursor-pointer">
                     <input type="radio" name="target" value="admins" checked={target === 'admins'} onChange={(e) => setTarget(e.target.value)} className="accent-emerald-500" />
                     <span className="text-sm font-bold text-white flex items-center gap-1.5"><Building2 size={14}/> Company Admins Only</span>
                   </label>
                   <label className="flex items-center gap-2 cursor-pointer">
                     <input type="radio" name="target" value="guards" checked={target === 'guards'} onChange={(e) => setTarget(e.target.value)} className="accent-emerald-500" />
                     <span className="text-sm font-bold text-white flex items-center gap-1.5"><Users size={14}/> Guards Only</span>
                   </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Notification Title</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-sidebar border border-border-subtle p-3 rounded-lg text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  placeholder="e.g. Scheduled Maintenance Notice"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Message Body</label>
                <textarea 
                  className="w-full bg-surface-sidebar border border-border-subtle p-3 rounded-lg text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  rows={5}
                  placeholder="Write your announcement here..."
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={() => { setSending(true); setTimeout(() => setSending(false), 1000); }} 
                  disabled={sending}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white border-0 transition-all"
                >
                  {sending ? <span className="animate-pulse">Sending Broadcast...</span> : <><Send size={16} className="mr-2" /> Send Notification</>}
                </Button>
              </div>

            </div>
          </div>
        </div>

        {/* History Sidebar */}
        <div className="space-y-6">
          <div className="bg-surface-card border border-border-subtle rounded-2xl p-0 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-border-subtle bg-surface-main/50">
               <h3 className="text-sm font-bold text-text-main uppercase tracking-wider flex items-center gap-2">
                 <Bell className="text-emerald-500" size={16} /> Recent Broadcasts
               </h3>
            </div>
            <div className="divide-y divide-border-subtle flex-1 overflow-y-auto">
               {[
                 { title: 'New Feature: AI Reports', date: 'Oct 1, 2026', target: 'All Users' },
                 { title: 'Server Maintenance', date: 'Sep 25, 2026', target: 'Company Admins' },
                 { title: 'Mobile App Update v2.1', date: 'Sep 10, 2026', target: 'Guards' },
               ].map((n, i) => (
                 <div key={i} className="p-4 hover:bg-surface-main/50 transition-colors">
                   <h4 className="text-sm font-bold text-white mb-1">{n.title}</h4>
                   <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-bold text-text-muted">
                      <span>{n.date}</span>
                      <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{n.target}</span>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}

// Needed to make Globe icon work since I forgot to import it in the top
import { Globe } from 'lucide-react';
