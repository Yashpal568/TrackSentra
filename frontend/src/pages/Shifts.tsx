import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CalendarClock, Plus, ShieldAlert, CheckCircle2, Clock, XCircle, Search, Calendar, User, MapPin } from 'lucide-react';

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
      setError(err.response?.data?.error?.message || 'Failed to create shift.');
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
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800"><CheckCircle2 size={12}/> Completed</span>;
      case 'cancelled': 
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800"><XCircle size={12}/> Cancelled</span>;
      case 'scheduled':
      default: 
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800"><Clock size={12}/> Scheduled</span>;
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
            <CalendarClock className="text-orange-500" /> Shift Schedule
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage guard assignments and facility coverage hours.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search shifts..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-white w-full sm:w-64"
            />
          </div>
          {canManage && !isCreating && (
            <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 whitespace-nowrap">
              <Plus size={18} /> Schedule Shift
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-3">
          <ShieldAlert size={20} /> {error}
        </div>
      )}

      {/* Creation Form */}
      {isCreating && (
        <Card className="border-t-4 border-t-orange-500 shadow-lg">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="text-lg font-bold text-slate-800">Schedule New Shift</h2>
            <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600">
              <span className="sr-only">Close</span>
              &times;
            </button>
          </div>
          <form onSubmit={handleCreate} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Target Site <span className="text-red-500">*</span></label>
                <select required value={formData.siteId} onChange={e => setFormData({...formData, siteId: e.target.value})} className="w-full rounded-md border-slate-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-4 py-2 border bg-white">
                  <option value="">Select a site</option>
                  {sites.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Assigned Guard <span className="text-red-500">*</span></label>
                <select required value={formData.guardId} onChange={e => setFormData({...formData, guardId: e.target.value})} className="w-full rounded-md border-slate-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-4 py-2 border bg-white">
                  <option value="">Select a guard</option>
                  {guards.map(g => <option key={g._id} value={g._id}>{g.userId?.firstName} {g.userId?.lastName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Start Time <span className="text-red-500">*</span></label>
                <input type="datetime-local" required value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full rounded-md border-slate-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-4 py-2 border" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">End Time <span className="text-red-500">*</span></label>
                <input type="datetime-local" required value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full rounded-md border-slate-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-4 py-2 border" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Shift Notes / Instructions</label>
                <input type="text" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full rounded-md border-slate-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-4 py-2 border" placeholder="e.g. Ensure perimeter check at 03:00 AM." />
              </div>
            </div>
            <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100">
              <Button type="submit" className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"><Plus size={16}/> Schedule Shift</Button>
              <Button type="button" variant="secondary" onClick={() => setIsCreating(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Empty State */}
      {shifts.length === 0 && !isCreating ? (
        <Card className="text-center py-16 px-6 border-dashed border-2 border-slate-200 bg-slate-50">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
            <CalendarClock className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Shifts Scheduled</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">Schedule shifts to assign guards to specific sites and ensure facility coverage.</p>
          {canManage && <Button onClick={() => setIsCreating(true)} className="bg-orange-600 hover:bg-orange-700">Schedule First Shift</Button>}
        </Card>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Assigned Guard</th>
                  <th className="px-6 py-4">Facility / Site</th>
                  <th className="px-6 py-4">Time Window</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredShifts.map(shift => (
                  <tr key={shift._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                          {shift.guardId?.userId?.firstName?.charAt(0)}{shift.guardId?.userId?.lastName?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{shift.guardId?.userId?.firstName} {shift.guardId?.userId?.lastName}</div>
                          <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5"><User size={12}/> Guard</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <MapPin size={16} className="text-slate-400" />
                        {shift.siteId?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Calendar size={16} className="text-slate-400 shrink-0" />
                        <div>
                          <div className="font-medium">{new Date(shift.startTime).toLocaleDateString()}</div>
                          <div className="text-xs text-slate-500">{new Date(shift.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(shift.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(shift.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {canManage && shift.status === 'scheduled' && (
                        <button onClick={() => handleCancel(shift._id)} className="text-sm font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded transition-colors">
                          Cancel Shift
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
