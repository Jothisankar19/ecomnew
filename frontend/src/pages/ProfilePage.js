import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  FiUser, FiMail, FiPhone, FiLock, FiCamera, FiSave,
  FiMapPin, FiPlus, FiTrash2, FiCheck, FiShoppingBag, FiHeart, FiSettings, FiCreditCard, FiArrowRight, FiShield
} from 'react-icons/fi';
import { updateUser } from '../store/slices/authSlice';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { formatPrice, getStatusColor, getStatusLabel } from '../utils/helpers';

const inputCls = 'w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-gray-800 placeholder-slate-300 text-sm focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10 transition-all font-medium';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [newAddress, setNewAddress] = useState({
    name: '', phone: '', addressLine1: '', addressLine2: '',
    city: '', state: '', pincode: '', country: 'India', isDefault: false
  });
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [addressFormLoading, setAddressFormLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  useEffect(() => {
    // Fetch recent orders for the dashboard view
    const fetchRecent = async () => {
       try {
         const { data } = await api.get('/orders/my-orders?limit=1');
         setRecentOrders(data.orders || []);
       } catch (err) { console.error(err); }
    }
    fetchRecent();
  }, []);

  const handleAvatarUpdate = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setAvatarLoading(true);
    try {
      const { data } = await api.put('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      dispatch(updateUser({ avatar: data.avatar }));
      toast.success('Profile picture updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload avatar');
    }
    setAvatarLoading(false);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/users/profile', profileForm);
      dispatch(updateUser(data.user));
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
    setLoading(false);
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.put('/auth/update-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    }
    setLoading(false);
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddressFormLoading(true);
    try {
      const { data } = await api.post('/users/address', newAddress);
      setAddresses(data.addresses);
      dispatch(updateUser({ addresses: data.addresses }));
      setShowAddressForm(false);
      setNewAddress({ name: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', country: 'India', isDefault: false });
      toast.success('Address added!');
    } catch (err) {
      toast.error('Failed to add address');
    }
    setAddressFormLoading(false);
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const { data } = await api.delete(`/users/address/${addressId}`);
      setAddresses(data.addresses);
      dispatch(updateUser({ addresses: data.addresses }));
      toast.success('Address removed');
    } catch (err) {
      toast.error('Failed to remove address');
    }
  };

  const tabs = [
    { id: 'profile', label: 'My Account', icon: FiUser, desc: 'Personal details & settings' },
    { id: 'addresses', label: 'Saved Addresses', icon: FiMapPin, desc: 'Shipping & billing locations' },
    { id: 'password', label: 'Security', icon: FiLock, desc: 'Password & authentication' },
    { id: 'payments', label: 'Payment Methods', icon: FiCreditCard, desc: 'Manage saved cards' },
  ];

  return (
    <>
      <Helmet>
        <title>Account Settings - Ethnic Elegance</title>
      </Helmet>

      <div className="pt-24 min-h-screen bg-[#FDF8F3] pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          
          <div className="flex flex-col md:flex-row gap-10">
            {/* Sidebar Navigation */}
            <div className="md:w-80 flex-shrink-0 space-y-8">
              
              {/* Profile Card */}
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500" />
                <div className="relative inline-block mb-6">
                  <div className={`w-28 h-28 rounded-full overflow-hidden border-4 border-slate-50 shadow-inner relative ${avatarLoading ? 'opacity-50' : ''}`}>
                     <img
                       src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${user?.name}&background=EAB308&color=fff&size=200`}
                       alt={user?.name}
                       className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                     />
                     {avatarLoading && (
                       <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                         <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                       </div>
                     )}
                  </div>
                  <label className="absolute bottom-1 right-1 w-9 h-9 bg-yellow-500 text-white rounded-2xl flex items-center justify-center hover:bg-yellow-600 transition-all shadow-lg border-2 border-white cursor-pointer active:scale-90">
                    <FiCamera size={16} />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleAvatarUpdate}
                      disabled={avatarLoading}
                    />
                  </label>
                </div>
                <h3 className="text-gray-900 font-black text-xl mb-1">{user?.name}</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{user?.email}</p>
                
                <div className="mt-6 flex justify-center gap-2">
                   {user?.isVerified && (
                     <span className="bg-green-50 text-green-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                       <FiShield size={10} /> Verified
                     </span>
                   )}
                   <span className="bg-yellow-50 text-yellow-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
                      Gold Member
                   </span>
                </div>
              </div>

              {/* Navigation Menu */}
              <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm flex md:flex-col overflow-x-auto no-scrollbar">
                {tabs.map(({ id, label, icon: Icon, desc }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex-shrink-0 md:w-full flex items-center gap-4 px-6 md:px-8 py-4 md:py-5 text-left transition-all border-r md:border-r-0 md:border-b border-slate-50 last:border-0 ${
                      activeTab === id
                         ? 'bg-yellow-500/5 border-b-2 md:border-b-0 md:border-l-4 border-yellow-500'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center transition-colors ${activeTab === id ? 'bg-yellow-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                       <Icon size={16} className="md:size-[18px]" />
                    </div>
                    <div>
                       <p className={`text-[10px] md:text-sm font-black uppercase tracking-widest ${activeTab === id ? 'text-gray-900' : 'text-slate-400'}`}>{label}</p>
                       <p className="hidden md:block text-[10px] font-medium text-slate-300 mt-0.5">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
              <AnimatePresence mode="wait">
                {activeTab === 'profile' && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                    {/* Recent Activity Dashboard */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-lg shadow-indigo-100">
                          <FiShoppingBag className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10" />
                          <h4 className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-4">Latest Order</h4>
                          {recentOrders.length > 0 ? (
                            <div>
                               <p className="text-2xl font-black mb-1">Order #{recentOrders[0].orderId}</p>
                               <p className="text-xs font-bold opacity-70 uppercase tracking-widest">{getStatusLabel(recentOrders[0].orderStatus)}</p>
                               <Link to="/orders" className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all">
                                  Track Details <FiArrowRight size={14} />
                               </Link>
                            </div>
                          ) : (
                            <p className="text-sm font-medium opacity-80">No orders placed yet. Start your journey with us!</p>
                          )}
                       </div>
                       
                       <div className="bg-rose-500 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-lg shadow-rose-100">
                          <FiHeart className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10" />
                          <h4 className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-4">Saved Favorites</h4>
                          <p className="text-2xl font-black mb-1">Your Wishlist</p>
                          <p className="text-sm font-medium opacity-80">Browse and manage the kurtis you love.</p>
                          <Link to="/wishlist" className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all">
                              Go to Wishlist <FiArrowRight size={14} />
                          </Link>
                       </div>
                    </div>

                    {/* Profile Form */}
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                      <h2 className="text-gray-900 font-black text-xl mb-8 flex items-center gap-3">
                        <FiSettings className="text-yellow-600" /> Account Settings
                      </h2>
                      <form onSubmit={handleProfileUpdate} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Full Name</label>
                            <div className="relative">
                              <FiUser className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                              <input
                                type="text"
                                value={profileForm.name}
                                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                className={`${inputCls} pl-14`}
                                placeholder="Your full name"
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Phone Number</label>
                            <div className="relative">
                              <FiPhone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                              <input
                                type="tel"
                                value={profileForm.phone}
                                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                className={`${inputCls} pl-14`}
                                placeholder="+91 00000 00000"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
                          <div className="relative">
                            <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                              type="email"
                              value={user?.email}
                              className={`${inputCls} pl-14 bg-slate-50/50 text-slate-400 cursor-not-allowed`}
                              disabled
                            />
                            <FiCheck className="absolute right-5 top-1/2 -translate-y-1/2 text-green-500" />
                          </div>
                        </div>

                        <button type="submit" disabled={loading} className="bg-yellow-500 hover:bg-yellow-600 text-white font-black px-10 py-4 rounded-2xl transition-all shadow-lg shadow-yellow-100 flex items-center gap-3">
                          <FiSave size={18} />
                          {loading ? 'Saving...' : 'Update Profile'}
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'addresses' && (
                  <motion.div
                    key="addresses"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                         <h2 className="text-gray-900 font-black text-2xl mb-1">Shipping Addresses</h2>
                         <p className="text-slate-400 text-sm font-medium">Manage your delivery locations</p>
                      </div>
                      <button
                        onClick={() => setShowAddressForm(!showAddressForm)}
                        className="bg-white border border-slate-200 text-gray-900 font-black text-sm px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
                      >
                        <FiPlus size={18} /> Add New
                      </button>
                    </div>

                    <AnimatePresence>
                      {showAddressForm && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-white rounded-[2.5rem] p-10 border border-yellow-200 shadow-xl shadow-yellow-100/20 mb-8">
                            <h3 className="text-gray-900 font-black text-lg mb-8 uppercase tracking-widest text-xs">Register New Address</h3>
                            <form onSubmit={handleAddAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <input placeholder="Receiver Name *" value={newAddress.name} onChange={e => setNewAddress({...newAddress, name: e.target.value})} className={inputCls} required />
                              <input placeholder="Receiver Phone *" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} className={inputCls} required />
                              <input placeholder="House / Flat / Area *" value={newAddress.addressLine1} onChange={e => setNewAddress({...newAddress, addressLine1: e.target.value})} className={`${inputCls} sm:col-span-2`} required />
                              <input placeholder="Landmark / Street" value={newAddress.addressLine2} onChange={e => setNewAddress({...newAddress, addressLine2: e.target.value})} className={`${inputCls} sm:col-span-2`} />
                              <input placeholder="City *" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className={inputCls} required />
                              <input placeholder="State *" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className={inputCls} required />
                              <input placeholder="Pincode *" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} className={inputCls} required />
                              <div className="flex gap-4 sm:col-span-2 mt-4">
                                <button type="submit" disabled={loading} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-yellow-100 transition-all">
                                  {loading ? 'Adding...' : 'Save Address'}
                                </button>
                                <button type="button" onClick={() => setShowAddressForm(false)} className="flex-1 bg-slate-50 text-slate-500 font-black py-4 rounded-2xl hover:bg-slate-100 transition-all">
                                  Dismiss
                                </button>
                              </div>
                            </form>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {addresses.length === 0 ? (
                        <div className="sm:col-span-2 bg-white rounded-[2.5rem] p-16 text-center border border-dashed border-slate-200">
                          <FiMapPin className="text-slate-200 mx-auto mb-4" size={48} />
                          <p className="text-slate-400 font-black text-sm uppercase tracking-widest">No addresses found</p>
                        </div>
                      ) : (
                        addresses.map((addr) => (
                          <div key={addr._id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative group hover:border-yellow-200 transition-all">
                            <div className="flex justify-between items-start mb-4">
                              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-yellow-50 group-hover:text-yellow-600 transition-colors">
                                 <FiMapPin size={22} />
                              </div>
                              <button onClick={() => handleDeleteAddress(addr._id)} className="w-9 h-9 rounded-xl bg-rose-50 text-rose-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white flex items-center justify-center">
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                            <div className="space-y-1">
                               <div className="flex items-center gap-2 mb-2">
                                  <p className="text-gray-900 font-black">{addr.name}</p>
                                  {addr.isDefault && <span className="bg-yellow-50 text-yellow-600 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">Default</span>}
                               </div>
                               <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2"><FiPhone size={10} /> {addr.phone}</p>
                               <p className="text-slate-500 text-sm font-medium mt-3 leading-relaxed">{addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'password' && (
                  <motion.div
                    key="password"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  >
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm max-w-2xl">
                      <h2 className="text-gray-900 font-black text-xl mb-2 flex items-center gap-3">
                        <FiLock className="text-yellow-600" /> Security Settings
                      </h2>
                      <p className="text-slate-400 text-sm font-medium mb-8">Keep your account secure with a strong password</p>
                      
                      <form onSubmit={handlePasswordUpdate} className="space-y-8">
                        {[
                          { label: 'Current Password', key: 'currentPassword' },
                          { label: 'New Password', key: 'newPassword' },
                          { label: 'Confirm New Password', key: 'confirmPassword' },
                        ].map(({ label, key }) => (
                          <div key={key} className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{label}</label>
                            <div className="relative">
                              <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                              <input
                                type="password"
                                value={passwordForm[key]}
                                onChange={(e) => setPasswordForm({ ...passwordForm, [key]: e.target.value })}
                                className={`${inputCls} pl-14`}
                                placeholder="••••••••"
                                required
                                minLength={key !== 'currentPassword' ? 6 : undefined}
                              />
                            </div>
                          </div>
                        ))}
                        <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-2xl shadow-xl transition-all">
                          {loading ? 'Updating...' : 'Change Password Now'}
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'payments' && (
                   <motion.div
                    key="payments"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-100 shadow-sm"
                   >
                      <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                         <FiCreditCard size={48} />
                      </div>
                      <h2 className="text-2xl font-black text-gray-900 mb-2">Saved Payments</h2>
                      <p className="text-slate-400 text-sm max-w-sm mx-auto mb-10">We currently don't store payment methods for your security. All transactions are handled securely via Razorpay.</p>
                      <Link to="/products" className="bg-yellow-500 hover:bg-yellow-600 text-white font-black px-10 py-4 rounded-2xl transition-all">
                        Continue Shopping
                      </Link>
                   </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
