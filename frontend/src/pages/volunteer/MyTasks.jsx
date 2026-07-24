import { useState, useEffect } from 'react';
import API from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proofUrls, setProofUrls] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedRecipientId, setSelectedRecipientId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, availRes, recRes] = await Promise.all([
        API.get('/volunteers/tasks'),
        API.get('/volunteers/available-tasks'),
        API.get('/volunteers/recipients')
      ]);
      if (tasksRes.data.success) setTasks(tasksRes.data.data);
      if (availRes.data.success) setAvailableTasks(availRes.data.data);
      if (recRes.data.success) setRecipients(recRes.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptClick = async (task) => {
    // If recipient is already matched/requested by recipient
    const recipientId = task.matchedRecipient?._id || (typeof task.matchedRecipient === 'string' ? task.matchedRecipient : null);
    if (recipientId) {
      try {
        await API.put(`/volunteers/tasks/${task._id}/accept`, { recipientId });
        toast.success('Task accepted! Collect from donor & deliver to recipient.');
        fetchData();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to accept task');
      }
    } else {
      setSelectedTask(task);
      setSelectedRecipientId('');
      setShowModal(true);
    }
  };

  const confirmAccept = async () => {
    if (!selectedRecipientId) {
      toast.error('Please select a recipient');
      return;
    }
    try {
      await API.put(`/volunteers/tasks/${selectedTask._id}/accept`, { recipientId: selectedRecipientId });
      toast.success('Task accepted successfully!');
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept task');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/donations/${id}/status`, { status });
      toast.success(`Status updated to ${status.replace('_', ' ')}`);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
  };

  const submitProof = async (id) => {
    const url = proofUrls[id];
    if (!url) { toast.error('Please enter a proof URL'); return; }
    try {
      await API.post(`/donations/${id}/proof`, { proofOfDelivery: url });
      toast.success('Proof uploaded!');
      setProofUrls(prev => ({ ...prev, [id]: '' }));
      fetchData();
    } catch (err) { toast.error('Failed to upload proof'); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Available Tasks Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Delivery Tasks</h2>
        <p className="text-gray-500 mb-6">{availableTasks.length} task(s) waiting for a volunteer</p>
        
        {availableTasks.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-800">No available tasks right now</h3>
            <p className="text-gray-500 text-sm mt-1">Pending food donations and recipient requests will appear here live.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableTasks.map(task => (
              <div key={task._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{task.foodType}</h3>
                    <StatusBadge status={task.status} />
                  </div>
                  <div className="text-sm text-gray-600 mt-2 space-y-1.5">
                    <p><span className="font-medium text-gray-700">Quantity:</span> {task.quantity}</p>
                    <p><span className="font-medium text-gray-700">Donor:</span> {task.donor?.name || 'Donor'} ({task.donor?.phone || 'No phone'})</p>
                    <p><span className="font-medium text-gray-700">Pickup Address:</span> {task.pickupAddress}</p>
                    {task.matchedRecipient ? (
                      <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl text-blue-800 text-xs space-y-1">
                        <p className="font-semibold text-blue-900 flex items-center gap-1">
                          <span>🏠</span>
                          <span>Recipient Delivery Details:</span>
                        </p>
                        <p className="font-medium text-gray-900">{task.matchedRecipient.name} ({task.matchedRecipient.phone || 'No phone'})</p>
                        <p className="text-blue-700">Deliver To: {task.matchedRecipient.address}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No recipient selected yet (you can select upon accepting)</p>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => handleAcceptClick(task)}
                  className="mt-4 w-full px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <span>🚴</span>
                  <span>{task.matchedRecipient ? 'Accept Request & Deliver' : 'Accept Pickup Task'}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* My Assigned Tasks Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Assigned Tasks</h2>
        <p className="text-gray-500 mb-6">{tasks.length} task(s) assigned to you</p>

        {tasks.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No tasks assigned yet</h3>
            <p className="text-gray-500">Accepted pickup and delivery tasks will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map(task => (
              <div key={task._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{task.foodType}</h3>
                      <StatusBadge status={task.status} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                      <p><span className="font-medium">Quantity:</span> {task.quantity}</p>
                      <p><span className="font-medium">Pickup Address:</span> {task.pickupAddress}</p>
                      <p><span className="font-medium">Donor:</span> {task.donor?.name} ({task.donor?.phone || 'N/A'})</p>
                      <p><span className="font-medium">Recipient:</span> {task.matchedRecipient?.name || 'Pending'} — {task.matchedRecipient?.address || 'N/A'}</p>
                      <p><span className="font-medium">Created:</span> {formatDate(task.createdAt)}</p>
                    </div>
                    {task.proofOfDelivery && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">Proof of Delivery:</p>
                        <img src={task.proofOfDelivery} alt="Proof" className="w-32 h-24 object-cover rounded-lg border" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 min-w-[180px]">
                    {task.status === 'matched' && (
                      <button onClick={() => updateStatus(task._id, 'picked_up')} className="px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                        🚴 Picked Up From Donor
                      </button>
                    )}
                    {task.status === 'picked_up' && (
                      <button onClick={() => updateStatus(task._id, 'delivered')} className="px-4 py-2.5 bg-secondary-600 hover:bg-secondary-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                        ✅ Delivered to Recipient
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recipient Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Select Recipient</h2>
            <p className="text-sm text-gray-500 mb-4">Choose a recipient who is in need of this food.</p>
            
            <div className="mb-6 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
              {recipients.map(r => (
                <div 
                  key={r._id} 
                  onClick={() => setSelectedRecipientId(r._id)}
                  className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedRecipientId === r._id ? 'bg-primary-50 border-primary-200' : ''}`}
                >
                  <p className="font-semibold text-gray-800">{r.name}</p>
                  <p className="text-xs text-gray-500">{r.address}</p>
                </div>
              ))}
              {recipients.length === 0 && (
                <div className="p-4 text-center text-sm text-gray-500">No recipients found.</div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={confirmAccept}
                disabled={!selectedRecipientId}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyTasks;
