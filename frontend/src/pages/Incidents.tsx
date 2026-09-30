import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import { Card } from '../components/ui/Card';
import { LayoutDashboard, AlertTriangle, Plus, FileText } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Incidents = () => {
  const { user } = useAuthStore();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

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

  useEffect(() => {
    fetchIncidents();
    if (user?.role !== 'GUARD') {
      fetchSites();
    }
  }, [user]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // If guard, they might not have a site selector if not loaded, but let's just pass the first site or if it's tied to their shift.
      // For simplicity, requiring siteId
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
        // Find a way to get the guard's current site. If not available, we assume the backend handles it or we mock it.
        // For now, if siteId is empty, use a placeholder or prompt the user.
        payload.siteId = siteId || undefined; // Wait, schema requires siteId.
      }

      // If siteId is still empty, let's just fetch it if it's a guard.
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
      setSelectedIncident(null);
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
      // Refresh the selected incident notes
      const res = await api.get(`/incidents/${selectedIncident._id}`);
      setSelectedIncident(res.data);
      fetchIncidents();
    } catch (error) {
      console.error('Failed to add note', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Incident Management</h1>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
            {showForm ? 'Cancel' : <><Plus size={16} /> Report Incident</>}
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showForm && (
          <Card className="p-6 mb-8">
            <h2 className="text-lg font-bold mb-4">Report New Incident</h2>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input required value={title} onChange={(e) => setTitle(e.target.value)} type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                    <option value="Security">Security</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Medical">Medical</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Severity</label>
                  <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
              {user?.role !== 'GUARD' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Site</label>
                  <select value={siteId} onChange={(e) => setSiteId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                    <option value="">Select a site</option>
                    {sites.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
              )}
              <Button type="submit">Submit Report</Button>
            </form>
          </Card>
        )}

        {selectedIncident ? (
          <div className="space-y-6">
            <Button variant="secondary" onClick={() => setSelectedIncident(null)}>Back to List</Button>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <Card className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedIncident.title}</h2>
                      <p className="text-gray-500 text-sm">Reported on {new Date(selectedIncident.createdAt).toLocaleString()} by {selectedIncident.reporterId?.firstName} {selectedIncident.reporterId?.lastName}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedIncident.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                      selectedIncident.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                      selectedIncident.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {selectedIncident.severity}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-6">{selectedIncident.description}</p>
                  
                  {selectedIncident.resolutionDetails && (
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                      <h3 className="font-bold text-sm text-gray-900 mb-2">Resolution Details</h3>
                      <p className="text-gray-700">{selectedIncident.resolutionDetails}</p>
                    </div>
                  )}
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><FileText size={20}/> Investigation Notes</h3>
                  <div className="space-y-4 mb-6">
                    {selectedIncident.investigationNotes?.length === 0 && <p className="text-gray-500 text-sm">No notes yet.</p>}
                    {selectedIncident.investigationNotes?.map((note: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                        <p className="text-sm text-gray-800">{note.note}</p>
                        <p className="text-xs text-gray-500 mt-2">- {note.createdBy?.firstName} {note.createdBy?.lastName} at {new Date(note.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  {user?.role !== 'GUARD' && (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add an investigation note..."
                        className="flex-1 rounded-md border-gray-300 shadow-sm p-2 border"
                      />
                      <Button onClick={handleAddNote}>Add Note</Button>
                    </div>
                  )}
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4">Details</h3>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-gray-500">Status</dt>
                      <dd className="font-medium text-gray-900">{selectedIncident.status}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Category</dt>
                      <dd className="font-medium text-gray-900">{selectedIncident.category}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Site</dt>
                      <dd className="font-medium text-gray-900">{selectedIncident.siteId?.name}</dd>
                    </div>
                  </dl>
                </Card>

                {user?.role !== 'GUARD' && selectedIncident.status !== 'Closed' && (
                  <Card className="p-6">
                    <h3 className="text-lg font-bold mb-4">Update Status</h3>
                    <select 
                      value={newStatus || selectedIncident.status}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm p-2 border mb-4"
                    >
                      <option value="Open">Open</option>
                      <option value="Acknowledged">Acknowledged</option>
                      <option value="Under Investigation">Under Investigation</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>

                    {(newStatus === 'Resolved' || newStatus === 'Closed') && (
                      <textarea 
                        required
                        value={resolutionDetails}
                        onChange={(e) => setResolutionDetails(e.target.value)}
                        placeholder="Resolution details required..."
                        rows={3}
                        className="w-full rounded-md border-gray-300 shadow-sm p-2 border mb-4"
                      />
                    )}

                    <Button onClick={handleUpdateStatus} className="w-full">Update Incident</Button>
                  </Card>
                )}
              </div>
            </div>
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incident</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                    </tr>
                  ) : incidents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No incidents found</td>
                    </tr>
                  ) : (
                    incidents.map((incident) => (
                      <tr key={incident._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <AlertTriangle className={`w-5 h-5 mr-3 ${
                              incident.severity === 'Critical' ? 'text-red-500' :
                              incident.severity === 'High' ? 'text-orange-500' :
                              incident.severity === 'Medium' ? 'text-yellow-500' :
                              'text-green-500'
                            }`} />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{incident.title}</div>
                              <div className="text-sm text-gray-500">{incident.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            incident.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                            incident.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                            incident.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {incident.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            {incident.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {incident.siteId?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(incident.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={async () => {
                              const res = await api.get(`/incidents/${incident._id}`);
                              setSelectedIncident(res.data);
                            }}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};
