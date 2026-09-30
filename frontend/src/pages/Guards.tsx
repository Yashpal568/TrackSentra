import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Users, Mail, Phone, Badge as BadgeIcon, Plus, UserPlus, MoreVertical, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

export const Guards = () => {
  const { user } = useAuthStore();
  const [guards, setGuards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ 
    firstName: '', lastName: '', email: '', employeeId: '', phone: '' 
  });

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 size={16} className="text-green-600" />;
      case 'invited': return <Clock size={16} className="text-yellow-600" />;
      default: return <ShieldAlert size={16} className="text-red-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': 
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">{getStatusIcon(status)} Active</span>;
      case 'invited': 
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">{getStatusIcon(status)} Invited</span>;
      default: 
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">{getStatusIcon(status)} Inactive</span>;
    }
  };

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
            <Users className="text-blue-600" /> Security Personnel
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage security guards, view statuses, and onboard new personnel.</p>
        </div>
        {canManage && !isCreating && (
          <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
            <UserPlus size={18} /> Onboard Guard
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
            <h2 className="text-lg font-bold text-slate-800">Onboard New Guard</h2>
            <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600">
              <span className="sr-only">Close</span>
              &times;
            </button>
          </div>
          <form onSubmit={handleCreate} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">First Name <span className="text-red-500">*</span></label>
                <input type="text" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 border" placeholder="John" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                <input type="text" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 border" placeholder="Doe" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 border" placeholder="john.doe@example.com" />
                <p className="text-sm text-slate-500 mt-2 flex items-center gap-1"><Mail size={14}/> An activation link will be sent to this email.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Employee ID</label>
                <input type="text" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 border" placeholder="EMP-12345" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 border" placeholder="+1 (555) 000-0000" />
              </div>
            </div>
            <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100">
              <Button type="submit" className="flex items-center gap-2"><Plus size={16}/> Onboard Guard</Button>
              <Button type="button" variant="secondary" onClick={() => setIsCreating(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Empty State */}
      {guards.length === 0 && !isCreating ? (
        <Card className="text-center py-16 px-6 border-dashed border-2 border-slate-200 bg-slate-50">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Security Personnel</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">Your organization has not onboarded any guards yet. Onboard your first guard to start assigning patrols.</p>
          {canManage && <Button onClick={() => setIsCreating(true)}>Onboard First Guard</Button>}
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {guards.map(guard => (
            <Card key={guard._id} className="group hover:shadow-md transition-all overflow-hidden flex flex-col bg-white">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg">
                      {guard.userId?.firstName?.charAt(0)}{guard.userId?.lastName?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg leading-tight">{guard.userId?.firstName} {guard.userId?.lastName}</h3>
                      <div className="mt-1">{getStatusBadge(guard.status)}</div>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical size={20} />
                  </button>
                </div>
                
                <div className="space-y-2 mt-6">
                  <div className="flex items-center text-sm text-slate-600">
                    <Mail className="w-4 h-4 mr-3 text-slate-400" />
                    <span className="truncate">{guard.userId?.email}</span>
                  </div>
                  {guard.phone && (
                    <div className="flex items-center text-sm text-slate-600">
                      <Phone className="w-4 h-4 mr-3 text-slate-400" />
                      {guard.phone}
                    </div>
                  )}
                  {guard.employeeId && (
                    <div className="flex items-center text-sm text-slate-600">
                      <BadgeIcon className="w-4 h-4 mr-3 text-slate-400" />
                      ID: {guard.employeeId}
                    </div>
                  )}
                </div>
              </div>
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Guard Profile</span>
                <button className="text-sm font-semibold text-blue-600 hover:text-blue-800">View Details</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
