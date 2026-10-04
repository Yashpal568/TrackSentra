import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { QRCodeCanvas } from 'qrcode.react';
import { QrCode, Plus, Download, RefreshCw, MapPin, Search, ShieldAlert, Globe, CheckCircle2, AlertCircle, ArrowLeft, Crosshair, Users } from 'lucide-react';

export const SiteDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [site, setSite] = useState<any>(null);
  const [checkpoints, setCheckpoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', latitude: '', longitude: '', accuracy: '', radius: '50', gpsAccuracyThreshold: '20', description: '', installationInstructions: '', notes: '' });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [siteRes, cpRes] = await Promise.all([
        api.get(`/sites/${id}`),
        api.get(`/checkpoints?siteId=${id}`)
      ]);
      setSite(siteRes.data.site);
      setCheckpoints(cpRes.data.checkpoints);
    } catch (err) {
      setError('Failed to load site details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCheckpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        siteId: id,
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
      setFormData({ name: '', latitude: '', longitude: '', accuracy: '', radius: '50', gpsAccuracyThreshold: '20', description: '', installationInstructions: '', notes: '' });
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

  const handleVerify = async (cpId: string) => {
    try {
      await api.post(`/checkpoints/${cpId}/verify`);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to verify checkpoint.');
    }
  };

  const handleRegenerateQR = async (cpId: string) => {
    if (!window.confirm('CRITICAL ACTION: Regenerating this QR code will instantly invalidate the existing physical QR code. Field guards will be unable to scan until the new code is printed and placed. Proceed?')) return;
    try {
      await api.post(`/checkpoints/${cpId}/qr`);
      fetchData();
    } catch (err) {
      setError('Failed to regenerate QR.');
    }
  };

  const printQR = (checkpoint: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print QR codes.');
      return;
    }

    const canvas = document.getElementById(`qr-${checkpoint._id}`) as HTMLCanvasElement;
    const qrDataUrl = canvas ? canvas.toDataURL('image/png') : '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print QR Code - ${checkpoint.name}</title>
        <style>
          body {
            font-family: 'Inter', system-ui, sans-serif;
            margin: 0;
            padding: 40px;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #f8fafc;
          }
          .card {
            background: white;
            border: 2px solid #10b981;
            border-radius: 16px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            max-width: 400px;
            width: 100%;
          }
          .logo {
            font-size: 24px;
            font-weight: 900;
            color: #0f172a;
            margin-bottom: 8px;
            letter-spacing: 2px;
          }
          .subtitle {
            font-size: 14px;
            font-weight: 700;
            color: #10b981;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 24px;
          }
          .checkpoint-name {
            font-size: 28px;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 16px;
          }
          .warning {
            font-size: 12px;
            color: #64748b;
            margin-bottom: 30px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 20px;
          }
          .qr-container {
            margin: 0 auto 30px;
            padding: 20px;
            background: #fff;
            border: 2px dashed #cbd5e1;
            border-radius: 12px;
            display: inline-block;
          }
          .qr-image {
            width: 200px;
            height: 200px;
          }
          .details {
            text-align: left;
            background: #f8fafc;
            padding: 16px;
            border-radius: 8px;
            font-size: 12px;
            color: #475569;
          }
          .details strong {
            color: #0f172a;
            display: inline-block;
            width: 80px;
          }
          @media print {
            body { background: white; }
            .card { box-shadow: none; border-color: #000; }
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="logo">TRACKSENTRA</div>
          <div class="subtitle">Security Checkpoint</div>
          
          <div class="checkpoint-name">${checkpoint.name.toUpperCase()}</div>
          <div class="warning">Scan only during authorized patrol execution.</div>
          
          <div class="qr-container">
            <img src="${qrDataUrl}" alt="QR Code" class="qr-image" />
          </div>
          
          <div class="details">
            <div><strong>Site:</strong> ${site.name}</div>
            <div style="margin-top: 8px;"><strong>ID:</strong> ${checkpoint.qrPayload.substring(0, 8).toUpperCase()}</div>
          </div>
        </div>
        <script>
          window.onload = () => {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const canManage = ['SUPER_ADMIN', 'COMPANY_ADMIN', 'SITE_MANAGER'].includes(user?.role || '');

  const filteredCheckpoints = checkpoints.filter(cp => 
    cp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    cp.qrPayload.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-primary"></div>
    </div>
  );

  if (!site) return (
    <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-3">
      <ShieldAlert size={20} /> Site not found.
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <button onClick={() => navigate('/sites')} className="text-text-secondary hover:text-text-main flex items-center gap-2 mb-4">
        <ArrowLeft size={16} /> Back to Sites
      </button>

      {/* Site Overview */}
      <Card className="bg-surface-card overflow-hidden">
        <div className="p-6 border-b border-border-subtle bg-surface-main">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-text-main">{site.name}</h1>
              <div className="flex items-center gap-4 mt-3">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${site.status === 'active' ? 'bg-emerald-primary/20 text-emerald-primary' : 'bg-surface-hover text-text-main'}`}>
                  {site.status === 'active' ? <CheckCircle2 size={14}/> : <AlertCircle size={14}/>} 
                  {site.status.toUpperCase()}
                </span>
                <span className="text-sm text-text-secondary flex items-center gap-1"><MapPin size={14}/> {site.address}{site.city ? `, ${site.city}` : ''}</span>
                <span className="text-sm text-text-secondary flex items-center gap-1"><Globe size={14}/> {site.timezone}</span>
              </div>
            </div>
            {canManage && (
              <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
                <Plus size={18} /> Add Checkpoint
              </Button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6">
           <div>
             <p className="text-xs text-text-muted uppercase font-semibold mb-1">Geofence Radius</p>
             <p className="font-bold text-text-main flex items-center gap-2"><Crosshair size={16} className="text-emerald-primary"/> {site.radius || 100} metres</p>
           </div>
           <div>
             <p className="text-xs text-text-muted uppercase font-semibold mb-1">Location</p>
             <p className="font-bold text-text-main">{site.latitude ? `${site.latitude.toFixed(4)}, ${site.longitude.toFixed(4)}` : 'Not Configured'}</p>
           </div>
           <div>
             <p className="text-xs text-text-muted uppercase font-semibold mb-1">Total Checkpoints</p>
             <p className="font-bold text-text-main flex items-center gap-2"><QrCode size={16} className="text-emerald-primary"/> {checkpoints.length}</p>
           </div>
           <div>
             <p className="text-xs text-text-muted uppercase font-semibold mb-1">Active Guards</p>
             <p className="font-bold text-text-main flex items-center gap-2"><Users size={16} className="text-emerald-primary"/> --</p>
           </div>
        </div>
      </Card>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-3">
          <ShieldAlert size={20} /> {error}
        </div>
      )}

      {/* Creation Form */}
      {isCreating && (
        <Card className="border-t-4 border-t-emerald-primary shadow-lg mt-6">
          <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-main">
            <h2 className="text-lg font-bold text-text-main flex items-center gap-2"><QrCode size={20} className="text-emerald-primary"/> Add Checkpoint to {site.name}</h2>
            <button onClick={() => setIsCreating(false)} className="text-text-muted hover:text-text-secondary">
              <span className="sr-only">Close</span>
              &times;
            </button>
          </div>
          <form onSubmit={handleCreateCheckpoint} className="p-6">
            <p className="text-text-secondary text-sm mb-6">An exact location inside the site where a guard must physically scan.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex text-sm font-semibold text-text-main mb-1">Checkpoint Name <span className="text-red-500">*</span></label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full rounded-md border-border-subtle shadow-sm focus:border-emerald-primary focus:ring-emerald-primary px-4 py-2 border bg-surface-main" placeholder="e.g. North Gate Entrance" />
              </div>
              <div>
                <label className="flex text-sm font-semibold text-text-main mb-1 flex items-center justify-between">
                  <span>Validation Radius (metres) <span className="text-red-500">*</span></span>
                </label>
                <input type="number" min="5" required value={formData.radius} onChange={e => setFormData({...formData, radius: e.target.value})} className="w-full rounded-md border-border-subtle shadow-sm focus:border-emerald-primary focus:ring-emerald-primary px-4 py-2 border bg-surface-main" />
              </div>
              <div className="md:col-span-2">
                <label className="flex text-sm font-semibold text-text-main mb-1">Description</label>
                <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full rounded-md border-border-subtle shadow-sm focus:border-emerald-primary focus:ring-emerald-primary px-4 py-2 border bg-surface-main" placeholder="e.g. Near the main entrance pillar" />
              </div>
              
              <div className="md:col-span-2 flex items-center justify-between pt-4 border-t border-border-subtle">
                <h3 className="text-sm font-semibold text-text-main flex items-center gap-2"><MapPin size={16} className="text-emerald-primary"/> Exact Geographic Coordinates <span className="text-red-500">*</span></h3>
                <Button type="button" variant="secondary" onClick={handleGetLocation} className="text-xs px-3 py-1.5 flex items-center gap-1.5 h-auto">
                  <MapPin size={14} /> Use Current Location
                </Button>
              </div>
              <div>
                <label className="flex text-sm font-semibold text-text-main mb-1">Latitude</label>
                <input type="number" step="any" required value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} className="w-full rounded-md border-border-subtle shadow-sm focus:border-emerald-primary focus:ring-emerald-primary px-4 py-2 border bg-surface-main" placeholder="e.g. 40.7128" />
              </div>
              <div>
                <label className="flex text-sm font-semibold text-text-main mb-1">Longitude</label>
                <input type="number" step="any" required value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} className="w-full rounded-md border-border-subtle shadow-sm focus:border-emerald-primary focus:ring-emerald-primary px-4 py-2 border bg-surface-main" placeholder="e.g. -74.0060" />
              </div>
              {formData.accuracy && (
                <div className="md:col-span-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                  Captured GPS Accuracy: <strong>{Math.round(parseFloat(formData.accuracy))} meters</strong>. 
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-8 pt-6 border-t border-border-subtle">
              <Button type="submit" className="flex items-center gap-2"><Plus size={16}/> Create Checkpoint</Button>
              <Button type="button" variant="secondary" onClick={() => setIsCreating(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Checkpoints Section */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
            <QrCode className="text-emerald-primary" /> Checkpoints
          </h2>
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
        </div>

        {checkpoints.length === 0 && !isCreating ? (
          <Card className="text-center py-16 px-6 border-dashed border-2 border-border-subtle bg-surface-main">
            <div className="w-16 h-16 bg-surface-card rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-border-subtle">
              <QrCode className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="text-lg font-bold text-text-main mb-2">No checkpoints configured</h3>
            <p className="text-text-secondary max-w-md mx-auto mb-6">Add checkpoints to define the exact locations guards must physically visit during patrols.</p>
            {canManage && <Button onClick={() => setIsCreating(true)}>Add Checkpoint</Button>}
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCheckpoints.map(cp => (
              <Card key={cp._id} className="flex flex-col items-center bg-surface-card overflow-hidden group hover:shadow-md transition-shadow border border-border-subtle">
                <div className="w-full px-4 py-3 bg-surface-main border-b border-border-subtle">
                  <h3 className="font-bold text-text-main truncate" title={cp.name}>{cp.name}</h3>
                  <div className="flex items-center text-xs text-text-secondary mt-1 gap-4">
                    <span className="flex items-center gap-1" title="Location">
                       <MapPin size={12} className="shrink-0 text-text-muted" /> {cp.latitude?.toFixed(4)}, {cp.longitude?.toFixed(4)}
                    </span>
                    <span className="flex items-center gap-1" title="Radius">
                       <Crosshair size={12} className="shrink-0 text-text-muted" /> {cp.radius}m
                    </span>
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
                </div>

                <div className={`w-full grid ${cp.installationStatus === 'pending' && canManage ? 'grid-cols-3' : 'grid-cols-2'} border-t border-border-subtle divide-x divide-slate-100 bg-surface-main`}>
                  <button 
                    onClick={() => printQR(cp)}
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
                      <RefreshCw size={16} /> Regenerate
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
    </div>
  );
};
