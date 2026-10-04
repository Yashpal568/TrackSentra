import { useEffect, useState } from 'react';
import { api } from '../lib/axios';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Clock } from 'lucide-react';

interface Ticket {
  _id: string;
  ticketReference: string;
  subject: string;
  category: string;
  status: string;
  companyId: { _id: string, name: string };
  updatedAt: string;
}

export const AdminTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const { data } = await api.get('/tickets/admin');
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
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-text-main">Admin Tickets</h1>
      </div>

      {loading ? (
        <p className="text-text-secondary">Loading...</p>
      ) : tickets.length === 0 ? (
        <Card className="p-8 text-center text-text-secondary">
          <p>No tickets found in the system.</p>
        </Card>
      ) : (
        <div className="bg-surface-card rounded-lg shadow-sm border border-border-subtle overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-hover border-b">
                <th className="p-4 font-semibold text-sm text-gray-600">ID</th>
                <th className="p-4 font-semibold text-sm text-gray-600">Company</th>
                <th className="p-4 font-semibold text-sm text-gray-600">Subject</th>
                <th className="p-4 font-semibold text-sm text-gray-600">Status</th>
                <th className="p-4 font-semibold text-sm text-gray-600">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => (
                <tr key={ticket._id} className="border-b last:border-0 hover:bg-surface-hover transition-colors">
                  <td className="p-4">
                    <Link to={`/admin/tickets/${ticket._id}`} className="text-emerald-primary font-medium hover:underline">
                      {ticket.ticketReference}
                    </Link>
                  </td>
                  <td className="p-4 text-sm font-medium text-text-main">
                    {ticket.companyId?.name || 'Unknown'}
                  </td>
                  <td className="p-4">
                    <Link to={`/admin/tickets/${ticket._id}`} className="flex text-text-main font-medium truncate max-w-62.5">
                      {ticket.subject}
                    </Link>
                    <span className="text-xs text-text-secondary">{ticket.category}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-text-secondary flex items-center gap-1">
                    <Clock size={14} /> {new Date(ticket.updatedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
