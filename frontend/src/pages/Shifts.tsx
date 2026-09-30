import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const Shifts = () => {
  const { user } = useAuthStore();
  const [shifts, setShifts] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [guards, setGuards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
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
      // Simple reload for now instead of complex manual populate
      fetchData();
      setIsCreating(false);
      setFormData({ siteId: '', guardId: '', startTime: '', endTime: '', notes: '' });
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create shift.');
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this shift?')) return;
    try {
      await api.delete(`/shifts/${id}`);
      fetchData();
    } catch (err) {
      setError('Failed to cancel shift.');
    }
  };

  const canManage = ['SUPER_ADMIN', 'COMPANY_ADMIN', 'SITE_MANAGER', 'SECURITY_SUPERVISOR'].includes(user?.role || '');

  if (loading) return <div className="p-8">Loading schedule...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Shift Schedule</h1>
        {canManage && !isCreating && (
          <Button onClick={() => setIsCreating(true)}>Schedule Shift</Button>
        )}
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded">{error}</div>}

      {isCreating && (
        <Card className="mb-6">
          <h2 className="text-lg font-medium mb-4">Schedule New Shift</h2>
          <form onSubmit={handleCreate} className="space-y-4 grid grid-cols-2 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium">Site</label>
              <select required value={formData.siteId} onChange={e => setFormData({...formData, siteId: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2">
                <option value="">Select a site</option>
                {sites.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium">Guard</label>
              <select required value={formData.guardId} onChange={e => setFormData({...formData, guardId: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2">
                <option value="">Select a guard</option>
                {guards.map(g => <option key={g._id} value={g._id}>{g.userId?.firstName} {g.userId?.lastName}</option>)}
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium">Start Time</label>
              <input type="datetime-local" required value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2" />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium">End Time</label>
              <input type="datetime-local" required value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">Notes</label>
              <input type="text" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2" />
            </div>
            <div className="col-span-2 flex gap-2 mt-4">
              <Button type="submit">Schedule Shift</Button>
              <Button variant="secondary" onClick={() => setIsCreating(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {shifts.length === 0 && !isCreating ? (
        <Card className="text-center text-gray-500 py-12">No shifts scheduled.</Card>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guard</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Site</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {shifts.map(shift => (
                <tr key={shift._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{shift.guardId?.userId?.firstName} {shift.guardId?.userId?.lastName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{shift.siteId?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(shift.startTime).toLocaleString()} - {new Date(shift.endTime).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${shift.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : shift.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {shift.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {canManage && shift.status === 'scheduled' && (
                      <button onClick={() => handleCancel(shift._id)} className="text-red-600 hover:text-red-900">Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
