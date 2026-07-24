import { useState, useEffect } from 'react';
import API from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';

const AllDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchDonations();
  }, [filter]);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const url = filter === 'all' ? '/donations' : `/donations?status=${filter}`;
      const res = await API.get(url);
      if (res.data.success) {
        // Handle pagination response vs list response depending on backend setup
        const data = Array.isArray(res.data.data) ? res.data.data : res.data.data.donations || [];
        setDonations(data);
      }
    } catch (err) {
      toast.error('Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  };

  const autoMatch = async (id) => {
    try {
      const res = await API.post(`/match/${id}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Successfully matched!');
        fetchDonations();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to auto-match');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Donations</h1>
          <p className="text-gray-500 mt-1">Manage and monitor all platform donations</p>
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="status-filter" className="text-sm text-gray-600 font-medium">Filter:</label>
          <select 
            id="status-filter"
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="matched">Matched</option>
            <option value="picked_up">Picked Up</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Food / ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Donor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Volunteer / Recipient</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent mx-auto"></div></td></tr>
              ) : donations.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-12 text-gray-500">No donations found</td></tr>
              ) : (
                donations.map((d) => (
                  <tr key={d._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{d.foodType}</div>
                      <div className="text-xs text-gray-500 mt-1">{d.quantity}</div>
                      <div className="text-[10px] text-gray-400 mt-1" title={d._id}>{d._id.slice(-6)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{d.donor?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{d.donor?.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <span className="text-gray-500">V: </span> 
                        {d.matchedVolunteer ? <span className="text-gray-900">{d.matchedVolunteer.name}</span> : <span className="text-gray-400 italic">None</span>}
                      </div>
                      <div className="text-sm mt-1">
                        <span className="text-gray-500">R: </span> 
                        {d.matchedRecipient ? <span className="text-gray-900">{d.matchedRecipient.name}</span> : <span className="text-gray-400 italic">None</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(d.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {d.status === 'pending' && (
                        <button 
                          onClick={() => autoMatch(d._id)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium text-xs rounded-lg transition-colors"
                        >
                          Auto Match
                        </button>
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
};

export default AllDonations;
