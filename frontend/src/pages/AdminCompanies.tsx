import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../lib/axios';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Building2, Search, AlertTriangle, CheckCircle2, Ban } from 'lucide-react';

export function AdminCompanies() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialSearch = searchParams.get('search') || '';

  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data } = await api.get('/companies?limit=50');
      setCompanies(data.companies);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to change this company's status to ${newStatus}?`)) return;

    try {
      await api.put(`/companies/${id}`, { status: newStatus });
      fetchCompanies(); // Refresh data dynamically
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update company status');
    }
  };

  const filtered = companies.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-text-main">Company Management</h1>
          <p className="text-text-secondary mt-1">Monitor and manage all active tenant companies</p>
        </div>
      </div>

      <Card className="p-4 border-border-subtle bg-surface-card">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="text"
            placeholder="Search companies by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border-subtle rounded-lg py-2 pl-10 pr-4 text-sm text-text-main placeholder-text-muted focus:outline-none focus:border-emerald-primary focus:ring-1 focus:ring-emerald-primary"
          />
        </div>
      </Card>

      <div className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-hover border-b border-border-subtle text-xs font-semibold text-text-secondary tracking-wider">
                <th className="p-4 uppercase">Company Name</th>
                <th className="p-4 uppercase">Created</th>
                <th className="p-4 uppercase">Timezone</th>
                <th className="p-4 uppercase">Status</th>
                <th className="p-4 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-muted">Loading companies...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-muted">No companies found.</td>
                </tr>
              ) : (
                filtered.map((company) => (
                  <tr key={company._id} className="hover:bg-surface-hover/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-primary/10 flex items-center justify-center text-emerald-primary">
                          <Building2 size={16} />
                        </div>
                        <div>
                          <p className="font-medium text-text-main">{company.name}</p>
                          <p className="text-xs text-text-muted">{company._id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-text-secondary">
                      {new Date(company.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm text-text-secondary">
                      {company.timezone}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        company.status === 'active' ? 'bg-emerald-primary/10 text-emerald-primary' :
                        company.status === 'suspended' ? 'bg-danger/10 text-danger' :
                        'bg-surface-hover text-text-secondary'
                      }`}>
                        {company.status === 'active' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                        <span className="capitalize">{company.status}</span>
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {company.status === 'active' ? (
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleStatusChange(company._id, 'suspended')}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Ban size={14} className="mr-1.5" /> Suspend
                        </Button>
                      ) : (
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => handleStatusChange(company._id, 'active')}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <CheckCircle2 size={14} className="mr-1.5" /> Activate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
