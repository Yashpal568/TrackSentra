import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { QRCodeCanvas } from 'qrcode.react';
import { QrCode, Plus, Download, RefreshCw, MapPin, Search, ShieldAlert, FileText } from 'lucide-react';

export const Checkpoints = () => {
  const { user } = useAuthStore();
  const [checkpoints, setCheckpoints] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
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
    if (!window.confirm('CRITICAL ACTION: Regenerating this QR code will instantly invalidate the existing physical QR code. Field guards will be unable to scan until the new code is printed and placed. Proceed?')) return;
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

  const filteredCheckpoints = checkpoints.filter(cp => 
    cp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    cp.qrPayload.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSiteName = (siteId: string) => {
    return sites.find(s => s._id === siteId)?.name || 'Unknown Site';
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
            <QrCode className="text-purple-600" /> Checkpoints & QR IDs
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage physical patrol checkpoints and generate their secure cryptographic QR codes.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search checkpoints..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 bg-white w-full sm:w-64"
            />
          </div>
          {canManage && !isCreating && (
            <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2 whitespace-nowrap bg-purple-600 hover:bg-purple-700">
              <Plus size={18} /> Add Checkpoint
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
        <Card className="border-t-4 border-t-purple-600 shadow-lg">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="text-lg font-bold text-slate-800">Register New Checkpoint</h2>
            <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600">
              <span className="sr-only">Close</span>
              &times;
            </button>
          </div>
          <form onSubmit={handleCreate} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Assigned Site <span className="text-red-500">*</span></label>
                <select required value={formData.siteId} onChange={e => setFormData({...formData, siteId: e.target.value})} className="w-full rounded-md border-slate-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 px-4 py-2 border bg-white">
                  <option value="">Select a site</option>
                  {sites.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Checkpoint Name <span className="text-red-500">*</span></label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full rounded-md border-slate-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 px-4 py-2 border" placeholder="e.g. North Gate Entrance" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Latitude (GPS)</label>
                <input type="number" step="any" value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} className="w-full rounded-md border-slate-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 px-4 py-2 border" placeholder="e.g. 40.7128" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Longitude (GPS)</label>
                <input type="number" step="any" value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} className="w-full rounded-md border-slate-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 px-4 py-2 border" placeholder="e.g. -74.0060" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Validation Radius (meters)</label>
                <input type="number" min="5" value={formData.radius} onChange={e => setFormData({...formData, radius: e.target.value})} className="w-full rounded-md border-slate-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 px-4 py-2 border" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Location Notes / Instructions</label>
                <input type="text" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full rounded-md border-slate-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 px-4 py-2 border" placeholder="e.g. Scan QR located behind the main front desk monitor." />
              </div>
            </div>
            <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100">
              <Button type="submit" className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"><Plus size={16}/> Register Checkpoint</Button>
              <Button type="button" variant="secondary" onClick={() => setIsCreating(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Empty State */}
      {checkpoints.length === 0 && !isCreating ? (
        <Card className="text-center py-16 px-6 border-dashed border-2 border-slate-200 bg-slate-50">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
            <QrCode className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Checkpoints Generated</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">Create checkpoints within your sites to generate secure, cryptographic QR codes for guard patrols.</p>
          {canManage && <Button onClick={() => setIsCreating(true)} className="bg-purple-600 hover:bg-purple-700">Create First Checkpoint</Button>}
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCheckpoints.map(cp => (
            <Card key={cp._id} className="flex flex-col items-center bg-white overflow-hidden group hover:shadow-md transition-shadow border border-slate-200">
              <div className="w-full px-4 py-3 bg-slate-50 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 truncate" title={cp.name}>{cp.name}</h3>
                <div className="flex items-center text-xs text-slate-500 mt-1">
                  <MapPin size={12} className="mr-1 shrink-0" />
                  <span className="truncate" title={getSiteName(cp.siteId)}>{getSiteName(cp.siteId)}</span>
                </div>
              </div>
              
              <div className="p-6 w-full flex flex-col items-center flex-1">
                <div className="bg-white p-3 rounded-xl border-2 border-slate-100 shadow-sm mb-4 group-hover:border-purple-200 transition-colors">
                  <QRCodeCanvas 
                    id={`qr-${cp._id}`}
                    value={cp.qrPayload} 
                    size={140}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                
                <div className="w-full flex items-center justify-center gap-1 text-[10px] text-slate-400 font-mono bg-slate-50 py-1.5 px-2 rounded-md mb-4 border border-slate-100">
                  <ShieldAlert size={10} className="shrink-0 text-slate-400" />
                  <span className="truncate">{cp.qrPayload}</span>
                </div>

                {cp.notes && (
                  <div className="w-full text-xs text-slate-600 bg-amber-50 p-2 rounded border border-amber-100 mb-4 flex items-start gap-1">
                    <FileText size={12} className="shrink-0 text-amber-600 mt-0.5" />
                    <span className="line-clamp-2">{cp.notes}</span>
                  </div>
                )}
              </div>

              <div className="w-full grid grid-cols-2 border-t border-slate-100 divide-x divide-slate-100 bg-slate-50">
                <button 
                  onClick={() => downloadQR(cp)}
                  className="py-3 flex items-center justify-center gap-2 text-sm font-medium text-slate-700 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                >
                  <Download size={16} /> Print
                </button>
                {canManage ? (
                  <button 
                    onClick={() => handleRegenerateQR(cp._id)} 
                    className="py-3 flex items-center justify-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <RefreshCw size={16} /> Revoke
                  </button>
                ) : (
                  <div className="py-3 bg-slate-100"></div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
