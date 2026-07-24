import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await API.get('/volunteers/tasks');
        if (res.data.success) setTasks(res.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchTasks();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div></div>;

  const assigned = tasks.filter(t => t.status === 'matched').length;
  const completed = tasks.filter(t => t.status === 'delivered').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, <span className="text-primary-500">{user?.name}</span> 🚴</h1>
      <p className="text-gray-500 mb-8">Manage your pickup and delivery tasks</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Assigned', value: assigned, icon: '📋', color: 'from-blue-500 to-cyan-400' },
          { label: 'In Progress', value: tasks.filter(t=>t.status==='picked_up').length, icon: '🚚', color: 'from-purple-500 to-violet-400' },
          { label: 'Completed', value: completed, icon: '✅', color: 'from-secondary-500 to-emerald-400' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500">{c.label}</p><p className="text-3xl font-bold text-gray-900 mt-1">{c.value}</p></div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-xl shadow-lg`}>{c.icon}</div>
            </div>
          </div>
        ))}
      </div>
      <Link to="/volunteer/tasks" className="bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl p-6 text-white shadow-lg card-hover block">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-2xl">📋</div>
          <div><h3 className="text-xl font-bold">View My Tasks</h3><p className="text-white/80 text-sm">Accept, update, and manage delivery tasks</p></div>
        </div>
      </Link>
    </div>
  );
};

export default VolunteerDashboard;
