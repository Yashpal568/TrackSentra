import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import { Card } from '../components/ui/Card';
import { AlertTriangle, Plus, Activity, MapPin, Clock, Search, ChevronRight, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Incidents = () => {
  const { user } = useAuthStore();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Security');
  const [severity, setSeverity] = useState('Medium');
  const [siteId, setSiteId] = useState('');

  // Admin / Supervisor states
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [newNote, setNewNote] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [resolutionDetails, setResolutionDetails] = useState('');

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/incidents');
      setIncidents(res.data.data);
    } catch (error) {
      console.error('Failed to load incidents', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSites = async () => {
    try {
      const res = await api.get('/sites');
      setSites(res.data);
      if (res.data.length > 0) {
        setSiteId(res.data[0]._id);
      }
    } catch (error) {
      console.error('Failed to load sites', error);
    }
  };

  useEffect(() => {
    fetchIncidents();
    if (user?.role !== 'GUARD') {
      fetchSites();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!siteId && user?.role !== 'GUARD') {
        alert('Please select a site');
        return;
      }
      
      const payload: any = {
        title,
        description,
        category,
        severity,
      };

      if (user?.role !== 'GUARD') {
        payload.siteId = siteId;
      } else {
        payload.siteId = siteId || undefined; 
      }

      if (!payload.siteId) {
        const sitesRes = await api.get('/sites');
        if (sitesRes.data.length > 0) {
          payload.siteId = sitesRes.data[0]._id;
        } else {
          alert('No sites available to report incident.');
          return;
        }
      }

      await api.post('/incidents', payload);
      setShowForm(false);
      setTitle('');
      setDescription('');
      fetchIncidents();
    } catch (error) {
      console.error('Failed to create incident', error);
      alert('Failed to report incident');
    }
  };

  const handleUpdateStatus = async () => {
    if ((newStatus === 'Resolved' || newStatus === 'Closed') && !resolutionDetails) {
      alert('Resolution details required');
      return;
    }
    try {
      await api.put(`/incidents/${selectedIncident._id}`, {
        status: newStatus,
        resolutionDetails: resolutionDetails || undefined
      });
      const res = await api.get(`/incidents/${selectedIncident._id}`);
      setSelectedIncident(res.data);
      setNewStatus('');
      setResolutionDetails('');
      fetchIncidents();
    } catch (error) {
      console.error('Failed to update incident', error);
      alert('Failed to update incident');
    }
  };

  const handleAddNote = async () => {
    if (!newNote) return;
    try {
      await api.post(`/incidents/${selectedIncident._id}/notes`, { note: newNote });
      setNewNote('');
      const res = await api.get(`/incidents/${selectedIncident._id}`);
      setSelectedIncident(res.data);
      fetchIncidents();
    } catch (error) {
      console.error('Failed to add note', error);
    }
  };

  const filteredIncidents = incidents.filter(inc => 
    inc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    inc.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      
      {/* Header */}
      {!selectedIncident && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
              <AlertTriangle className="text-orange-500" /> Incident Management
            </h1>
            <p className="text-text-secondary text-sm mt-1">Log, investigate, and resolve security events and facility incidents.</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input 
                type="text" 
                placeholder="Search incidents..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-border-subtle rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-surface-card w-full sm:w-64"
              />
            </div>
            <Button onClick={() => setShowForm(!showForm)} className={`flex items-center gap-2 whitespace-nowrap ${showForm ? 'bg-slate-200 text-text-main hover:bg-slate-300' : 'bg-orange-600 hover:bg-orange-700'}`}>
              {showForm ? 'Cancel Report' : <><Plus size={18} /> Report Incident</>}
            </Button>
          </div>
        </div>
      )}

      {showForm && !selectedIncident && (
        <Card className="border-t-4 border-t-orange-500 shadow-lg mb-8">
          <div className="px-6 py-4 border-b border-border-subtle bg-surface-main">
            <h2 className="text-lg font-bold text-text-main">Submit New Incident Report</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-text-main mb-1">Incident Title <span className="text-red-500">*</span></label>
                <input required value={title} onChange={(e) => setTitle(e.target.value)} type="text" className="w-full rounded-md border-border-subtle shadow-sm focus:border-orange-500 focus:ring-orange-500 px-4 py-2 border" placeholder="Brief summary of the incident" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-text-main mb-1">Detailed Description <span className="text-red-500">*</span></label>
                <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full rounded-md border-border-subtle shadow-sm focus:border-orange-500 focus:ring-orange-500 px-4 py-2 border" placeholder="Provide as much detail as possible about what occurred, individuals involved, and immediate actions taken." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-main mb-1">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-md border-border-subtle shadow-sm focus:border-orange-500 focus:ring-orange-500 px-4 py-2 border bg-surface-card">
                  <option value="Security">Security Breach / Suspicious Activity</option>
                  <option value="Maintenance">Maintenance / Facility Damage</option>
                  <option value="Medical">Medical Emergency</option>
                  <option value="Other">Other Operational Issue</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-main mb-1">Severity Level</label>
                <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="w-full rounded-md border-border-subtle shadow-sm focus:border-orange-500 focus:ring-orange-500 px-4 py-2 border bg-surface-card">
                  <option value="Low">Low - Minor issue, no immediate threat</option>
                  <option value="Medium">Medium - Requires attention, moderate impact</option>
                  <option value="High">High - Significant issue, requires urgent response</option>
                  <option value="Critical">Critical - Immediate threat to life or property</option>
                </select>
              </div>
              {user?.role !== 'GUARD' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-text-main mb-1">Location / Site <span className="text-red-500">*</span></label>
                  <select value={siteId} onChange={(e) => setSiteId(e.target.value)} className="w-full rounded-md border-border-subtle shadow-sm focus:border-orange-500 focus:ring-orange-500 px-4 py-2 border bg-surface-card">
                    <option value="">Select a site</option>
                    {sites.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-8 pt-6 border-t border-border-subtle">
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700">Submit Report</Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {selectedIncident ? (
        <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setSelectedIncident(null)}
              className="flex items-center gap-2 text-text-secondary hover:text-text-main transition-colors font-medium text-sm"
            >
              <ChevronRight size={16} className="rotate-180" /> Back to Incident List
            </button>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
              selectedIncident.status === 'Closed' ? 'bg-surface-hover text-text-secondary border-border-subtle' :
              selectedIncident.status === 'Resolved' ? 'bg-emerald-primary/20 text-emerald-primary border-emerald-primary/30' :
              'bg-blue-100 text-blue-700 border-blue-200'
            }`}>
              {selectedIncident.status}
            </span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden border-t-4 border-t-slate-800">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-text-main leading-tight">{selectedIncident.title}</h2>
                      <div className="flex flex-wrap items-center gap-3 text-text-secondary text-sm mt-2">
                        <span className="flex items-center gap-1.5"><Clock size={14}/> {new Date(selectedIncident.createdAt).toLocaleString()}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={14}/> {selectedIncident.siteId?.name || 'Unknown Location'}</span>
                      </div>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm shrink-0 border ${
                      selectedIncident.severity === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                      selectedIncident.severity === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      selectedIncident.severity === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      'bg-emerald-primary/10 text-emerald-primary border-emerald-primary/30'
                    }`}>
                      {selectedIncident.severity.toUpperCase()} PRIORITY
                    </span>
                  </div>
                  
                  <div className="bg-surface-main p-5 rounded-lg border border-border-subtle mb-6">
                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Description</h3>
                    <p className="text-text-main whitespace-pre-wrap">{selectedIncident.description}</p>
                  </div>
                  
                  {selectedIncident.resolutionDetails && (
                    <div className="bg-emerald-primary/10 p-5 rounded-lg border border-green-100">
                      <h3 className="text-xs font-bold text-emerald-primary uppercase tracking-wider mb-2 flex items-center gap-2"><CheckCircle2 size={14}/> Resolution Details</h3>
                      <p className="text-green-900 whitespace-pre-wrap">{selectedIncident.resolutionDetails}</p>
                    </div>
                  )}
                </div>
                
                <div className="bg-surface-main px-6 py-4 border-t border-border-subtle flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Reported By:</span>
                  <span className="font-semibold text-text-main">{selectedIncident.reporterId?.firstName} {selectedIncident.reporterId?.lastName}</span>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold text-text-main mb-4 flex items-center gap-2"><MessageSquare size={18} className="text-emerald-primary"/> Investigation Logs</h3>
                
                <div className="space-y-4 mb-6 relative">
                  {selectedIncident.investigationNotes?.length === 0 && (
                    <p className="text-text-secondary text-sm italic text-center py-4">No investigation notes have been added yet.</p>
                  )}
                  {selectedIncident.investigationNotes?.map((note: any, idx: number) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-text-secondary text-xs shrink-0 mt-1">
                        {note.createdBy?.firstName?.charAt(0)}{note.createdBy?.lastName?.charAt(0)}
                      </div>
                      <div className="flex-1 bg-surface-main p-4 rounded-lg border border-border-subtle">
                        <p className="text-sm text-text-main">{note.note}</p>
                        <p className="text-xs text-text-muted mt-2 font-medium">{new Date(note.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {user?.role !== 'GUARD' && selectedIncident.status !== 'Closed' && (
                  <div className="flex gap-3 pt-4 border-t border-border-subtle">
                    <input 
                      type="text" 
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add an update or note to the investigation..."
                      className="flex-1 rounded-md border-border-subtle shadow-sm px-4 py-2 border text-sm"
                    />
                    <Button onClick={handleAddNote} disabled={!newNote}>Post Log</Button>
                  </div>
                )}
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-4">Metadata</h3>
                <dl className="space-y-4 text-sm">
                  <div className="pb-4 border-b border-border-subtle">
                    <dt className="text-text-secondary mb-1">Current Status</dt>
                    <dd className="font-bold text-text-main">{selectedIncident.status}</dd>
                  </div>
                  <div className="pb-4 border-b border-border-subtle">
                    <dt className="text-text-secondary mb-1">Classification</dt>
                    <dd className="font-bold text-text-main">{selectedIncident.category}</dd>
                  </div>
                  <div>
                    <dt className="text-text-secondary mb-1">Facility ID</dt>
                    <dd className="font-bold text-text-main">{selectedIncident.siteId?._id || 'N/A'}</dd>
                  </div>
                </dl>
              </Card>

              {user?.role !== 'GUARD' && selectedIncident.status !== 'Closed' && (
                <Card className="p-6 border-2 border-border-subtle bg-surface-main">
                  <h3 className="text-sm font-bold text-text-main mb-4 flex items-center gap-2"><Activity size={16} className="text-emerald-primary"/> Update Status</h3>
                  <select 
                    value={newStatus || selectedIncident.status}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full rounded-md border-border-subtle shadow-sm p-2.5 border mb-4 text-sm font-medium bg-surface-card"
                  >
                    <option value="Open">Open</option>
                    <option value="Acknowledged">Acknowledged</option>
                    <option value="Under Investigation">Under Investigation</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>

                  {(newStatus === 'Resolved' || newStatus === 'Closed') && (
                    <div className="mb-4 animate-in fade-in slide-in-from-top-2">
                      <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Resolution Details <span className="text-red-500">*</span></label>
                      <textarea 
                        required
                        value={resolutionDetails}
                        onChange={(e) => setResolutionDetails(e.target.value)}
                        placeholder="Explain how this incident was resolved..."
                        rows={4}
                        className="w-full rounded-md border-border-subtle shadow-sm p-3 border text-sm"
                      />
                    </div>
                  )}

                  <Button onClick={handleUpdateStatus} className="w-full shadow-sm">Save Changes</Button>
                </Card>
              )}
            </div>
          </div>
        </div>
      ) : (
        <Card className="overflow-hidden shadow-sm border border-border-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-main border-b border-border-subtle text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  <th className="px-6 py-4">Incident Summary</th>
                  <th className="px-6 py-4 text-center">Severity</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4">Facility / Location</th>
                  <th className="px-6 py-4">Date Logged</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-text-secondary font-medium">
                      <div className="flex justify-center items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-400"></div>
                        Loading incidents...
                      </div>
                    </td>
                  </tr>
                ) : filteredIncidents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-hover mb-3">
                        <AlertTriangle className="text-text-muted" size={24} />
                      </div>
                      <p className="text-text-secondary font-medium">No incidents match your criteria.</p>
                    </td>
                  </tr>
                ) : (
                  filteredIncidents.map((incident) => (
                    <tr key={incident._id} className="hover:bg-surface-main/50 transition-colors cursor-pointer group" onClick={async () => {
                      const res = await api.get(`/incidents/${incident._id}`);
                      setSelectedIncident(res.data);
                    }}>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-text-main group-hover:text-emerald-primary transition-colors">{incident.title}</div>
                        <div className="text-text-secondary text-xs mt-0.5">{incident.category}</div>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                          incident.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                          incident.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                          incident.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-emerald-primary/20 text-emerald-primary'
                        }`}>
                          {incident.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-surface-hover text-text-main border border-border-subtle">
                          {incident.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-secondary font-medium">
                        {incident.siteId?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-secondary">
                        {new Date(incident.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-emerald-primary group-hover:text-blue-800 font-medium text-sm flex items-center justify-end gap-1">
                          View <ChevronRight size={14} />
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
