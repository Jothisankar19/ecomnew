import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiShield, FiArrowLeft, FiRefreshCw } from 'react-icons/fi';
import { verifyOTP } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

const VerifyOTPPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading } = useSelector((state) => state.auth);
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Get email from navigation state or local storage
    const stateEmail = location.state?.email;
    if (stateEmail) {
      setEmail(stateEmail);
    } else {
      toast.error('Session expired. Please register again.');
      navigate('/register');
    }
  }, [location, navigate]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  const handleBackspace = (e, index) => {
    if (e.key === 'Backspace' && e.target.previousSibling && otp[index] === '') {
      e.target.previousSibling.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) {
      return toast.error('Please enter the full 6-digit code');
    }

    const result = await dispatch(verifyOTP({ email, otp: otpString }));
    if (!result.error) {
      toast.success('Email verified successfully! You can now log in.');
      navigate('/login');
    }
  };

  return (
    <>
      <Helmet><title>Verify Email - Kurti Elegance</title></Helmet>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 24 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="w-full max-w-md"
        >
          <button 
            onClick={() => navigate('/register')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-6"
          >
            <FiArrowLeft /> Back to Registration
          </button>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-yellow-600">
              <FiShield size={32} />
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h1>
            <p className="text-gray-500 text-sm mb-8">
              We've sent a 6-digit code to <span className="text-gray-800 font-semibold">{email}</span>. 
              Please enter it below to verify your account.
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex justify-between gap-2">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={data}
                    onChange={(e) => handleChange(e.target, index)}
                    onKeyDown={(e) => handleBackspace(e, index)}
                    onFocus={(e) => e.target.select()}
                    className="w-12 h-14 bg-gray-50 border border-gray-200 rounded-xl text-center text-xl font-bold text-gray-800 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all"
                  />
                ))}
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="btn-primary w-full py-4 text-base shadow-lg shadow-yellow-200/50"
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-50">
              <p className="text-gray-400 text-sm">
                Didn't receive the code? 
                <button className="text-yellow-600 font-semibold ml-2 hover:text-yellow-700 flex items-center gap-1 mx-auto mt-2">
                  <FiRefreshCw size={14} /> Resend OTP
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default VerifyOTPPage;
