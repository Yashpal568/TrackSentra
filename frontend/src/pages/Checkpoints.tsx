import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { QRCodeCanvas } from 'qrcode.react';

export const Checkpoints = () => {
  const { user } = useAuthStore();
  const [checkpoints, setCheckpoints] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ siteId: '', name: '', latitude: '', longitude: '', radius: '50', notes: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cpRes, sitesRes] = await Promise.all([
        api.get('/checkpoints'),
        api.get('/sites')
      ]);
      setCheckpoints(cpRes.data.checkpoints);
      setSites(sitesRes.data.sites);
    } catch (err) {
      setError('Failed to load checkpoints.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        siteId: formData.siteId,
        name: formData.name,
      };
      if (formData.latitude) payload.latitude = parseFloat(formData.latitude);
      if (formData.longitude) payload.longitude = parseFloat(formData.longitude);
      if (formData.radius) payload.radius = parseInt(formData.radius, 10);
      if (formData.notes) payload.notes = formData.notes;

      await api.post('/checkpoints', payload);
      fetchData();
      setIsCreating(false);
      setFormData({ siteId: '', name: '', latitude: '', longitude: '', radius: '50', notes: '' });
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create checkpoint.');
    }
  };

  const handleRegenerateQR = async (id: string) => {
    if (!window.confirm('Regenerate QR? The old QR code will become invalid immediately.')) return;
    try {
      await api.post(`/checkpoints/${id}/qr`);
      fetchData();
    } catch (err) {
      setError('Failed to regenerate QR.');
    }
  };

  const downloadQR = (checkpoint: any) => {
    const canvas = document.getElementById(`qr-${checkpoint._id}`) as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `QR_${checkpoint.name.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const canManage = ['SUPER_ADMIN', 'COMPANY_ADMIN', 'SITE_MANAGER'].includes(user?.role || '');

  if (loading) return <div className="p-8">Loading checkpoints...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Checkpoints & QR Codes</h1>
        {canManage && !isCreating && (
          <Button onClick={() => setIsCreating(true)}>Add Checkpoint</Button>
        )}
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded">{error}</div>}

      {isCreating && (
        <Card className="mb-6">
          <h2 className="text-lg font-medium mb-4">Create New Checkpoint</h2>
          <form onSubmit={handleCreate} className="space-y-4 grid grid-cols-2 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium">Site</label>
              <select required value={formData.siteId} onChange={e => setFormData({...formData, siteId: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2">
                <option value="">Select a site</option>
                {sites.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium">Checkpoint Name</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2" />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium">Latitude (Optional)</label>
              <input type="number" step="any" value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2" />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium">Longitude (Optional)</label>
              <input type="number" step="any" value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2" />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium">Radius (meters)</label>
              <input type="number" min="5" value={formData.radius} onChange={e => setFormData({...formData, radius: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">Notes</label>
              <input type="text" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2" />
            </div>
            <div className="col-span-2 flex gap-2 mt-4">
              <Button type="submit">Create Checkpoint</Button>
              <Button variant="secondary" onClick={() => setIsCreating(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {checkpoints.map(cp => (
          <Card key={cp._id} className="flex flex-col items-center p-6">
            <h3 className="font-bold text-xl mb-1">{cp.name}</h3>
            <p className="text-sm text-gray-500 mb-6">Site ID: {cp.siteId}</p>
            
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-4">
              <QRCodeCanvas 
                id={`qr-${cp._id}`}
                value={cp.qrPayload} 
                size={160}
                level="H"
                includeMargin={true}
              />
            </div>
            
            <p className="text-xs text-gray-400 font-mono break-all text-center mb-6 px-4">
              {cp.qrPayload}
            </p>

            <div className="mt-auto flex flex-col w-full gap-2">
              <Button variant="secondary" className="w-full" onClick={() => downloadQR(cp)}>
                Download QR
              </Button>
              {canManage && (
                <button 
                  onClick={() => handleRegenerateQR(cp._id)} 
                  className="text-xs text-red-600 hover:text-red-800 py-2 border border-transparent hover:border-red-100 rounded"
                >
                  Regenerate QR Identity
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
