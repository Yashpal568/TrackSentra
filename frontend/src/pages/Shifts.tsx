import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Badge } from '../components/ui/Badge';
import { CalendarClock, Plus, ShieldAlert, CheckCircle2, Clock, XCircle, Search, Calendar, User, MapPin, X } from 'lucide-react';

export const Shifts = () => {
  const { user } = useAuthStore();
  const [shifts, setShifts] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [guards, setGuards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ siteId: '', guardId: '', startTime: '', endTime: '', notes: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [shiftsRes, sitesRes, guardsRes] = await Promise.all([
        api.get('/shifts'),
        api.get('/sites'),
        api.get('/guards')
      ]);
      setShifts(shiftsRes.data.shifts);
      setSites(sitesRes.data.sites);
      setGuards(guardsRes.data.guards);
    } catch (err) {
      setError('Failed to load scheduling data.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/shifts', {
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString()
      });
      fetchData();
      setIsCreating(false);
      setFormData({ siteId: '', guardId: '', startTime: '', endTime: '', notes: '' });
      setError('');
    } catch (err: any) {
      setError(err.userMessage || 'Failed to create shift.');
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled shift?')) return;
    try {
      await api.delete(`/shifts/${id}`);
      fetchData();
    } catch (err) {
      setError('Failed to cancel shift.');
    }
  };

  const canManage = ['SUPER_ADMIN', 'COMPANY_ADMIN', 'SITE_MANAGER', 'SECURITY_SUPERVISOR'].includes(user?.role || '');

  const filteredShifts = shifts.filter(shift => {
    const searchString = `${shift.guardId?.userId?.firstName} ${shift.guardId?.userId?.lastName} ${shift.siteId?.name}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed': 
        return <Badge variant="success" className="uppercase"><CheckCircle2 size={12} className="mr-1"/> Completed</Badge>;
      case 'cancelled': 
        return <Badge variant="destructive" className="uppercase"><XCircle size={12} className="mr-1"/> Cancelled</Badge>;
      case 'scheduled':
      default: 
        return <Badge variant="default" className="bg-blue-500/10 text-blue-400 border-blue-500/30 uppercase"><Clock size={12} className="mr-1"/> Scheduled</Badge>;
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-primary"></div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <CalendarClock className="text-warning" /> Shift Schedule
          </h1>
          <p className="text-text-secondary text-sm mt-1">Manage guard assignments and facility coverage hours.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <Input 
              type="text" 
              placeholder="Search shifts..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          {canManage && !isCreating && (
            <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2 whitespace-nowrap shadow-lg">
              <Plus size={18} /> Schedule Shift
            </Button>
          )}
        </div>
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
            <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
              <CalendarClock size={18} className="text-emerald-primary"/> Schedule New Shift
            </h2>
            <button onClick={() => setIsCreating(false)} className="text-text-muted hover:text-emerald-primary transition-colors">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleCreate} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="mb-2">Target Site <span className="text-danger">*</span></Label>
                <select required value={formData.siteId} onChange={e => setFormData({...formData, siteId: e.target.value})} className="flex h-10 w-full rounded-md border border-border-subtle bg-surface-main px-3 py-2 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-emerald-primary transition-colors">
                  <option value="">Select a site</option>
                  {sites.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <Label className="mb-2">Assigned Guard <span className="text-danger">*</span></Label>
                <select required value={formData.guardId} onChange={e => setFormData({...formData, guardId: e.target.value})} className="flex h-10 w-full rounded-md border border-border-subtle bg-surface-main px-3 py-2 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-emerald-primary transition-colors">
                  <option value="">Select a guard</option>
                  {guards.map(g => <option key={g._id} value={g._id}>{g.userId?.firstName} {g.userId?.lastName}</option>)}
                </select>
              </div>
              <div>
                <Label className="mb-2">Start Time <span className="text-danger">*</span></Label>
                <Input type="datetime-local" required value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
              </div>
              <div>
                <Label className="mb-2">End Time <span className="text-danger">*</span></Label>
                <Input type="datetime-local" required value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <Label className="mb-2">Shift Notes / Instructions</Label>
                <Input type="text" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="e.g. Ensure perimeter check at 03:00 AM." />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border-subtle">
              <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button type="submit" className="flex items-center gap-2"><Plus size={16}/> Schedule Shift</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Empty State */}
      {shifts.length === 0 && !isCreating ? (
        <Card className="text-center py-16 px-6 border-dashed border-2 border-border-subtle bg-surface-main">
          <div className="w-16 h-16 bg-surface-card rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-border-subtle">
            <CalendarClock className="w-8 h-8 text-text-muted" />
          </div>
          <h3 className="text-lg font-bold text-text-main mb-2">No Shifts Scheduled</h3>
          <p className="text-text-secondary max-w-md mx-auto mb-6">Schedule shifts to assign guards to specific sites and ensure facility coverage.</p>
          {canManage && <Button onClick={() => setIsCreating(true)}>Schedule First Shift</Button>}
        </Card>
      ) : (
        <Card className="bg-surface-card rounded-lg shadow-sm border border-border-subtle overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-sidebar border-b border-border-subtle text-xs font-bold text-text-muted uppercase tracking-wider">
                  <th className="px-6 py-4">Assigned Guard</th>
                  <th className="px-6 py-4">Facility / Site</th>
                  <th className="px-6 py-4">Time Window</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-sm">
                {filteredShifts.map(shift => (
                  <tr key={shift._id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-surface-main border border-border-subtle flex items-center justify-center text-emerald-primary font-black text-sm shrink-0 shadow-inner">
                          {shift.guardId?.userId?.firstName?.charAt(0)}{shift.guardId?.userId?.lastName?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-text-main text-base">{shift.guardId?.userId?.firstName} {shift.guardId?.userId?.lastName}</div>
                          <div className="text-text-secondary text-xs flex items-center gap-1 mt-1 font-medium"><User size={12}/> Guard</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-text-main font-medium">
                        <MapPin size={16} className="text-text-muted shrink-0" />
                        {shift.siteId?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-text-main">
                        <div className="w-8 h-8 rounded-full bg-surface-main border border-border-subtle flex justify-center items-center shrink-0">
                          <Calendar size={14} className="text-text-secondary" />
                        </div>
                        <div>
                          <div className="font-bold text-sm">{new Date(shift.startTime).toLocaleDateString()}</div>
                          <div className="text-xs text-text-secondary mt-0.5 font-medium">{new Date(shift.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(shift.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(shift.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {canManage && shift.status === 'scheduled' && (
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleCancel(shift._id)}
                          className="h-8"
                        >
                          Cancel Shift
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
