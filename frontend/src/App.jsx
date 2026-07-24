import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';

// Donor pages
import DonorDashboard from './pages/donor/DonorDashboard';
import NewDonation from './pages/donor/NewDonation';
import MyDonations from './pages/donor/MyDonations';

// Volunteer pages
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';
import MyTasks from './pages/volunteer/MyTasks';

// Recipient pages
import RecipientDashboard from './pages/recipient/RecipientDashboard';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AllDonations from './pages/admin/AllDonations';
import UserManagement from './pages/admin/UserManagement';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/feed" element={<Feed />} />
          
          {/* Donor Routes */}
          <Route path="/donor" element={
            <RoleRoute allowedRoles={['donor']}>
              <DonorDashboard />
            </RoleRoute>
          } />
          <Route path="/donor/new" element={
            <RoleRoute allowedRoles={['donor']}>
              <NewDonation />
            </RoleRoute>
          } />
          <Route path="/donor/my" element={
            <RoleRoute allowedRoles={['donor']}>
              <MyDonations />
            </RoleRoute>
          } />

          {/* Volunteer Routes */}
          <Route path="/volunteer" element={
            <RoleRoute allowedRoles={['volunteer']}>
              <VolunteerDashboard />
            </RoleRoute>
          } />
          <Route path="/volunteer/tasks" element={
            <RoleRoute allowedRoles={['volunteer']}>
              <MyTasks />
            </RoleRoute>
          } />

          {/* Recipient Routes */}
          <Route path="/recipient" element={
            <RoleRoute allowedRoles={['recipient']}>
              <RecipientDashboard />
            </RoleRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <RoleRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </RoleRoute>
          } />
          <Route path="/admin/donations" element={
            <RoleRoute allowedRoles={['admin']}>
              <AllDonations />
            </RoleRoute>
          } />
          <Route path="/admin/users" element={
            <RoleRoute allowedRoles={['admin']}>
              <UserManagement />
            </RoleRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App;
