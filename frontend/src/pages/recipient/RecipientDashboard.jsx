import { useState, useEffect } from 'react';
import API from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const RecipientDashboard = () => {
  const { user } = useAuth();
  const [allDonations, setAllDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available'); // 'available' | 'claimed'
  const [requestingId, setRequestingId] = useState(null);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const res = await API.get('/donations');
      if (res.data.success) {
        const list = Array.isArray(res.data.data) ? res.data.data : res.data.data.donations || [];
        setAllDonations(list);
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not load donations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [user]);

  const userId = String(user?._id || user?.id || '');

  // Filter available donor food (status is 'pending' or 'matched' without a recipient, not claimed by current user)
  const availableDonations = allDonations.filter((d) => {
    const recId = String(d.matchedRecipient?._id || d.matchedRecipient || '');
    if (recId === userId) return false;
    if (recId && recId !== userId) return false;
    return ['pending', 'matched'].includes(d.status);
  });

  // Filter claimed/matched food for this recipient
  const claimedDonations = allDonations.filter((d) => {
    const recId = String(d.matchedRecipient?._id || d.matchedRecipient || '');
    return d.matchedRecipient && recId === userId;
  });

  const handleRequestFood = async (id, foodType) => {
    try {
      setRequestingId(id);
      const res = await API.put(`/donations/${id}/request`);
      if (res.data.success) {
        toast.success(`Successfully requested "${foodType}"!`);
        await fetchDonations();
        setActiveTab('claimed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request food');
    } finally {
      setRequestingId(null);
    }
  };

  const confirmReceipt = async (id) => {
    try {
      await API.put(`/donations/${id}/status`, { status: 'delivered' });
      toast.success('Receipt confirmed!');
      await fetchDonations();
    } catch (err) {
      toast.error('Failed to confirm receipt');
    }
  };

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'N/A';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, <span className="text-primary-500">{user?.name}</span> 🏠
          </h1>
          <p className="text-gray-500 mt-1">Browse available food options from donors or manage your requested food</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover">
          <p className="text-sm font-medium text-gray-500">Available Food Options</p>
          <p className="text-3xl font-bold text-primary-600 mt-1">{availableDonations.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover">
          <p className="text-sm font-medium text-gray-500">My Requested / In-Transit</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">
            {claimedDonations.filter((d) => ['matched', 'picked_up'].includes(d.status)).length}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover">
          <p className="text-sm font-medium text-gray-500">Successfully Received</p>
          <p className="text-3xl font-bold text-secondary-600 mt-1">
            {claimedDonations.filter((d) => d.status === 'delivered').length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 gap-8">
        <button
          onClick={() => setActiveTab('available')}
          className={`pb-4 text-base font-semibold transition-all relative ${
            activeTab === 'available'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🍲 Select Available Donor Food ({availableDonations.length})
        </button>
        <button
          onClick={() => setActiveTab('claimed')}
          className={`pb-4 text-base font-semibold transition-all relative ${
            activeTab === 'claimed'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📦 My Requested / Incoming Food ({claimedDonations.length})
        </button>
      </div>

      {/* TAB 1: Available Donor Food Options */}
      {activeTab === 'available' && (
        <>
          {availableDonations.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="text-5xl mb-4">🍲</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No available food options right now</h3>
              <p className="text-gray-500">New surplus food postings from donors will appear here live.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableDonations.map((d) => (
                <div
                  key={d._id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <h3 className="text-lg font-bold text-gray-900">{d.foodType}</h3>
                      <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                        Available
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 space-y-2 mb-4">
                      <p>
                        <span className="font-semibold text-gray-700">Quantity:</span> {d.quantity}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-700">Donor:</span> {d.donor?.name || 'Anonymous Donor'}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-700">Pickup Address:</span> {d.pickupAddress}
                      </p>
                      {d.description && (
                        <p className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded-lg">"{d.description}"</p>
                      )}
                      <p className="text-xs text-gray-400">
                        Posted: {formatDate(d.createdAt)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRequestFood(d._id, d.foodType)}
                    disabled={requestingId === d._id}
                    className="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {requestingId === d._id ? (
                      <span>Requesting...</span>
                    ) : (
                      <>
                        <span>🍲</span>
                        <span>Select & Request This Food</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 2: My Requested / Incoming Food */}
      {activeTab === 'claimed' && (
        <>
          {claimedDonations.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="text-5xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No requested food items yet</h3>
              <p className="text-gray-500">Switch to "Select Available Donor Food" tab to request food options from donors.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {claimedDonations.map((d) => (
                <div key={d._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{d.foodType}</h3>
                        <StatusBadge status={d.status} />
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">Quantity:</span> {d.quantity}
                        </p>
                        <p>
                          <span className="font-medium">Donor:</span> {d.donor?.name || 'Unknown'}
                        </p>
                        <p>
                          <span className="font-medium">Volunteer:</span> {d.matchedVolunteer?.name || 'Pending assignment'}
                        </p>
                        <p>
                          <span className="font-medium">Requested On:</span> {formatDate(d.updatedAt || d.createdAt)}
                        </p>
                      </div>
                    </div>
                    {d.status === 'picked_up' && (
                      <button
                        onClick={() => confirmReceipt(d._id)}
                        className="px-6 py-3 bg-secondary-600 hover:bg-secondary-700 text-white font-medium rounded-xl transition-colors shadow-sm"
                      >
                        ✅ Confirm Receipt & Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RecipientDashboard;
