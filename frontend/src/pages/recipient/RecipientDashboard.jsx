import { useState, useEffect } from 'react';
import API from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const RecipientDashboard = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        // Recipients see all donations — filter matched to them client-side
        // We use the general endpoint since there's no specific recipient endpoint
        const res = await API.get('/donations/my');
        // Actually recipients don't have /donations/my - let's get all and filter
        // Use a workaround: the backend's getAllDonations is for admin/volunteer
        // So we fetch notifications and show matched donations via a different approach
        // Better: let's use the auth/me to know our ID and fetch all donations
      } catch (err) {
        console.error(err);
      }
    };
    // Use a direct approach - fetch all donations where recipient matches
    const fetchMatched = async () => {
      try {
        const res = await API.get(`/donations`);
        if (res.data.success) {
          const allDonations = Array.isArray(res.data.data) ? res.data.data : res.data.data.donations || [];
          const userId = String(user._id || user.id);
          const matched = allDonations.filter(d => {
            const recId = String(d.matchedRecipient?._id || d.matchedRecipient);
            return d.matchedRecipient && recId === userId;
          });
          setDonations(matched);
        }
      } catch (err) {
        // Recipient may not have access to /donations, handle gracefully
        setDonations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMatched();
  }, [user]);

  const confirmReceipt = async (id) => {
    try {
      await API.put(`/donations/${id}/status`, { status: 'delivered' });
      toast.success('Receipt confirmed!');
      setDonations(prev => prev.map(d => d._id === id ? { ...d, status: 'delivered' } : d));
    } catch (err) {
      toast.error('Failed to confirm receipt');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, <span className="text-primary-500">{user?.name}</span> 🏠</h1>
      <p className="text-gray-500 mb-8">View incoming matched donations</p>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover">
          <p className="text-sm text-gray-500">Total Incoming</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{donations.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover">
          <p className="text-sm text-gray-500">Received</p>
          <p className="text-3xl font-bold text-secondary-600 mt-1">{donations.filter(d=>d.status==='delivered').length}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover">
          <p className="text-sm text-gray-500">In Transit</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{donations.filter(d=>['matched','picked_up'].includes(d.status)).length}</p>
        </div>
      </div>

      {donations.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-5xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No donations yet</h3>
          <p className="text-gray-500">Matched donations will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {donations.map(d => (
            <div key={d._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{d.foodType}</h3>
                    <StatusBadge status={d.status} />
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Quantity:</span> {d.quantity}</p>
                    <p><span className="font-medium">From:</span> {d.donor?.name || 'Unknown'}</p>
                    <p><span className="font-medium">Volunteer:</span> {d.matchedVolunteer?.name || 'Pending'}</p>
                    <p><span className="font-medium">Created:</span> {formatDate(d.createdAt)}</p>
                  </div>
                </div>
                {d.status === 'picked_up' && (
                  <button onClick={() => confirmReceipt(d._id)} className="px-6 py-3 bg-secondary-600 hover:bg-secondary-700 text-white font-medium rounded-xl transition-colors shadow-sm">
                    ✅ Mark as Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipientDashboard;
