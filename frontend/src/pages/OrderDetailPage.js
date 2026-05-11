import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  FiPackage, FiTruck, FiCheck, FiX, FiArrowLeft,
  FiMapPin, FiPhone, FiCreditCard, FiRefreshCw, FiCalendar, FiShield, FiTag
} from 'react-icons/fi';
import api from '../utils/api';
import { formatPrice, formatDate, getStatusColor, getStatusLabel } from '../utils/helpers';
import toast from 'react-hot-toast';

const orderStages = ['processing', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [returning, setReturning] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [showReturnForm, setShowReturnForm] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data.order);
      } catch (err) {
        toast.error('Order not found');
      }
      setLoading(false);
    };
    fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const { data } = await api.put(`/orders/${id}/cancel`, { reason: 'Customer requested cancellation' });
      setOrder(data.order);
      toast.success('Order cancelled successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel this order');
    }
    setCancelling(false);
  };

  const handleReturn = async (e) => {
    e.preventDefault();
    setReturning(true);
    try {
      const { data } = await api.put(`/orders/${id}/return`, { reason: returnReason });
      setOrder(data.order);
      setShowReturnForm(false);
      toast.success('Return request submitted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit return request');
    }
    setReturning(false);
  };

  if (loading) {
    return (
      <div className="pt-32 min-h-screen bg-[#FDF8F3] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Order Details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="pt-32 min-h-screen bg-[#FDF8F3] flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-[3rem] shadow-sm border border-gray-100 max-w-sm mx-auto">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
             <FiPackage size={32} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-400 text-sm mb-8">The order you're looking for doesn't exist or has been removed.</p>
          <Link to="/orders" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-yellow-100">
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStageIndex = orderStages.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === 'cancelled';
  const isDelivered = order.orderStatus === 'delivered';

  return (
    <>
      <Helmet>
        <title>Order #{order.orderId} - Ethnic Elegance</title>
      </Helmet>

      <div className="pt-24 min-h-screen bg-[#FDF8F3] pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <Link to="/orders" className="inline-flex items-center gap-2 text-gray-400 hover:text-yellow-600 font-bold text-sm uppercase tracking-widest mb-8 group transition-colors">
            <FiArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to My Orders
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                 <h1 className="font-display text-4xl font-black text-gray-900">Order #{order.orderId}</h1>
                 <span className={`text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest ${getStatusColor(order.orderStatus)}`}>
                   {getStatusLabel(order.orderStatus)}
                 </span>
              </div>
              <div className="flex items-center gap-4 text-gray-400 font-bold text-xs uppercase tracking-widest">
                 <span className="flex items-center gap-1.5"><FiCalendar className="text-yellow-500" /> {formatDate(order.createdAt)}</span>
                 <span className="w-1 h-1 bg-gray-300 rounded-full" />
                 <span className="flex items-center gap-1.5"><FiShield className="text-green-500" /> Secure Transaction</span>
              </div>
            </div>
            
            {!isCancelled && !isDelivered && (
               <div className="flex gap-3">
                  <button onClick={handleCancel} disabled={cancelling} className="px-6 py-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl font-bold text-sm transition-all border border-red-100 disabled:opacity-50">
                    {cancelling ? 'Processing...' : 'Cancel Order'}
                  </button>
               </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              
              {/* Timeline Progress */}
              {!isCancelled && (
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-yellow-500" />
                  <h3 className="text-gray-900 font-black uppercase tracking-widest text-xs mb-8 flex items-center gap-2">
                    <FiTruck className="text-yellow-600" /> Delivery Tracking
                  </h3>
                  
                  <div className="relative">
                    <div className="absolute top-4 left-4 right-4 h-1 bg-gray-50" />
                    <div
                      className="absolute top-4 left-4 h-1 bg-yellow-500 transition-all duration-1000"
                      style={{ width: `${Math.max(0, (currentStageIndex / (orderStages.length - 1)) * 100)}%` }}
                    />
                    <div className="relative flex justify-between">
                      {orderStages.map((stage, i) => {
                        const isCompleted = i <= currentStageIndex;
                        const isCurrent = i === currentStageIndex;
                        return (
                          <div key={stage} className="flex flex-col items-center gap-3">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center z-10 transition-all duration-500 shadow-sm ${
                              isCompleted
                                ? 'bg-yellow-500 text-white'
                                : 'bg-white border border-gray-100 text-gray-300'
                            } ${isCurrent ? 'ring-4 ring-yellow-100 scale-110' : ''}`}>
                              {isCompleted ? <FiCheck size={18} /> : <span className="text-xs font-bold">{i + 1}</span>}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest text-center hidden sm:block ${isCompleted ? 'text-gray-900' : 'text-gray-300'}`}>
                              {stage.replace(/_/g, ' ')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {order.tracking?.trackingNumber && (
                    <div className="mt-10 p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Tracking ID</p>
                        <p className="text-slate-900 font-black text-lg">{order.tracking.trackingNumber}</p>
                        <p className="text-slate-400 text-xs font-medium">via {order.tracking.carrier || 'Express Delivery'}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Est. Arrival</p>
                         <p className="text-yellow-600 font-black">{order.tracking.estimatedDelivery ? formatDate(order.tracking.estimatedDelivery) : 'Calculated soon'}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Order Items */}
              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                <h3 className="text-gray-900 font-black uppercase tracking-widest text-xs mb-8 flex items-center gap-2">
                  <FiPackage className="text-yellow-600" /> Items Summary
                </h3>
                <div className="space-y-6">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex gap-6 pb-6 border-b border-gray-50 last:border-0 last:pb-0 group">
                      <div className="w-24 h-32 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                        <img
                          src={item.image || 'https://via.placeholder.com/150'}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                      <div className="flex-1 py-1">
                        <div className="flex justify-between items-start mb-2">
                           <h4 className="text-gray-900 font-bold text-lg leading-tight">{item.name}</h4>
                           <p className="text-yellow-600 font-black text-xl">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                        <div className="flex gap-4 mb-4">
                          {item.size && (
                            <div className="bg-gray-50 px-3 py-1 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest">Size: {item.size}</div>
                          )}
                          <div className="bg-gray-50 px-3 py-1 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest">Qty: {item.quantity}</div>
                        </div>
                        <p className="text-gray-400 text-xs font-medium">Unit Price: {formatPrice(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              
              {/* Delivery Address */}
              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                <h3 className="text-gray-900 font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                  <FiMapPin className="text-yellow-600" /> Shipping Detail
                </h3>
                <div className="space-y-4">
                   <div>
                      <p className="text-gray-900 font-black">{order.shippingAddress?.name}</p>
                      <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-1">
                        <FiPhone size={14} className="text-yellow-500" /> {order.shippingAddress?.phone}
                      </p>
                   </div>
                   <div className="text-gray-400 text-sm leading-relaxed font-medium">
                      <p>{order.shippingAddress?.addressLine1}</p>
                      {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                      <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                      <p className="text-gray-900 font-bold mt-1">{order.shippingAddress?.pincode}</p>
                   </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 rounded-full -mr-12 -mt-12 opacity-50" />
                <h3 className="text-gray-900 font-black uppercase tracking-widest text-xs mb-8 flex items-center gap-2">
                  <FiCreditCard className="text-yellow-600" /> Payment Info
                </h3>
                <div className="space-y-4">
                   <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                      <span className="text-gray-400 text-xs font-black uppercase tracking-widest">Method</span>
                      <span className="text-gray-900 font-bold text-sm capitalize">{order.payment?.method?.replace(/_/g, ' ')}</span>
                   </div>
                   <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                      <span className="text-gray-400 text-xs font-black uppercase tracking-widest">Status</span>
                      <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${order.payment?.status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                         {order.payment?.status}
                      </span>
                   </div>
                   
                   <div className="space-y-3 pt-2">
                      <div className="flex justify-between text-sm">
                         <span className="text-gray-400 font-medium">Subtotal</span>
                         <span className="text-gray-900 font-bold">{formatPrice(order.pricing?.subtotal)}</span>
                      </div>
                      {order.pricing?.couponDiscount > 0 && (
                        <div className="flex justify-between text-sm">
                           <span className="text-green-600 font-medium flex items-center gap-1.5"><FiTag size={12} /> Coupon</span>
                           <span className="text-green-600 font-bold">-{formatPrice(order.pricing.couponDiscount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                         <span className="text-gray-400 font-medium">Shipping</span>
                         <span className="text-gray-900 font-bold">{order.pricing?.shipping === 0 ? 'FREE' : formatPrice(order.pricing?.shipping)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                         <span className="text-gray-400 font-medium">GST</span>
                         <span className="text-gray-900 font-bold">{formatPrice(order.pricing?.tax)}</span>
                      </div>
                      <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                         <span className="text-gray-900 font-black uppercase tracking-widest text-xs mb-1">Grand Total</span>
                         <span className="text-yellow-600 font-black text-3xl">{formatPrice(order.pricing?.total)}</span>
                      </div>
                   </div>
                </div>
              </div>

              {/* Help Box */}
              <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white">
                 <h4 className="font-black uppercase tracking-widest text-[10px] mb-4 opacity-70">Need Help?</h4>
                 <p className="text-sm font-medium mb-6 opacity-90">If you have any issues with your order, please contact our support team.</p>
                 <a href="tel:+911234567890" className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 py-3 rounded-2xl transition-all font-bold text-sm">
                    <FiPhone size={16} /> Contact Support
                 </a>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetailPage;
