import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { FiUser, FiLock, FiSave, FiTruck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../utils/api';
import { getMe } from '../../store/slices/authSlice';

const AdminSettings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Delivery Threshold & 5 Locations Configuration State
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(1000);
  const [freeDeliveryLocations, setFreeDeliveryLocations] = useState(['', '', '', '', '']);
  const [deliveryLoading, setDeliveryLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        if (data.success && data.settings) {
          setFreeDeliveryThreshold(data.settings.freeDeliveryThreshold ?? 1000);
          const locs = data.settings.freeDeliveryLocations || [];
          const paddedLocs = [...locs, '', '', '', '', ''].slice(0, 5);
          setFreeDeliveryLocations(paddedLocs);
        }
      } catch (err) {
        toast.error('Failed to load delivery settings.');
      }
    };
    fetchSettings();
  }, []);

  const handleDeliverySubmit = async (e) => {
    e.preventDefault();
    try {
      setDeliveryLoading(true);
      const filteredLocations = freeDeliveryLocations
        .map(loc => loc.trim())
        .filter(loc => loc !== '');

      const res = await api.put('/settings', {
        freeDeliveryThreshold,
        freeDeliveryLocations: filteredLocations,
      });

      if (res.data.success) {
        toast.success('Free delivery configuration updated successfully!');
        setFreeDeliveryThreshold(res.data.settings.freeDeliveryThreshold);
        const locs = res.data.settings.freeDeliveryLocations || [];
        setFreeDeliveryLocations([...locs, '', '', '', '', ''].slice(0, 5));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update delivery settings.');
    } finally {
      setDeliveryLoading(false);
    }
  };

  // Handlers
  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      const res = await api.put('/users/profile', profileData);
      if (res.data.success) {
        toast.success('Profile updated successfully!');
        dispatch(getMe()); // Update Redux state with new user info
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('New passwords do not match!');
    }
    try {
      setPasswordLoading(true);
      const res = await api.put('/auth/update-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (res.data.success) {
        toast.success('Password updated successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Settings — Kurti Elegance Admin</title>
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>
        <p className="text-gray-400 text-sm mt-0.5">Manage your admin profile and security preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <FiUser size={18} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-gray-800 font-bold">Profile Details</h3>
              <p className="text-gray-400 text-xs">Update your personal information</p>
            </div>
          </div>
          
          <div className="p-5">
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all text-sm"
                  placeholder="Enter your name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
                  disabled
                />
                <p className="text-xs text-gray-400 mt-1.5">Email address cannot be changed.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all text-sm"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-medium transition-colors disabled:opacity-70"
                >
                  {profileLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiSave size={16} /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Password Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-fit">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <FiLock size={18} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-gray-800 font-bold">Security</h3>
              <p className="text-gray-400 text-xs">Update your account password</p>
            </div>
          </div>
          
          <div className="p-5">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm"
                  placeholder="Enter current password"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm"
                  placeholder="Enter new password"
                  required
                  minLength="6"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm"
                  placeholder="Confirm new password"
                  required
                  minLength="6"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-colors disabled:opacity-70"
                >
                  {passwordLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiLock size={16} /> Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Free Delivery Configuration */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden lg:col-span-2 mt-6">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
            <FiTruck size={18} className="text-yellow-600" />
          </div>
          <div>
            <h3 className="text-gray-800 font-bold">Free Delivery Configuration</h3>
            <p className="text-gray-400 text-xs">Manage minimum purchase threshold and eligible locations</p>
          </div>
        </div>
        
        <div className="p-5">
          <form onSubmit={handleDeliverySubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Threshold */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Minimum Purchase Threshold (₹)
                  </label>
                  <input
                    type="number"
                    value={freeDeliveryThreshold}
                    onChange={(e) => setFreeDeliveryThreshold(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all text-sm"
                    placeholder="e.g. 1000"
                    min="0"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1.5">
                    Free delivery will apply only when products' combined price meets or exceeds this value.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={deliveryLoading}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-medium transition-colors disabled:opacity-70"
                  >
                    {deliveryLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <FiSave size={16} /> Save Delivery Rules
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column: 5 Locations */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Eligible Cities / Locations (Maximum 5)
                </label>
                <p className="text-xs text-gray-400 -mt-2">
                  Free shipping is exclusively restricted to these specified places when the threshold is met.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <div key={index} className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold font-mono">
                        #{index + 1}
                      </span>
                      <input
                        type="text"
                        value={freeDeliveryLocations[index] || ''}
                        onChange={(e) => {
                          const newLocations = [...freeDeliveryLocations];
                          newLocations[index] = e.target.value;
                          setFreeDeliveryLocations(newLocations.slice(0, 5));
                        }}
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all text-sm"
                        placeholder="Enter city name"
                      />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
