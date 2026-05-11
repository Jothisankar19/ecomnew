import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await api.put(`/auth/reset-password/${token}`, { password });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset link expired. Please try again.');
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Reset Password - Ethnic Elegance</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center pt-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="glass rounded-3xl p-8">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center mx-auto mb-4">
                <FiLock className="text-yellow-400" size={24} />
              </div>
              <h1 className="font-display text-3xl font-bold text-gradient-gold mb-2">Reset Password</h1>
              <p className="text-white/50 text-sm">Enter your new password below</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-luxury pl-12 pr-12"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>

              <div className="relative">
                <FiCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-luxury pl-12"
                  required
                />
              </div>

              {password && confirmPassword && (
                <p className={`text-xs ${password === confirmPassword ? 'text-green-400' : 'text-red-400'}`}>
                  {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full py-4">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>

            <p className="text-center text-white/40 text-sm mt-6">
              <Link to="/login" className="text-yellow-400 hover:text-yellow-300 transition-colors">
                Back to Login
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
