import React, { useEffect, useState } from 'react';
import { api } from '../lib/axios';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Plus, MessageSquare, Clock } from 'lucide-react';

interface Ticket {
  _id: string;
  ticketReference: string;
  subject: string;
  category: string;
  status: string;
  updatedAt: string;
}

export const SupportTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ subject: '', category: 'General', description: '' });

  const fetchTickets = async () => {
    try {
      const { data } = await api.get('/tickets');
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tickets', form);
      setShowModal(false);
      setForm({ subject: '', category: 'General', description: '' });
      fetchTickets();
    } catch (err) {
      console.error(err);
      alert('Failed to create ticket');
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'OPEN': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'WAITING_FOR_CUSTOMER': return 'bg-purple-100 text-purple-800';
      case 'RESOLVED': return 'bg-emerald-primary/20 text-emerald-primary';
      default: return 'bg-surface-hover text-text-main';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-text-main tracking-tight">Support Tickets</h1>
          <p className="text-text-secondary mt-1">Manage and track your support requests and inquiries.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-6 py-2.5 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all">
          <Plus size={18} /> New Ticket
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-emerald-primary/20 border-t-emerald-primary rounded-full animate-spin"></div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="relative overflow-hidden bg-surface-card p-12 rounded-2xl shadow-xl border border-border-subtle text-center">
          <div className="absolute inset-0 bg-linear-to-b from-emerald-primary/5 to-transparent pointer-events-none" />
          <div className="w-20 h-20 mx-auto bg-surface-main border border-border-subtle rounded-3xl flex items-center justify-center mb-6 shadow-inner relative z-10">
            <MessageSquare size={40} className="text-text-muted drop-shadow-md" />
          </div>
          <h2 className="text-2xl font-bold text-text-main mb-3 relative z-10">No Support Tickets</h2>
          <p className="text-text-secondary max-w-md mx-auto mb-8 relative z-10">
            You don't have any active or past support tickets. If you're experiencing an issue or have a question, let us know!
          </p>
          <Button onClick={() => setShowModal(true)} className="relative z-10 bg-surface-main hover:bg-surface-hover border border-border-subtle text-text-main px-8 py-2.5 rounded-full shadow-md hover:border-emerald-primary/50 transition-all">
            Create your first ticket
          </Button>
        </div>
      ) : (
        <div className="bg-surface-card rounded-2xl shadow-xl border border-border-subtle overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-hover border-b border-border-subtle">
                <th className="p-5 font-bold text-xs uppercase tracking-wider text-text-muted">Ticket ID</th>
                <th className="p-5 font-bold text-xs uppercase tracking-wider text-text-muted">Subject</th>
                <th className="p-5 font-bold text-xs uppercase tracking-wider text-text-muted">Status</th>
                <th className="p-5 font-bold text-xs uppercase tracking-wider text-text-muted text-right">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {tickets.map(ticket => (
                <tr key={ticket._id} className="hover:bg-surface-hover/50 transition-colors group">
                  <td className="p-5">
                    <Link to={`/tickets/${ticket._id}`} className="text-emerald-primary font-mono text-sm font-bold group-hover:underline">
                      {ticket.ticketReference}
                    </Link>
                  </td>
                  <td className="p-5">
                    <Link to={`/tickets/${ticket._id}`} className="block text-text-main font-semibold mb-1 group-hover:text-emerald-primary transition-colors">
                      {ticket.subject}
                    </Link>
                    <span className="text-xs font-medium text-text-muted uppercase tracking-wider">{ticket.category}</span>
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full ${getStatusColor(ticket.status)} border ${getStatusColor(ticket.status).includes('emerald') ? 'border-emerald-primary/30' : 'border-transparent'}`}>
                      {ticket.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-5 text-sm font-medium text-text-secondary flex flex-col items-end justify-center h-full pt-6">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-text-muted" /> 
                      {new Date(ticket.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
          <div className="bg-surface-card border border-border-subtle rounded-2xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <h2 className="text-2xl font-black text-text-main mb-6">Create Support Ticket</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Category</label>
                <select 
                  className="w-full bg-surface-main border border-border-subtle rounded-xl px-4 py-3 text-text-main focus:border-emerald-primary focus:ring-1 focus:ring-emerald-primary outline-none transition-all cursor-pointer" 
                  value={form.category} 
                  onChange={e => setForm({...form, category: e.target.value})}
                >
                  <option className="bg-surface-main text-text-main">General</option>
                  <option className="bg-surface-main text-text-main">Technical Issue</option>
                  <option className="bg-surface-main text-text-main">Billing</option>
                  <option className="bg-surface-main text-text-main">Feature Request</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Subject</label>
                <input 
                  required 
                  className="w-full bg-surface-main border border-border-subtle rounded-xl px-4 py-3 text-text-main focus:border-emerald-primary focus:ring-1 focus:ring-emerald-primary outline-none transition-all placeholder-text-muted" 
                  value={form.subject} 
                  onChange={e => setForm({...form, subject: e.target.value})}
                  placeholder="Brief description of the issue"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Description</label>
                <textarea 
                  required 
                  className="w-full bg-surface-main border border-border-subtle rounded-xl px-4 py-3 text-text-main focus:border-emerald-primary focus:ring-1 focus:ring-emerald-primary outline-none transition-all min-h-35 resize-y placeholder-text-muted" 
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Provide detailed information to help us resolve this..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle mt-6">
                <Button variant="secondary" type="button" onClick={() => setShowModal(false)} className="px-6 rounded-full">Cancel</Button>
                <Button type="submit" className="px-6 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]">Submit Ticket</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
