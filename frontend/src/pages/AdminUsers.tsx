import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Search, Shield, Filter } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export function AdminUsers() {
  const [users] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // In a full implementation, this would fetch from /api/admin/users
    // For now, we simulate an empty or error state if endpoint doesn't exist
    // Or we could try fetching companies and extracting some users if available
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#1e1e24]">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Users</h1>
          <p className="text-slate-400 mt-1">Manage all platform users across tenant companies.</p>
        </div>
      </div>

      <Card className="bg-[#121214] border-[#1e1e24]">
        <div className="p-4 border-b border-[#1e1e24] flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#1a1a1e] border border-[#2a2a32] rounded-lg text-sm text-white focus:border-emerald-500 focus:outline-none transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1e] border border-[#2a2a32] text-slate-300 rounded-lg hover:bg-[#2a2a32] transition-colors whitespace-nowrap">
            <Filter size={16} /> Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-12 flex justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>
          ) : users.length > 0 ? (
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-[#1a1a1e] text-xs uppercase font-bold text-slate-500 border-b border-[#1e1e24]">
                <tr>
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Created</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e24]">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-[#1a1a1e] transition-colors">
                    <td className="px-5 py-4 font-medium text-white">{u.firstName} {u.lastName}</td>
                    <td className="px-5 py-4">{u.email}</td>
                    <td className="px-5 py-4">
                      <Badge variant="outline" className="border-slate-700 text-slate-300 bg-slate-800/50 uppercase text-[10px]">{u.role}</Badge>
                    </td>
                    <td className="px-5 py-4">
                       <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                          {u.status}
                        </span>
                    </td>
                    <td className="px-5 py-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-right">
                       <button className="text-emerald-400 hover:text-emerald-300 font-medium">Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-16 flex flex-col items-center justify-center text-slate-500">
              <Shield className="w-12 h-12 mb-4 opacity-50" />
              <p className="font-medium text-lg">No users found</p>
              <p className="text-sm mt-1 text-slate-600">The user directory is currently empty or unavailable.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
