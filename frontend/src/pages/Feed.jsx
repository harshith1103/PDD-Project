import { useState, useEffect } from 'react';
import API from '../api/axios';
import { Link } from 'react-router-dom';

const Feed = () => {
  const [feedData, setFeedData] = useState({ pending: [], completed: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchFeed = async () => {
    try {
      const res = await API.get('/donations/public-feed');
      if (res.data.success) {
        setFeedData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch public feed', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Community <span className="text-primary-500">Impact Board</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            See the live tasks available for volunteers and the positive impact being made in our community right now.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Active Tasks Column */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b-2 border-primary-100 pb-3">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-2xl">🚨</span> Tasks to be Done
              </h2>
              <span className="bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1 rounded-full">
                {feedData.pending.length} Active
              </span>
            </div>

            {feedData.pending.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                No active tasks at the moment.
              </div>
            ) : (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                {feedData.pending.map((task) => (
                  <div
                    key={task._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">
                          {task.foodType} <span className="text-sm font-normal text-gray-500">({task.quantity})</span>
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                          <span>📍</span> {task.pickupAddress}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-4 pt-4 border-t border-gray-100">
                      <div className="text-gray-500">
                        Added by <span className="font-semibold text-gray-700">{task.donor?.name || 'Anonymous'}</span>
                      </div>
                      <div className="text-xs text-gray-400">{formatDate(task.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Impact Column */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b-2 border-secondary-100 pb-3">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-2xl">✅</span> Completed Tasks
              </h2>
              <span className="bg-secondary-100 text-secondary-700 text-xs font-bold px-3 py-1 rounded-full">
                {feedData.completed.length} Delivered
              </span>
            </div>

            {feedData.completed.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                Completed tasks will appear here.
              </div>
            ) : (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                {feedData.completed.map((task) => (
                  <div
                    key={task._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow relative overflow-hidden bg-gradient-to-r from-white to-secondary-50/30"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-secondary-500"></div>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-600">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg line-through text-opacity-70">
                          {task.foodType}
                        </h3>
                        <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <p>
                            <span className="font-semibold text-primary-600">{task.donor?.name || 'Anonymous'}</span>{' '}
                            donated and{' '}
                            <span className="font-semibold text-secondary-600">
                              {task.matchedVolunteer?.name || 'a volunteer'}
                            </span>{' '}
                            delivered!
                          </p>
                        </div>
                        <div className="text-xs text-gray-400 mt-3 text-right">{formatDate(task.updatedAt)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Feed;
