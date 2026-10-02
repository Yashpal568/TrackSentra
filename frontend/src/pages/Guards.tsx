import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Badge } from '../components/ui/Badge';
import { Users, Mail, Phone, Badge as BadgeIcon, Plus, UserPlus, MoreVertical, ShieldAlert, CheckCircle2, Clock, X, ShieldCheck } from 'lucide-react';

export const Guards = () => {
  const { user } = useAuthStore();
  const [guards, setGuards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ 
    firstName: '', lastName: '', email: '', employeeId: '', phone: '' 
  });

  const [selectedGuard, setSelectedGuard] = useState<any>(null);

  useEffect(() => {
    fetchGuards();
  }, []);

  const fetchGuards = async () => {
    try {
      const res = await api.get('/guards');
      setGuards(res.data.guards);
    } catch (err) {
      setError('Failed to load guards.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/guards', formData);
      setGuards([res.data.guard, ...guards]);
      setIsCreating(false);
      setFormData({ firstName: '', lastName: '', email: '', employeeId: '', phone: '' });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create guard.');
    }
  };

  const canManage = ['SUPER_ADMIN', 'COMPANY_ADMIN', 'SITE_MANAGER'].includes(user?.role || '');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': 
        return <Badge variant="success" className="uppercase tracking-wider"><CheckCircle2 size={12} className="mr-1" /> Active</Badge>;
      case 'invited': 
        return <Badge variant="warning" className="uppercase tracking-wider"><Clock size={12} className="mr-1" /> Invited</Badge>;
      default: 
        return <Badge variant="destructive" className="uppercase tracking-wider"><ShieldAlert size={12} className="mr-1" /> Inactive</Badge>;
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-primary"></div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <Users className="text-emerald-primary" /> Security Personnel
          </h1>
          <p className="text-text-secondary text-sm mt-1">Manage security guards, view statuses, and onboard new personnel.</p>
        </div>
        {canManage && !isCreating && (
          <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2 shadow-lg">
            <UserPlus size={18} /> Onboard Guard
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-danger/10 text-danger border border-danger/30 rounded-lg flex items-center gap-3">
          <ShieldAlert size={20} /> {error}
        </div>
      )}

      {/* Creation Form */}
      {isCreating && (
        <Card className="border-t-4 border-t-emerald-primary shadow-xl bg-surface-card animate-in slide-in-from-top-4">
          <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-sidebar">
            <h2 className="text-lg font-bold text-text-main flex items-center gap-2"><UserPlus size={18} className="text-emerald-primary"/> Onboard New Guard</h2>
            <button onClick={() => setIsCreating(false)} className="text-text-muted hover:text-emerald-primary transition-colors">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleCreate} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="mb-2">First Name <span className="text-danger">*</span></Label>
                <Input type="text" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="John" />
              </div>
              <div>
                <Label className="mb-2">Last Name <span className="text-danger">*</span></Label>
                <Input type="text" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="Doe" />
              </div>
              <div className="md:col-span-2">
                <Label className="mb-2">Email Address <span className="text-danger">*</span></Label>
                <Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john.doe@example.com" />
                <p className="text-sm text-text-secondary mt-2 flex items-center gap-1"><Mail size={14}/> An activation link will be sent to this email.</p>
              </div>
              <div>
                <Label className="mb-2">Employee ID</Label>
                <Input type="text" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} placeholder="EMP-12345" />
              </div>
              <div>
                <Label className="mb-2">Phone Number</Label>
                <Input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 (555) 000-0000" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border-subtle">
              <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button type="submit" className="flex items-center gap-2"><Plus size={16}/> Onboard Guard</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Empty State */}
      {guards.length === 0 && !isCreating ? (
        <Card className="text-center py-16 px-6 border-dashed border-2 border-border-subtle bg-surface-main">
          <div className="w-16 h-16 bg-surface-card rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-border-subtle">
            <Users className="w-8 h-8 text-text-muted" />
          </div>
          <h3 className="text-lg font-bold text-text-main mb-2">No Security Personnel</h3>
          <p className="text-text-secondary max-w-md mx-auto mb-6">Your organization has not onboarded any guards yet. Onboard your first guard to start assigning patrols.</p>
          {canManage && <Button onClick={() => setIsCreating(true)}>Onboard First Guard</Button>}
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {guards.map(guard => (
            <Card key={guard._id} className="group hover:border-emerald-primary/40 transition-colors overflow-hidden flex flex-col bg-surface-card relative">
              {guard.status === 'active' && <div className="absolute top-0 left-0 w-1 h-full bg-emerald-primary"></div>}
              {guard.status === 'invited' && <div className="absolute top-0 left-0 w-1 h-full bg-warning"></div>}
              {guard.status !== 'active' && guard.status !== 'invited' && <div className="absolute top-0 left-0 w-1 h-full bg-danger"></div>}
              
              <div className="p-6 flex-1 pl-7">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-surface-main border border-border-subtle flex items-center justify-center text-emerald-primary font-black text-lg shadow-inner">
                      {guard.userId?.firstName?.charAt(0)}{guard.userId?.lastName?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-text-main text-lg leading-tight">{guard.userId?.firstName} {guard.userId?.lastName}</h3>
                      <div className="mt-1.5">{getStatusBadge(guard.status)}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedGuard(guard)}
                    className="text-text-muted hover:text-emerald-primary transition-colors p-1"
                    title="More Options"
                  >
                    <MoreVertical size={20} />
                  </button>
                </div>
                
                <div className="space-y-3 mt-6 bg-surface-main p-4 rounded-lg border border-border-subtle">
                  <div className="flex items-center text-sm text-text-secondary">
                    <Mail className="w-4 h-4 mr-3 text-text-muted shrink-0" />
                    <span className="truncate">{guard.userId?.email}</span>
                  </div>
                  {guard.phone && (
                    <div className="flex items-center text-sm text-text-secondary">
                      <Phone className="w-4 h-4 mr-3 text-text-muted shrink-0" />
                      {guard.phone}
                    </div>
                  )}
                  {guard.employeeId && (
                    <div className="flex items-center text-sm text-text-secondary font-mono">
                      <BadgeIcon className="w-4 h-4 mr-3 text-text-muted shrink-0" />
                      ID: {guard.employeeId}
                    </div>
                  )}
                </div>
              </div>
              <div className="px-6 py-3 bg-surface-sidebar border-t border-border-subtle flex justify-between items-center pl-7">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Guard Profile</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-emerald-primary hover:text-emerald-hover hover:bg-emerald-primary/10 -mr-2"
                  onClick={() => setSelectedGuard(guard)}
                >
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* View Details Modal Overlay */}
      {selectedGuard && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <Card className="w-full max-w-lg bg-surface-card border-border-subtle shadow-2xl animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-sidebar">
              <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
                <ShieldCheck className="text-emerald-primary" /> Guard Details
              </h2>
              <button onClick={() => setSelectedGuard(null)} className="text-text-muted hover:text-text-main transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-2xl bg-surface-main border border-border-subtle flex items-center justify-center text-emerald-primary font-black text-2xl shadow-inner">
                  {selectedGuard.userId?.firstName?.charAt(0)}{selectedGuard.userId?.lastName?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-text-main mb-1">{selectedGuard.userId?.firstName} {selectedGuard.userId?.lastName}</h3>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedGuard.status)}
                    <span className="text-xs text-text-secondary font-mono bg-surface-main px-2 py-1 rounded border border-border-subtle">
                      ID: {selectedGuard.employeeId || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-3 gap-4 border-b border-border-subtle pb-4">
                  <div className="text-sm font-bold text-text-muted uppercase">Email Address</div>
                  <div className="col-span-2 text-sm text-text-main font-medium">{selectedGuard.userId?.email}</div>
                </div>
                <div className="grid grid-cols-3 gap-4 border-b border-border-subtle pb-4">
                  <div className="text-sm font-bold text-text-muted uppercase">Phone Number</div>
                  <div className="col-span-2 text-sm text-text-main font-medium">{selectedGuard.phone || 'Not provided'}</div>
                </div>
                <div className="grid grid-cols-3 gap-4 border-b border-border-subtle pb-4">
                  <div className="text-sm font-bold text-text-muted uppercase">Account ID</div>
                  <div className="col-span-2 text-sm text-text-main font-mono">{selectedGuard.userId?._id}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-sm font-bold text-text-muted uppercase">Joined At</div>
                  <div className="col-span-2 text-sm text-text-main font-medium">{new Date(selectedGuard.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="bg-info/10 border border-info/30 rounded-lg p-4 mb-2">
                <p className="text-sm text-info font-medium flex items-center gap-2">
                  <Clock size={16} /> Extended guard telemetry and shift history coming soon in M16.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border-subtle bg-surface-main flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedGuard(null)}>Close</Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
};
