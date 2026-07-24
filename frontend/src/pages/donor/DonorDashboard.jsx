import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const DonorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, delivered: 0, pending: 0 });
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get('/donations/my');
        if (res.data.success) {
          const donations = res.data.data;
          setRecentDonations(donations.slice(0, 5));
          setStats({
            total: donations.length,
            delivered: donations.filter((d) => d.status === 'delivered').length,
            pending: donations.filter((d) => d.status === 'pending').length,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, <span className="text-primary-500">{user?.name}</span> 👋
        </h1>
        <p className="text-gray-500 mt-1">Manage your food donations and track their impact</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Donations', value: stats.total, icon: '📦', color: 'from-primary-500 to-orange-400' },
          { label: 'Delivered', value: stats.delivered, icon: '✅', color: 'from-secondary-500 to-emerald-400' },
          { label: 'Pending', value: stats.pending, icon: '⏳', color: 'from-yellow-500 to-amber-400' },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-xl shadow-lg`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          to="/donor/new"
          className="bg-gradient-to-r from-primary-500 to-orange-400 rounded-2xl p-6 text-white shadow-lg shadow-primary-500/25 card-hover block"
          id="new-donation-link"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
              ➕
            </div>
            <div>
              <h3 className="text-xl font-bold">New Donation</h3>
              <p className="text-white/80 text-sm">Submit a new food donation</p>
            </div>
          </div>
        </Link>
        <Link
          to="/donor/my"
          className="bg-gradient-to-r from-secondary-600 to-emerald-500 rounded-2xl p-6 text-white shadow-lg shadow-secondary-600/25 card-hover block"
          id="my-donations-link"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
              📋
            </div>
            <div>
              <h3 className="text-xl font-bold">My Donations</h3>
              <p className="text-white/80 text-sm">View all your past donations</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Donations */}
      {recentDonations.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Recent Donations</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentDonations.map((d) => (
              <div key={d._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium text-gray-800">{d.foodType}</p>
                  <p className="text-sm text-gray-500">{d.quantity} • {d.pickupAddress}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    d.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    d.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    d.status === 'matched' ? 'bg-blue-100 text-blue-800' :
                    d.status === 'picked_up' ? 'bg-purple-100 text-purple-800' :
                    'bg-red-100 text-red-800'
                  }`}
                >
                  {d.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorDashboard;
