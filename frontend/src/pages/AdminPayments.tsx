import { useEffect, useState } from 'react';
import { api } from '../lib/axios';

export function AdminPayments() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data } = await api.get('/subscriptions/payments');
      setSubmissions(data.submissions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const reason = status === 'REJECTED' ? prompt('Enter rejection reason:') : undefined;
    if (status === 'REJECTED' && !reason) return;

    try {
      await api.post(`/subscriptions/payments/${id}/verify`, { status, rejectionReason: reason });
      fetchSubmissions();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Verification failed');
    }
  };

  if (loading) return <div>Loading payments...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-text-main">Verify Payments</h1>
      
      <div className="bg-surface-card rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-surface-hover">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Reference</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-surface-card divide-y divide-gray-200">
            {submissions.map(sub => (
              <tr key={sub._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-main">{sub.companyId?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">${(sub.expectedAmount / 100).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{sub.transactionReference}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    sub.status === 'APPROVED' ? 'bg-emerald-primary/20 text-emerald-primary' :
                    sub.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {sub.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {sub.status === 'PENDING' && (
                    <>
                      <button onClick={() => handleVerify(sub._id, 'APPROVED')} className="text-emerald-primary hover:text-green-900 mr-4">Approve</button>
                      <button onClick={() => handleVerify(sub._id, 'REJECTED')} className="text-red-600 hover:text-red-900">Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
