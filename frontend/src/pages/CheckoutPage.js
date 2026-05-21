import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  FiCheck, FiCreditCard, FiMapPin, FiPackage, FiArrowRight, 
  FiChevronLeft, FiPhone, FiUser, FiInfo, FiTag, FiZap, FiX 
} from 'react-icons/fi';
import { selectCartItems, selectCartSubtotal, clearCartLocal } from '../store/slices/cartSlice';
import { formatPrice } from '../utils/helpers';
import api from '../utils/api';
import toast from 'react-hot-toast';

const steps = [
  { title: 'Address', icon: FiMapPin },
  { title: 'Review', icon: FiPackage },
  { title: 'Payment', icon: FiCreditCard }
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Coupon / Flash Voucher States
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [activeVoucher, setActiveVoucher] = useState(null);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [validating, setValidating] = useState(false);
  const [settings, setSettings] = useState({
    freeDeliveryThreshold: 1000,
    freeDeliveryLocations: ['Chennai', 'Mumbai', 'Delhi', 'Kolkata', 'Bengaluru']
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      } catch (err) {
        console.warn('Could not fetch shipping settings', err);
      }
    };
    fetchSettings();
  }, []);



  // Dynamic Billing Calculation Formulas
  const isFlashApplied = activeVoucher !== null;
  
  // Calculate delivery charge dynamically
  let calculatedShipping = 99;
  if (isFlashApplied) {
    calculatedShipping = 65;
  }
  
  const normalizedCity = (address.city || '').trim().toLowerCase();
  const isEligibleLocation = settings.freeDeliveryLocations.some(
    loc => loc.trim().toLowerCase() === normalizedCity
  );
  
  if (isEligibleLocation && subtotal >= settings.freeDeliveryThreshold) {
    calculatedShipping = 0;
  }

  const shipping = calculatedShipping;
  const tax = Math.round(subtotal * 0.05); // GST: 5% on original subtotal (not reduced by voucher discount)
  const total = subtotal - voucherDiscount + shipping + tax;

  const handleApplyVoucher = async (codeToApply) => {
    const targetCode = codeToApply || voucherCodeInput;
    if (!targetCode) return;

    setValidating(true);
    try {
      const { data } = await api.post('/flash-sales/validate', {
        code: targetCode.toUpperCase(),
        cartAmount: subtotal,
        cartItems: items.map(i => ({
          product: i.product._id,
          category: i.product.category?._id || i.product.category,
          price: i.product.discountPrice || i.product.price,
          quantity: i.quantity
        }))
      });

      setActiveVoucher(data.voucher);
      setVoucherDiscount(data.discount);
      setVoucherCodeInput('');
      toast.success('Coupon applied successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired voucher code');
    }
    setValidating(false);
  };

  const handleRemoveVoucher = () => {
    setActiveVoucher(null);
    setVoucherDiscount(0);
    toast.success('Voucher removed');
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    const required = ['name', 'phone', 'addressLine1', 'city', 'state', 'pincode'];
    for (const field of required) {
      if (!address[field]) { toast.error(`Please fill in ${field}`); return; }
    }
    setStep(1);
    window.scrollTo(0, 0);
  };

  const handlePlaceOrder = async () => {
    if (!agreeToTerms) {
      toast.error('Please agree to the Terms of Service and Privacy Policy to place your order.');
      return;
    }
    setLoading(true);
    try {
      const orderData = {
        items: items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          customization: item.customization,
        })),
        shippingAddress: address,
        payment: { method: paymentMethod },
        couponCode: activeVoucher?.code,
      };

      const { data } = await api.post('/orders', orderData);

      if (paymentMethod === 'razorpay') {
        await initiateRazorpay(data.order._id);
      } else {
        dispatch(clearCartLocal());
        navigate(`/payment-success?orderId=${data.order._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    }
    setLoading(false);
  };

  const initiateRazorpay = async (orderDbId) => {
    try {
      const { data } = await api.post('/payments/create-order', { orderId: orderDbId });
      const options = {
        key: data.key,
        amount: data.razorpayOrder.amount,
        currency: 'INR',
        name: 'Ethnic Elegance',
        description: 'Premium Ethnic Wear',
        order_id: data.razorpayOrder.id,
        prefill: {
          name: data.user.name,
          email: data.user.email,
          contact: data.user.phone,
        },
        theme: { color: '#D4AF37' },
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderDbId,
            });
            dispatch(clearCartLocal());
            navigate(`/payment-success?orderId=${orderDbId}&paymentId=${response.razorpay_payment_id}`);
          } catch {
            toast.error('Payment verification failed');
          }
        },
        modal: {
          ondismiss: async () => {
            await api.post('/payments/failure', { orderId: orderDbId, error: { description: 'Payment cancelled by user' } });
            toast.error('Payment cancelled');
          }
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error('Failed to initiate payment');
    }
  };

  return (
    <>
      <Helmet><title>Checkout - Ethnic Elegance</title></Helmet>

      <div className="pt-24 min-h-screen bg-[#FDF8F3] pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <h1 className="font-display text-4xl font-bold text-gray-900">Checkout</h1>
            
            {/* Step Indicator */}
            <div className="flex items-center gap-2">
              {steps.map((s, i) => (
                <React.Fragment key={s.title}>
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm ${
                      i < step ? 'bg-green-500 text-white' : i === step ? 'bg-yellow-500 text-white ring-4 ring-yellow-100' : 'bg-white text-gray-300 border border-gray-100'
                    }`}>
                      {i < step ? <FiCheck size={20} /> : <s.icon size={18} />}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${i === step ? 'text-yellow-600' : 'text-gray-400'}`}>
                      {s.title}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-8 sm:w-16 h-0.5 -mt-6 transition-all duration-500 ${i < step ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Main Content Area */}
            <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
                {/* Step 0: Address Form */}
                {step === 0 && (
                  <motion.div 
                    key="address"
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
                        <FiMapPin className="text-yellow-600" size={20} />
                      </div>
                      <h2 className="text-gray-900 font-bold text-2xl">Delivery Details</h2>
                    </div>

                    {user?.addresses?.length > 0 && (
                      <div className="mb-8">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4">Saved Addresses</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {user.addresses.map((addr) => (
                            <button
                              key={addr._id}
                              type="button"
                              onClick={() => setAddress({ ...addr })}
                              className="text-left bg-gray-50 border border-gray-100 rounded-2xl p-4 hover:border-yellow-400 hover:bg-white transition-all group"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <p className="text-gray-900 font-bold">{addr.name}</p>
                                <div className="w-4 h-4 rounded-full border-2 border-gray-200 group-hover:border-yellow-500 flex items-center justify-center">
                                   <div className="w-2 h-2 rounded-full bg-yellow-500 opacity-0 group-hover:opacity-100" />
                                </div>
                              </div>
                              <p className="text-gray-500 text-sm leading-relaxed">
                                {addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}
                              </p>
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 my-8">
                          <div className="flex-1 h-px bg-gray-100" />
                          <span className="text-gray-300 text-xs font-bold uppercase">Or Enter New</span>
                          <div className="flex-1 h-px bg-gray-100" />
                        </div>
                      </div>
                    )}
                    <form onSubmit={handleAddressSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase ml-1">Full Name</label>
                          <div className="relative">
                            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input placeholder="Enter name" value={address.name} onChange={e => setAddress({...address, name: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-yellow-500 focus:bg-white transition-all" required />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase ml-1">Phone Number</label>
                          <div className="relative">
                            <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input placeholder="Enter phone" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-yellow-500 focus:bg-white transition-all" required />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Street Address</label>
                        <input placeholder="House No, Building, Street" value={address.addressLine1} onChange={e => setAddress({...address, addressLine1: e.target.value})} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-yellow-500 focus:bg-white transition-all" required />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase ml-1">City</label>
                          <input placeholder="City" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-yellow-500 focus:bg-white transition-all" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase ml-1">State</label>
                          <input placeholder="State" value={address.state} onChange={e => setAddress({...address, state: e.target.value})} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-yellow-500 focus:bg-white transition-all" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase ml-1">Pincode</label>
                          <input placeholder="6-digit" value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value})} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-yellow-500 focus:bg-white transition-all" required />
                        </div>
                      </div>

                      <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-yellow-100 mt-4">
                        Review Order <FiArrowRight size={20} />
                      </button>
                    </form>
                  </motion.div>
                )}

                {/* Step 1: Review Order */}
                {step === 1 && (
                  <motion.div 
                    key="review"
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
                            <FiPackage className="text-yellow-600" size={20} />
                          </div>
                          <h2 className="text-gray-900 font-bold text-2xl">Items Review</h2>
                        </div>
                        <button onClick={() => navigate('/cart')} className="text-yellow-600 font-bold text-sm hover:underline">Edit Bag</button>
                      </div>

                      <div className="space-y-6">
                        {items.map((item) => (
                          <div key={item._id} className="flex gap-5 group items-center bg-gray-50/50 p-3 rounded-2xl border border-gray-50 hover:border-yellow-200/50 hover:bg-white hover:shadow-sm hover:shadow-yellow-100/10 transition-all duration-300">
                            <div className="w-20 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-100 shadow-inner">
                              <img src={item.product?.images?.[0]?.url} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-gray-900 font-bold text-base mb-1">{item.product?.name}</h4>
                              <p className="text-gray-400 text-sm mb-2">
                                {item.size && `Size: ${item.size}`} {item.color && ` • Color: ${item.color}`}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="bg-gray-50 text-gray-500 text-xs font-bold px-3 py-1 rounded-full border border-gray-100">Qty: {item.quantity}</span>
                                <p className="text-gray-900 font-bold">
                                  {formatPrice((item.product?.discountPrice || item.product?.price) * item.quantity)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                           <FiMapPin size={24} />
                         </div>
                         <div>
                            <p className="text-gray-900 font-bold">Shipping to {address.city}</p>
                            <p className="text-gray-400 text-xs truncate max-w-xs">{address.addressLine1}</p>
                         </div>
                      </div>
                      <button onClick={() => setStep(0)} className="text-gray-400 hover:text-yellow-600 font-bold text-xs uppercase tracking-widest transition-colors">Change</button>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button onClick={() => setStep(0)} className="h-14 px-8 border border-gray-200 rounded-2xl text-gray-500 font-bold hover:bg-gray-50 transition-all flex items-center gap-2">
                        <FiChevronLeft /> Back
                      </button>
                      <button onClick={() => setStep(2)} className="flex-1 h-14 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-2xl transition-all shadow-xl shadow-yellow-100 flex items-center justify-center gap-3">
                        Payment Options <FiArrowRight />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Payment Options */}
                {step === 2 && (
                  <motion.div 
                    key="payment"
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
                        <FiCreditCard className="text-yellow-600" size={20} />
                      </div>
                      <h2 className="text-gray-900 font-bold text-2xl">Payment Method</h2>
                    </div>

                    <div className="space-y-4 mb-10">
                      {[
                        { value: 'razorpay', label: 'Online Payment', desc: 'Securely pay via Cards, UPI, or NetBanking', icon: '💳' },
                        { value: 'cod', label: 'Cash on Delivery', desc: 'Pay with cash upon delivery of your order', icon: '🚚' },
                      ].map((method) => (
                        <button
                          key={method.value}
                          onClick={() => setPaymentMethod(method.value)}
                          className={`w-full flex items-center gap-5 p-5 rounded-3xl border-2 transition-all ${
                            paymentMethod === method.value 
                              ? 'border-yellow-500 bg-yellow-50/50 shadow-md ring-4 ring-yellow-50' 
                              : 'border-gray-100 hover:border-gray-300 grayscale opacity-60'
                          }`}
                        >
                          <div className="text-3xl">{method.icon}</div>
                          <div className="text-left flex-1">
                            <p className="text-gray-900 font-bold text-lg leading-tight">{method.label}</p>
                            <p className="text-gray-400 text-sm mt-0.5">{method.desc}</p>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            paymentMethod === method.value ? 'border-yellow-500 bg-yellow-500' : 'border-gray-200'
                          }`}>
                            {paymentMethod === method.value && <FiCheck size={14} className="text-white" />}
                          </div>
                        </button>
                      ))}
                    </div>

                    <label className="flex items-start gap-3 bg-gray-50 hover:bg-gray-100/50 rounded-2xl p-5 mb-8 cursor-pointer transition-colors border border-gray-100">
                      <input
                        type="checkbox"
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                        className="mt-0.5 h-4.5 w-4.5 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 cursor-pointer accent-yellow-500"
                      />
                      <span className="text-gray-500 text-xs leading-relaxed select-none">
                        I agree to Ethnic Elegance's{' '}
                        <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-yellow-600 hover:underline font-bold" onClick={(e) => e.stopPropagation()}>Terms of Service</a>{' '}
                        and{' '}
                        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-yellow-600 hover:underline font-bold" onClick={(e) => e.stopPropagation()}>Privacy Policy</a>. I understand that all transactions are secure and encrypted. <span className="text-red-500 font-bold">*</span>
                      </span>
                    </label>

                    <div className="flex gap-4">
                      <button onClick={() => setStep(1)} className="h-14 px-8 border border-gray-200 rounded-2xl text-gray-500 font-bold hover:bg-gray-50 transition-all flex items-center gap-2">
                        <FiChevronLeft /> Back
                      </button>
                      <button
                        onClick={handlePlaceOrder}
                        disabled={loading}
                        className="flex-1 h-14 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-2xl transition-all shadow-xl shadow-yellow-100 flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {loading ? 'Processing Order...' : `Complete Purchase • ${formatPrice(total)}`}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sticky Order Summary Area with Flash Voucher code validation */}
            <div className="lg:col-span-4 space-y-6 sticky top-28">
              <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100">
                <h3 className="text-gray-900 font-bold text-xl mb-6">Summary</h3>

                {/* VOUCHER VALIDATION BOX */}
                <div className="mb-6 pb-6 border-b border-gray-100">
                  <label className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-2">Have a Flash Voucher?</label>
                  {activeVoucher ? (
                    <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FiZap className="text-green-600 animate-pulse" />
                        <div>
                          <span className="font-mono font-black text-green-700 block tracking-widest text-sm">{activeVoucher.code}</span>
                          <span className="text-[10px] text-green-600 font-medium block">Saved {formatPrice(voucherDiscount)}!</span>
                        </div>
                      </div>
                      <button 
                        onClick={handleRemoveVoucher} 
                        className="p-1.5 hover:bg-green-200/50 rounded-lg text-green-600 transition-colors"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          value={voucherCodeInput}
                          onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                          placeholder="e.g. FLASH20"
                          className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-yellow-500 font-mono tracking-widest text-sm uppercase"
                        />
                        <button
                          onClick={() => handleApplyVoucher()}
                          disabled={validating}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                        >
                          {validating ? 'Applying...' : 'Apply'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span>Order Subtotal</span>
                    <span className="text-gray-900 font-bold">{formatPrice(subtotal)}</span>
                  </div>
                  {voucherDiscount > 0 && (
                    <div className="flex justify-between text-green-600 font-bold">
                      <span className="flex items-center gap-1.5"><FiZap size={14} className="animate-pulse" /> Applied Voucher</span>
                      <span>-{formatPrice(voucherDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span>Delivery Charge {isFlashApplied && <span className="text-[10px] text-yellow-600 font-black tracking-wide uppercase bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-100 ml-1">Flash Offer</span>}</span>
                    <span className={shipping === 0 ? 'text-green-600 font-bold' : 'text-gray-900 font-bold'}>
                      {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span>Taxes (GST 5%)</span>
                    <span className="text-gray-900 font-bold">{formatPrice(tax)}</span>
                  </div>
                  <div className="pt-6 mt-6 border-t border-gray-50 flex justify-between items-center">
                    <span className="text-gray-900 text-lg font-black">Grand Total</span>
                    <span className="text-yellow-600 text-3xl font-black">{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-2xl p-4 flex flex-col items-center text-center">
                   <p className="text-yellow-700 text-[10px] font-bold uppercase tracking-widest mb-1">Guaranteed Quality</p>
                   <p className="text-yellow-600 text-xs font-medium">Handcrafted with love. 7-day easy returns.</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-gray-300 text-[10px] font-bold uppercase tracking-widest">
                 <FiCheck size={14} className="text-green-500" /> Payment Processed Securely
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
