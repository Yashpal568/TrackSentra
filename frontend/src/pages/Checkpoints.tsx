import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { QRCodeCanvas } from 'qrcode.react';
import { QrCode, Plus, Download, RefreshCw, MapPin, Search, ShieldAlert, FileText, Map as MapIcon, Grid } from 'lucide-react';
import { CheckpointMap } from '../components/CheckpointMap';

export const Checkpoints = () => {
  const { user } = useAuthStore();
  const [checkpoints, setCheckpoints] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isCreating, setIsCreating] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [formData, setFormData] = useState({ siteId: '', name: '', latitude: '', longitude: '', accuracy: '', radius: '50', gpsAccuracyThreshold: '20', description: '', installationInstructions: '', notes: '' });

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
      if (formData.gpsAccuracyThreshold) payload.gpsAccuracyThreshold = parseInt(formData.gpsAccuracyThreshold, 10);
      if (formData.description) payload.description = formData.description;
      if (formData.installationInstructions) payload.installationInstructions = formData.installationInstructions;
      if (formData.notes) payload.notes = formData.notes;

      await api.post('/checkpoints', payload);
      fetchData();
      setIsCreating(false);
      setFormData({ siteId: '', name: '', latitude: '', longitude: '', accuracy: '', radius: '50', gpsAccuracyThreshold: '20', description: '', installationInstructions: '', notes: '' });
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create checkpoint.');
    }
  };

  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
            accuracy: position.coords.accuracy.toString()
          }));
        },
        (err) => {
          alert('Error getting location: ' + err.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  const handleVerify = async (id: string) => {
    try {
      await api.post(`/checkpoints/${id}/verify`);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to verify checkpoint.');
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
          <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <QrCode className="text-emerald-primary" /> Checkpoints & QR IDs
          </h1>
          <p className="text-text-secondary text-sm mt-1">Manage physical patrol checkpoints and generate their secure cryptographic QR codes.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Search checkpoints..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-border-subtle rounded-md shadow-sm focus:ring-emerald-primary focus:border-emerald-primary bg-surface-card w-full sm:w-64"
            />
          </div>
          <div className="flex bg-surface-card border border-border-subtle rounded-md overflow-hidden">
            <button 
              onClick={() => setViewMode('grid')} 
              className={`p-2 px-3 flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-emerald-100 text-emerald-800' : 'text-text-muted hover:bg-surface-hover'}`}
              title="Grid View"
            >
              <Grid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('map')} 
              className={`p-2 px-3 flex items-center justify-center border-l border-border-subtle transition-colors ${viewMode === 'map' ? 'bg-emerald-100 text-emerald-800' : 'text-text-muted hover:bg-surface-hover'}`}
              title="Map View"
            >
              <MapIcon size={18} />
            </button>
          </div>
          {canManage && !isCreating && (
            <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2 whitespace-nowrap bg-emerald-primary hover:bg-purple-700">
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
          <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-main">
            <h2 className="text-lg font-bold text-text-main">Register New Checkpoint</h2>
            <button onClick={() => setIsCreating(false)} className="text-text-muted hover:text-text-secondary">
              <span className="sr-only">Close</span>
              &times;
            </button>
          </div>
          <form onSubmit={handleCreate} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex text-sm font-semibold text-text-main mb-1">Assigned Site <span className="text-red-500">*</span></label>
                <select required value={formData.siteId} onChange={e => setFormData({...formData, siteId: e.target.value})} className="w-full rounded-md border-border-subtle shadow-sm focus:border-emerald-primary focus:ring-emerald-primary px-4 py-2 border bg-surface-card">
                  <option value="">Select a site</option>
                  {sites.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="flex text-sm font-semibold text-text-main mb-1">Checkpoint Name <span className="text-red-500">*</span></label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full rounded-md border-border-subtle shadow-sm focus:border-emerald-primary focus:ring-emerald-primary px-4 py-2 border" placeholder="e.g. North Gate Entrance" />
              </div>
              <div className="md:col-span-2">
                <label className="flex text-sm font-semibold text-text-main mb-1">Description</label>
                <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full rounded-md border-border-subtle shadow-sm focus:border-emerald-primary focus:ring-emerald-primary px-4 py-2 border" placeholder="e.g. Near the main entrance pillar" />
              </div>
              <div className="md:col-span-2">
                <label className="flex text-sm font-semibold text-text-main mb-1">Installation Instructions</label>
                <input type="text" value={formData.installationInstructions} onChange={e => setFormData({...formData, installationInstructions: e.target.value})} className="w-full rounded-md border-border-subtle shadow-sm focus:border-emerald-primary focus:ring-emerald-primary px-4 py-2 border" placeholder="e.g. Mount on wall at 1.5m height" />
              </div>
              <div className="md:col-span-2 flex items-center justify-between pt-2">
                <h3 className="text-sm font-semibold text-text-main">GPS Coordinates</h3>
                <Button type="button" variant="secondary" onClick={handleGetLocation} className="text-xs px-3 py-1.5 flex items-center gap-1.5 h-auto">
                  <MapPin size={14} /> Get Current Location
                </Button>
              </div>
              <div>
                <label className="flex text-sm font-semibold text-text-main mb-1">Latitude</label>
                <input type="number" step="any" value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} className="w-full rounded-md border-border-subtle shadow-sm focus:border-emerald-primary focus:ring-emerald-primary px-4 py-2 border" placeholder="e.g. 40.7128" />
              </div>
              <div>
                <label className="flex text-sm font-semibold text-text-main mb-1">Longitude</label>
                <input type="number" step="any" value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} className="w-full rounded-md border-border-subtle shadow-sm focus:border-emerald-primary focus:ring-emerald-primary px-4 py-2 border" placeholder="e.g. -74.0060" />
              </div>
              {formData.accuracy && (
                <div className="md:col-span-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                  Captured GPS Accuracy: <strong>{Math.round(parseFloat(formData.accuracy))} meters</strong>. 
                  {parseFloat(formData.accuracy) > parseInt(formData.gpsAccuracyThreshold || '20') && " Warning: Accuracy is poorer than the threshold. Try moving outdoors or waiting a moment before retrying."}
                </div>
              )}
              <div>
                <label className="flex text-sm font-semibold text-text-main mb-1">Validation Radius (meters)</label>
                <input type="number" min="5" value={formData.radius} onChange={e => setFormData({...formData, radius: e.target.value})} className="w-full rounded-md border-border-subtle shadow-sm focus:border-emerald-primary focus:ring-emerald-primary px-4 py-2 border" />
              </div>
              <div>
                <label className="flex text-sm font-semibold text-text-main mb-1">Required Accuracy Threshold (meters)</label>
                <input type="number" min="1" value={formData.gpsAccuracyThreshold} onChange={e => setFormData({...formData, gpsAccuracyThreshold: e.target.value})} className="w-full rounded-md border-border-subtle shadow-sm focus:border-emerald-primary focus:ring-emerald-primary px-4 py-2 border" />
              </div>
              <div className="md:col-span-2">
                <label className="flex text-sm font-semibold text-text-main mb-1">Location Notes / Instructions</label>
                <input type="text" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full rounded-md border-border-subtle shadow-sm focus:border-emerald-primary focus:ring-emerald-primary px-4 py-2 border" placeholder="e.g. Scan QR located behind the main front desk monitor." />
              </div>
            </div>
            <div className="flex gap-3 mt-8 pt-6 border-t border-border-subtle">
              <Button type="submit" className="flex items-center gap-2 bg-emerald-primary hover:bg-purple-700"><Plus size={16}/> Register Checkpoint</Button>
              <Button type="button" variant="secondary" onClick={() => setIsCreating(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Empty State */}
      {checkpoints.length === 0 && !isCreating ? (
        <Card className="text-center py-16 px-6 border-dashed border-2 border-border-subtle bg-surface-main">
          <div className="w-16 h-16 bg-surface-card rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-border-subtle">
            <QrCode className="w-8 h-8 text-text-muted" />
          </div>
          <h3 className="text-lg font-bold text-text-main mb-2">No Checkpoints Generated</h3>
          <p className="text-text-secondary max-w-md mx-auto mb-6">Create checkpoints within your sites to generate secure, cryptographic QR codes for guard patrols.</p>
          {canManage && <Button onClick={() => setIsCreating(true)} className="bg-emerald-primary hover:bg-purple-700">Create First Checkpoint</Button>}
        </Card>
      ) : viewMode === 'map' ? (
        <CheckpointMap checkpoints={filteredCheckpoints} />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCheckpoints.map(cp => (
            <Card key={cp._id} className="flex flex-col items-center bg-surface-card overflow-hidden group hover:shadow-md transition-shadow border border-border-subtle">
              <div className="w-full px-4 py-3 bg-surface-main border-b border-border-subtle">
                <h3 className="font-bold text-text-main truncate" title={cp.name}>{cp.name}</h3>
                <div className="flex items-center text-xs text-text-secondary mt-1">
                  <MapPin size={12} className="mr-1 shrink-0" />
                  <span className="truncate" title={getSiteName(cp.siteId)}>{getSiteName(cp.siteId)}</span>
                </div>
                <div className="mt-2">
                  <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-bold ${
                    cp.installationStatus === 'active' ? 'bg-green-100 text-green-700' : 
                    cp.installationStatus === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {cp.installationStatus || 'pending'}
                  </span>
                </div>
              </div>
              
              <div className="p-6 w-full flex flex-col items-center flex-1">
                <div className="bg-surface-card p-3 rounded-xl border-2 border-border-subtle shadow-sm mb-4 group-hover:border-border-subtle transition-colors">
                  <QRCodeCanvas 
                    id={`qr-${cp._id}`}
                    value={`${window.location.origin}/guard/scan/${cp.qrPayload}`}
                    size={140}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                
                <div className="w-full flex items-center justify-center gap-1 text-[10px] text-text-muted font-mono bg-surface-main py-1.5 px-2 rounded-md mb-4 border border-border-subtle">
                  <ShieldAlert size={10} className="shrink-0 text-text-muted" />
                  <span className="truncate">{cp.qrPayload}</span>
                </div>

                {cp.notes && (
                  <div className="w-full text-xs text-text-secondary bg-amber-50 p-2 rounded border border-amber-100 mb-4 flex items-start gap-1">
                    <FileText size={12} className="shrink-0 text-amber-600 mt-0.5" />
                    <span className="line-clamp-2">{cp.notes}</span>
                  </div>
                )}
              </div>

              <div className={`w-full grid ${cp.installationStatus === 'pending' && canManage ? 'grid-cols-3' : 'grid-cols-2'} border-t border-border-subtle divide-x divide-slate-100 bg-surface-main`}>
                <button 
                  onClick={() => downloadQR(cp)}
                  className="py-3 flex items-center justify-center gap-2 text-sm font-medium text-text-main hover:text-text-main hover:bg-surface-hover transition-colors"
                >
                  <Download size={16} /> Print
                </button>
                {cp.installationStatus === 'pending' && canManage && (
                  <button 
                    onClick={() => handleVerify(cp._id)} 
                    className="py-3 flex items-center justify-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                  >
                    <ShieldAlert size={16} /> Verify
                  </button>
                )}
                {canManage ? (
                  <button 
                    onClick={() => handleRegenerateQR(cp._id)} 
                    className="py-3 flex items-center justify-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <RefreshCw size={16} /> Revoke
                  </button>
                ) : (
                  <div className="py-3 bg-surface-hover"></div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
