import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'donor',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    const trimmedEmail = formData.email.trim();
    const trimmedPhone = formData.phone.trim();

    // 1. Email format check (@gmail.com official format)
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
    if (!trimmedEmail) {
      newErrors.email = 'Email address is required';
    } else if (!gmailRegex.test(trimmedEmail)) {
      newErrors.email = 'Email must be an official @gmail.com address (e.g. user@gmail.com)';
    }

    // 2. Password length check (at least 6 characters)
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    // 3. Phone number check (10 digits if provided)
    const phoneRegex = /^\d{10}$/;
    if (trimmedPhone && !phoneRegex.test(trimmedPhone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits (e.g. 9876543210)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await API.post('/auth/register', {
        ...formData,
        email: trimmedEmail,
        phone: trimmedPhone,
      });
      if (res.data.success) {
        toast.success('Registration successful!');
        const { token, user } = res.data.data || {};
        if (token && user) {
          login(token, user);
          const roleRoutes = {
            donor: '/donor',
            volunteer: '/volunteer',
            recipient: '/recipient',
            admin: '/admin',
          };
          navigate(roleRoutes[user.role] || '/');
        } else {
          navigate('/login');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-green-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-3xl">🍲</span>
            <span className="text-2xl font-bold gradient-text">Annadaan Connect</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
          <p className="text-gray-500 mt-1">Join the food redistribution movement</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-gray-800"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address (@gmail.com)
              </label>
              <input
                type="email"
                id="reg-email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all text-gray-800 ${
                  errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-primary-500'
                }`}
                placeholder="you@gmail.com"
              />
              {errors.email ? (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              ) : (
                <p className="text-xs text-gray-400 mt-1">Must be an official @gmail.com address</p>
              )}
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                id="reg-password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all text-gray-800 ${
                  errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-primary-500'
                }`}
                placeholder="Min. 6 characters"
              />
              {errors.password ? (
                <p className="text-xs text-red-500 mt-1">{errors.password}</p>
              ) : (
                <p className="text-xs text-gray-400 mt-1">Must be at least 6 characters long</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                maxLength={10}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all text-gray-800 ${
                  errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-primary-500'
                }`}
                placeholder="10-digit mobile number (optional)"
              />
              {errors.phone ? (
                <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
              ) : (
                <p className="text-xs text-gray-400 mt-1">Must be exactly 10 digits</p>
              )}
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1.5">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-gray-800"
                placeholder="Your address"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1.5">
                I want to join as
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-gray-800 bg-white"
              >
                <option value="donor">🍲 Donor — Share surplus food</option>
                <option value="volunteer">🚴 Volunteer — Deliver food</option>
                <option value="recipient">🏠 Recipient — Receive food</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 transition-all mt-2"
              id="register-submit-btn"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
