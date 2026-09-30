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
      const { data } = await api.get('/api/tickets');
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
      await api.post('/api/tickets', form);
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
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Support Tickets</h1>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
          <Plus size={16} /> New Ticket
        </Button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : tickets.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          <MessageSquare className="mx-auto w-12 h-12 text-gray-300 mb-4" />
          <p>No support tickets found.</p>
          <Button variant="secondary" onClick={() => setShowModal(true)} className="mt-4">Create your first ticket</Button>
        </Card>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-4 font-semibold text-sm text-gray-600">ID</th>
                <th className="p-4 font-semibold text-sm text-gray-600">Subject</th>
                <th className="p-4 font-semibold text-sm text-gray-600">Status</th>
                <th className="p-4 font-semibold text-sm text-gray-600">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => (
                <tr key={ticket._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <Link to={`/tickets/${ticket._id}`} className="text-blue-600 font-medium hover:underline">
                      {ticket.ticketReference}
                    </Link>
                  </td>
                  <td className="p-4">
                    <Link to={`/tickets/${ticket._id}`} className="block text-gray-900 font-medium">
                      {ticket.subject}
                    </Link>
                    <span className="text-xs text-gray-500">{ticket.category}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500 flex items-center gap-1">
                    <Clock size={14} /> {new Date(ticket.updatedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Create Support Ticket</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select 
                  className="w-full border p-2 rounded" 
                  value={form.category} 
                  onChange={e => setForm({...form, category: e.target.value})}
                >
                  <option>General</option>
                  <option>Technical Issue</option>
                  <option>Billing</option>
                  <option>Feature Request</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input 
                  required 
                  className="w-full border p-2 rounded" 
                  value={form.subject} 
                  onChange={e => setForm({...form, subject: e.target.value})}
                  placeholder="Brief description of the issue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  required 
                  className="w-full border p-2 rounded min-h-[120px]" 
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Provide detailed information..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit">Submit Ticket</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
