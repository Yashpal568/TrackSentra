import React, { useEffect, useState } from 'react';
import { api } from '../lib/axios';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ArrowLeft, UserCircle, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface TicketDetails {
  _id: string;
  ticketReference: string;
  subject: string;
  description: string;
  status: string;
  category: string;
  createdAt: string;
  creatorId: { _id: string, firstName: string, lastName: string };
  assigneeId?: { firstName: string, lastName: string };
}

interface Reply {
  _id: string;
  content: string;
  createdAt: string;
  authorId: { _id: string, firstName: string, lastName: string, role: string };
}

export const SupportTicketDetails = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    try {
      // Determine if admin or customer
      const url = user?.role === 'SUPER_ADMIN' ? `/api/tickets/admin/${id}` : `/api/tickets/${id}`;
      const { data } = await api.get(url);
      setTicket(data.ticket);
      setReplies(data.replies);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim()) return;
    
    try {
      const url = user?.role === 'SUPER_ADMIN' ? `/api/tickets/admin/${id}/replies` : `/api/tickets/${id}/replies`;
      await api.post(url, { content: newReply });
      setNewReply('');
      fetchDetails();
    } catch (err) {
      console.error(err);
      alert('Failed to send reply');
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!ticket) return <p className="p-6 text-red-500">Ticket not found.</p>;

  const backUrl = user?.role === 'SUPER_ADMIN' ? '/admin/tickets' : '/tickets';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Link to={backUrl} className="text-emerald-primary hover:underline flex items-center gap-1 mb-4">
        <ArrowLeft size={16} /> Back to Tickets
      </Link>
      
      <div className="bg-surface-card rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-xs font-bold text-text-secondary tracking-wider uppercase">{ticket.ticketReference} • {ticket.category}</span>
            <h1 className="text-2xl font-bold mt-1 text-text-main">{ticket.subject}</h1>
          </div>
          <span className="px-3 py-1 bg-surface-hover text-text-main font-semibold rounded-full text-sm">
            {ticket.status.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="prose max-w-none text-gray-700 whitespace-pre-wrap pb-6 border-b">
          {ticket.description}
        </div>
        
        <div className="pt-4 text-sm text-text-secondary flex gap-4">
          <span>Opened by: {ticket.creatorId.firstName} {ticket.creatorId.lastName}</span>
          {ticket.assigneeId && <span>Assigned to: {ticket.assigneeId.firstName} {ticket.assigneeId.lastName}</span>}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg flex items-center gap-2"><MessageSquare size={20} /> Conversation</h3>
        
        {replies.map(reply => {
          const isMe = reply.authorId._id === user?.id;
          const isStaff = reply.authorId.role === 'SUPER_ADMIN';
          return (
            <div key={reply._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-4 ${isMe ? 'bg-blue-50 border border-blue-100' : isStaff ? 'bg-orange-50 border border-orange-100' : 'bg-surface-hover border border-border-subtle'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <UserCircle size={16} className={isStaff ? 'text-orange-500' : 'text-text-secondary'} />
                  <span className="font-semibold text-sm">
                    {reply.authorId.firstName} {reply.authorId.lastName}
                    {isStaff && <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">Support Staff</span>}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">{new Date(reply.createdAt).toLocaleString()}</span>
                </div>
                <div className="text-text-main whitespace-pre-wrap">{reply.content}</div>
              </div>
            </div>
          );
        })}
      </div>

      {ticket.status !== 'RESOLVED' && (
        <Card className="p-6">
          <form onSubmit={handleReply}>
            <textarea 
              className="w-full border rounded-lg p-3 min-h-[100px] mb-4 focus:ring-2 focus:ring-emerald-primary outline-none"
              placeholder="Type your reply here..."
              value={newReply}
              onChange={e => setNewReply(e.target.value)}
            />
            <div className="flex justify-end">
              <Button type="submit">Send Reply</Button>
            </div>
          </form>
        </Card>
      )}
      
      {ticket.status === 'RESOLVED' && (
        <div className="text-center p-6 bg-surface-hover text-text-secondary rounded-lg">
          This ticket has been resolved and is closed to new replies.
        </div>
      )}
    </div>
  );
};
