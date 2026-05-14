import React, { useEffect, useState, Suspense } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, PresentationControls } from '@react-three/drei';
import {
  FiHeart, FiShoppingCart, FiZoomIn, FiShare2, FiTruck,
  FiShield, FiRefreshCw, FiStar, FiChevronLeft, FiChevronRight,
  FiMinus, FiPlus, FiCheck, FiX
} from 'react-icons/fi';
import sizeGuideImg from '../assets/kurti_size_guide_diagram.png';
import { fetchProduct, addToRecentlyViewed } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlist, selectIsWishlisted } from '../store/slices/wishlistSlice';
import { openAuthModal } from '../store/slices/uiSlice';
import { formatPrice, calcDiscount, getStatusColor } from '../utils/helpers';
import StarRating from '../components/ui/StarRating';
import ProductCard from '../components/product/ProductCard';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Seo from '../components/ui/Seo';

// 3D Product Viewer placeholder
const Product3DViewer = () => (
  <Canvas camera={{ position: [0, 0, 3] }}>
    <ambientLight intensity={0.8} />
    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
    <PresentationControls global rotation={[0, 0.3, 0]} polar={[-0.4, 0.2]} azimuth={[-1, 0.75]} config={{ mass: 2, tension: 400 }} snap={{ mass: 4, tension: 400 }}>
      <mesh>
        <boxGeometry args={[1, 1.5, 0.1]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.5} roughness={0.3} />
      </mesh>
    </PresentationControls>
    <Environment preset="city" />
  </Canvas>
);

const ReviewSection = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    api.get(`/reviews/product/${productId}`).then(({ data }) => {
      setReviews(data.reviews || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { dispatch(openAuthModal('login')); return; }
    setSubmitting(true);
    try {
      const { data } = await api.post('/reviews', { productId, ...newReview });
      setReviews([data.review, ...reviews]);
      setNewReview({ rating: 5, title: '', comment: '' });
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
    setSubmitting(false);
  };

  return (
    <div className="mt-16">
      <h3 className="text-2xl font-bold text-gray-900 mb-8 font-display">Customer Reviews</h3>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Write Review */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 h-fit">
          <h4 className="text-gray-800 font-bold mb-4">Write a Review</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-600 text-sm mb-2 block font-medium">Rating</label>
              <StarRating rating={newReview.rating} interactive onChange={(r) => setNewReview({ ...newReview, rating: r })} size={24} />
            </div>
            <input
              type="text"
              placeholder="Review title"
              value={newReview.title}
              onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all"
            />
            <textarea
              placeholder="Share your experience..."
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              required
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all"
            />
            <button type="submit" disabled={submitting} className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold transition-colors disabled:opacity-70">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="text-gray-400 text-sm">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 border border-gray-100 rounded-2xl">
              <p className="text-gray-500 font-medium">No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={review.user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user?.name || 'U')}&background=D4AF37&color=fff`}
                      alt={review.user?.name}
                      className="w-10 h-10 rounded-full border border-gray-100"
                    />
                    <div>
                      <p className="text-gray-800 text-sm font-bold">{review.user?.name}</p>
                      {review.isVerifiedPurchase && (
                        <span className="text-green-600 text-xs font-semibold flex items-center gap-1"><FiCheck size={12} /> Verified Purchase</span>
                      )}
                    </div>
                  </div>
                  <StarRating rating={review.rating} size={16} />
                </div>
                {review.title && <p className="text-gray-800 font-bold text-sm mb-1.5">{review.title}</p>}
                <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const sizes = [
  { size: 'XS', chest: '32"', waist: '26"', hip: '34"', length: '44"' },
  { size: 'S', chest: '34"', waist: '28"', hip: '36"', length: '44"' },
  { size: 'M', chest: '36"', waist: '30"', hip: '38"', length: '46"' },
  { size: 'L', chest: '38"', waist: '32"', hip: '40"', length: '46"' },
  { size: 'XL', chest: '40"', waist: '34"', hip: '42"', length: '48"' },
  { size: 'XXL', chest: '42"', waist: '36"', hip: '44"', length: '48"' },
  { size: 'XXXL', chest: '44"', waist: '38"', hip: '46"', length: '50"' },
  { size: 'Free Size', chest: '36–42"', waist: '30–36"', hip: '38–44"', length: '46"' },
];

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { product, loading } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const isWishlisted = useSelector(selectIsWishlisted(product?._id));

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [show3D, setShow3D] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [zoomStyle, setZoomStyle] = useState({});
  const [customization, setCustomization] = useState({
    embroideryText: '',
    sleeveType: '',
    fabricStyle: '',
    giftWrapping: false,
  });

  useEffect(() => {
    dispatch(fetchProduct(id));
    window.scrollTo(0, 0);
  }, [id, dispatch]);

  useEffect(() => {
    if (product) {
      dispatch(addToRecentlyViewed(product));
      if (product.sizes?.length > 0) setSelectedSize(product.sizes[0].size);
      if (product.colors?.length > 0) setSelectedColor(product.colors[0].name);
      api.get(`/products/${product._id}/related`).then(({ data }) => setRelatedProducts(data.products || []));
    }
  }, [product, dispatch]);

  const handleAddToCart = () => {
    if (!isAuthenticated) { dispatch(openAuthModal('login')); return; }
    if (product.sizes?.length > 0 && !selectedSize) { toast.error('Please select a size'); return; }
    dispatch(addToCart({
      productId: product._id,
      quantity,
      size: selectedSize,
      color: selectedColor,
      customization,
    }));
  };

  const handleMouseMove = (e) => {
    if (show3D) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2.2)',
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transformOrigin: 'center',
      transform: 'scale(1)',
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  if (loading || !product) {
    return (
      <div className="pt-24 min-h-screen bg-gray-50 page-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-5 aspect-[3/4] bg-gray-200 animate-pulse rounded-2xl" />
          <div className="lg:col-span-7 space-y-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-8 bg-gray-200 animate-pulse rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  const discount = calcDiscount(product.price, product.discountPrice);
  const images = product.images || [];

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.images?.map(img => img.url),
    "description": product.description,
    "sku": product.sku || product._id,
    "mpn": product._id,
    "brand": {
      "@type": "Brand",
      "name": "Ethnic Elegance"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.ratings || "4.5",
      "reviewCount": product.numOfReviews || "1"
    },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "INR",
      "price": product.discountPrice || product.price,
      "priceValidUntil": "2026-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Ethnic Elegance"
      }
    }
  };

  return (
    <>
      <Seo 
        title={product.name}
        description={product.description?.substring(0, 160)}
        image={product.images?.[0]?.url}
        keywords={`${product.name}, ${product.category?.name}, kurtis, fashion, ethnic wear`}
        type="product"
        schema={productSchema}
      />

      <div className="pt-20 min-h-screen bg-gray-50 pb-16">
        <div className="page-container py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-medium">
            <Link to="/" className="hover:text-yellow-600 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-yellow-600 transition-colors">Products</Link>
            <span>/</span>
            <span className="text-gray-800 truncate">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Images - Reduced to col-span-5 to make image smaller on desktop */}
            <div className="lg:col-span-5">
              <div className="sticky top-28">
                {/* Main Image */}
                <div 
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-4 shadow-md group bg-white cursor-crosshair"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onMouseEnter={handleMouseLeave} // Reset when entering
                >
                  {show3D ? (
                    <div className="w-full h-full bg-gray-100">
                      <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">Loading 3D...</div>}>
                        <Product3DViewer />
                      </Suspense>
                    </div>
                  ) : (
                    <motion.img
                      key={selectedImage}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      src={images[selectedImage]?.url || 'https://via.placeholder.com/600x800?text=No+Image'}
                      alt={product.name}
                      style={{ ...zoomStyle, transition: zoomStyle.transform === 'scale(1)' ? 'transform 0.3s ease' : 'none' }}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {discount > 0 && <span className="bg-red-500 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-sm">-{discount}% OFF</span>}
                    {product.isNewArrival && <span className="bg-blue-500 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-sm">NEW</span>}
                  </div>

                  {/* Actions */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <button
                      onClick={() => dispatch(toggleWishlist(product._id))}
                      className={`w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-md transition-all ${isWishlisted ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'}`}
                    >
                      <FiHeart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => setShow3D(!show3D)}
                      className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-500 hover:text-yellow-500 transition-all"
                      title="Toggle 3D View"
                    >
                      <FiZoomIn size={18} />
                    </button>
                  </div>

                  {/* Navigation arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setSelectedImage((prev) => (prev - 1 + images.length) % images.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm shadow-md rounded-full flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                      >
                        <FiChevronLeft size={20} />
                      </button>
                      <button
                        onClick={() => setSelectedImage((prev) => (prev + 1) % images.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm shadow-md rounded-full flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                      >
                        <FiChevronRight size={20} />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                    {images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(i)}
                        className={`flex-shrink-0 w-20 h-24 rounded-xl overflow-hidden border-2 transition-all shadow-sm ${
                          i === selectedImage ? 'border-yellow-500 shadow-yellow-200' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Info - Takes more space on desktop */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100">
                <p className="text-yellow-600 font-bold tracking-wide text-sm mb-2 uppercase">{product.category?.name}</p>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">{product.name}</h1>

                {/* Rating */}
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                  <StarRating rating={product.ratings} size={18} />
                  <span className="text-gray-500 text-sm font-medium">({product.numReviews} reviews)</span>
                  {product.sold > 0 && <span className="text-gray-400 text-sm border-l border-gray-200 pl-3">{product.sold} sold</span>}
                </div>

                {/* Price */}
                <div className="flex items-center gap-4 mb-6">
                  {product.discountPrice ? (
                    <>
                      <span className="font-display text-4xl font-bold text-yellow-600">{formatPrice(product.discountPrice)}</span>
                      <span className="text-gray-400 text-xl line-through font-medium">{formatPrice(product.price)}</span>
                      <span className="bg-red-50 text-red-600 font-bold text-sm px-3 py-1 rounded-full">{discount}% OFF</span>
                    </>
                  ) : (
                    <span className="font-display text-4xl font-bold text-yellow-600">{formatPrice(product.price)}</span>
                  )}
                </div>

                {/* Short Description */}
                {product.shortDescription && (
                  <p className="text-gray-600 mb-8 leading-relaxed">{product.shortDescription}</p>
                )}

                {/* Color Selection */}
                {product.colors && product.colors.length > 0 && (
                  <div className="mb-6">
                    <p className="text-gray-700 text-sm font-bold mb-3 flex items-center gap-2">
                      Color: <span className="text-gray-500 font-medium">{selectedColor}</span>
                    </p>
                    <div className="flex gap-3">
                      {product.colors.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => setSelectedColor(color.name)}
                          className={`w-10 h-10 rounded-full border-2 shadow-sm transition-all flex items-center justify-center ${selectedColor === color.name ? 'border-yellow-500 ring-4 ring-yellow-50 scale-110' : 'border-gray-200 hover:scale-105'}`}
                          style={{ backgroundColor: color.hex || '#ccc' }}
                          title={color.name}
                        >
                          {selectedColor === color.name && <FiCheck className={['#fff', '#ffffff'].includes((color.hex||'').toLowerCase()) ? 'text-gray-900' : 'text-white'} size={16} />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selection */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-gray-700 text-sm font-bold flex items-center gap-2">
                        Size: <span className="text-gray-500 font-medium">{selectedSize}</span>
                      </p>
                      <button 
                        onClick={() => setShowSizeModal(true)}
                        className="text-yellow-600 text-xs font-bold hover:underline"
                      >
                        Size Guide
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {product.sizes.map((s) => (
                        <button
                          key={s.size}
                          onClick={() => setSelectedSize(s.size)}
                          disabled={s.stock === 0}
                          className={`min-w-[3rem] px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                            selectedSize === s.size
                              ? 'bg-yellow-500 border-yellow-500 text-white shadow-md shadow-yellow-200'
                              : s.stock === 0
                              ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed line-through'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-yellow-400 hover:text-yellow-600 shadow-sm'
                          }`}
                        >
                          {s.size}
                        </button>
                      ))}
                    </div>

                    {/* Dynamic Size Measurements Card */}
                    <AnimatePresence>
                      {selectedSize && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-6 overflow-hidden"
                        >
                          <div className="bg-gradient-to-r from-yellow-50 to-white rounded-2xl border border-yellow-100 p-4 grid grid-cols-4 gap-2">
                            {Object.entries(sizes.find(s => s.size === selectedSize) || {}).filter(([k]) => k !== 'size').map(([key, val]) => (
                              <div key={key} className="text-center">
                                <p className="text-[9px] font-bold text-yellow-600 uppercase tracking-widest mb-1">{key}</p>
                                <p className="text-sm font-black text-gray-800">{val}</p>
                              </div>
                            ))}
                          </div>
                          <p className="text-[10px] text-gray-400 mt-2 italic">* Measurements in inches for the best fit</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Customization */}
                {product.customization?.embroidery && (
                  <div className="mb-8 bg-yellow-50/50 border border-yellow-100 rounded-2xl p-5">
                    <h4 className="text-yellow-800 font-bold mb-4 flex items-center gap-2">
                      <FiStar className="fill-yellow-500 text-yellow-500" size={16} /> Optional Customization
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Embroidery Text</label>
                        <input
                          type="text"
                          placeholder="E.g. Initials (Max 20 chars)"
                          value={customization.embroideryText}
                          onChange={(e) => setCustomization({ ...customization, embroideryText: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-yellow-200 bg-white text-sm focus:outline-none focus:border-yellow-500 transition-colors"
                          maxLength={20}
                        />
                      </div>
                      {product.customization.sleeveTypes?.length > 0 && (
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Sleeve Style</label>
                          <select
                            value={customization.sleeveType}
                            onChange={(e) => setCustomization({ ...customization, sleeveType: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-yellow-200 bg-white text-sm focus:outline-none focus:border-yellow-500 transition-colors"
                          >
                            <option value="">Select Sleeve Type</option>
                            {product.customization.sleeveTypes.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      )}
                      {product.customization.giftWrapping && (
                        <label className="flex items-center gap-3 cursor-pointer p-3 bg-white rounded-xl border border-yellow-100 shadow-sm mt-2">
                          <div className="relative flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={customization.giftWrapping}
                              onChange={(e) => setCustomization({ ...customization, giftWrapping: e.target.checked })}
                              className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded focus:outline-none checked:bg-yellow-500 checked:border-yellow-500 transition-all cursor-pointer"
                            />
                            <FiCheck size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                          </div>
                          <span className="text-gray-700 text-sm font-medium">🎁 Add premium gift wrapping (+₹49)</span>
                        </label>
                      )}
                    </div>
                  </div>
                )}

                {/* Quantity & Actions */}
                {/* ── Price Breakdown & Delivery Info ─────────────────────────────── */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm mt-8 space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
                   <FiTruck className="text-yellow-600" size={20} />
                 </div>
                 <h3 className="text-gray-900 font-bold text-xl">Pricing & Delivery</h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-gray-500">
                   <span className="font-medium">Base Price</span>
                   <span className="font-bold text-gray-900">{formatPrice(product.price)}</span>
                </div>
                
                {product.discountPrice && (
                  <div className="flex justify-between items-center text-green-600">
                    <span className="font-medium">Discount Applied</span>
                    <span className="font-bold">-{formatPrice(product.price - product.discountPrice)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-gray-500">
                   <span className="font-medium">GST ({product.gstRate || 5}%)</span>
                   <span className="font-bold text-gray-900">Included</span>
                </div>

                <div className="flex justify-between items-center">
                   <span className="text-gray-500 font-medium">Standard Delivery</span>
                   <span className="text-yellow-600 font-bold">{formatPrice(product.deliveryFee || 99)}</span>
                </div>

                <div className="pt-6 border-t border-gray-50 flex justify-between items-end">
                   <div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Estimated Total</p>
                      <p className="text-indigo-600 font-black text-3xl">
                        {formatPrice((product.discountPrice || product.price) + (product.deliveryFee || 99))}
                      </p>
                   </div>
                   <div className="bg-green-50 text-green-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
                      Free Shipping Above ₹999
                   </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 pt-10">
                    <div className={`flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-2xl px-2 py-1 w-full sm:w-auto h-[52px] ${product.stock === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-200 rounded-xl transition-colors" disabled={product.stock === 0}>
                        <FiMinus size={18} />
                      </button>
                      <span className="text-gray-900 font-bold w-6 text-center text-lg">{product.stock === 0 ? 0 : quantity}</span>
                      <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-200 rounded-xl transition-colors" disabled={product.stock === 0 || quantity >= product.stock}>
                        <FiPlus size={18} />
                      </button>
                    </div>
                    
                    <div className="flex gap-3 w-full">
                      <button
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        className="flex-1 h-[52px] border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 rounded-2xl flex items-center justify-center gap-2 font-bold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:border-gray-200 disabled:text-gray-400"
                      >
                        {product.stock > 0 ? (
                          <>
                            <FiShoppingCart size={18} />
                            Add to Cart
                          </>
                        ) : (
                          'Out of Stock'
                        )}
                      </button>
                      <button
                        onClick={handleBuyNow}
                        disabled={product.stock === 0}
                        className="flex-1 h-[52px] bg-yellow-500 hover:bg-yellow-600 text-white rounded-2xl flex items-center justify-center gap-2 font-bold transition-colors shadow-md shadow-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {product.stock > 0 ? 'Buy Now' : 'Sold Out'}
                      </button>
                    </div>
                  </div>
                
                <div className="flex items-center justify-center gap-2 mb-8">
                  <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                  <span className={`text-sm font-semibold ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-500'}`}>
                    {product.stock > 10 ? 'In Stock & Ready to Ship' : product.stock > 0 ? `Hurry, only ${product.stock} left!` : 'Out of Stock'}
                  </span>
                </div>

                {/* Features Highlights */}
                <div className="grid grid-cols-3 gap-3 border-t border-gray-100 pt-6">
                  {[
                    { icon: FiTruck, text: 'Free Delivery', sub: 'above ₹999' },
                    { icon: FiShield, text: 'Secure Payment', sub: '100% safe' },
                    { icon: FiRefreshCw, text: 'Easy Returns', sub: '7-Day policy' },
                  ].map(({ icon: Icon, text, sub }) => (
                    <div key={text} className="text-center group">
                      <div className="w-12 h-12 mx-auto mb-2 bg-yellow-50 rounded-full flex items-center justify-center group-hover:bg-yellow-100 transition-colors">
                        <Icon className="text-yellow-600" size={20} />
                      </div>
                      <p className="text-gray-800 text-xs font-bold leading-tight">{text}</p>
                      <p className="text-gray-500 text-[10px] uppercase tracking-wider">{sub}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Product Details Specs */}
              <div className="mt-8 bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100">
                 <h3 className="text-lg font-bold text-gray-900 mb-5">Product Details</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  {product.fabric && (
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Fabric</span>
                      <span className="text-gray-800 font-medium">{product.fabric}</span>
                    </div>
                  )}
                  {product.brand && (
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Brand</span>
                      <span className="text-gray-800 font-medium">{product.brand}</span>
                    </div>
                  )}
                  {product.care && product.care.length > 0 && (
                    <div className="flex flex-col md:col-span-2 mt-2">
                      <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Wash Care</span>
                      <div className="flex flex-wrap gap-2">
                        {product.care.map((c, i) => (
                           <span key={i} className="bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-100">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}
                 </div>
              </div>
            </div>
          </div>

          {/* Full Description Section */}
          <div className="mt-12 bg-white rounded-3xl p-6 lg:p-10 shadow-sm border border-gray-100">
            <h3 className="font-display text-2xl font-bold text-gray-900 mb-6">Product Description</h3>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-loose whitespace-pre-line">{product.description}</p>
            </div>
            {product.features && product.features.length > 0 && (
              <div className="mt-8">
                <h4 className="text-gray-800 font-bold mb-4">Key Features</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {product.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="bg-white rounded-full p-1 shadow-sm mt-0.5">
                        <FiCheck className="text-yellow-500" size={14} />
                      </div>
                      <span className="text-gray-700 text-sm font-medium leading-tight">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Reviews */}
          <ReviewSection productId={product._id} />

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-20">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-display text-2xl font-bold text-gray-900">You May Also Like</h3>
                <Link to="/products" className="text-yellow-600 font-bold text-sm hover:underline flex items-center gap-1">
                  View All <FiChevronRight size={16} />
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Sticky Mobile Action Bar */}
      <div className="sticky-mobile-bar flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="flex-1 h-12 border-2 border-yellow-500 text-yellow-600 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all disabled:opacity-50"
        >
          <FiShoppingCart size={16} /> Cart
        </button>
        <button
          onClick={handleBuyNow}
          disabled={product.stock === 0}
          className="flex-[2] h-12 bg-yellow-500 text-white rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-lg shadow-yellow-100 disabled:opacity-50"
        >
          {product.stock > 0 ? 'Buy Now' : 'Sold Out'}
        </button>
      </div>

      {/* Size Guide Modal */}
      <AnimatePresence>
        {showSizeModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSizeModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800 font-display">Size Guide & Fit</h3>
                <button onClick={() => setShowSizeModal(false)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors">
                  <FiX size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                  <div className="flex flex-col items-center">
                    <img src={sizeGuideImg} alt="How to measure" className="w-full max-w-[280px] h-auto drop-shadow-xl" />
                    <div className="mt-8 space-y-4 w-full">
                       <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <p className="text-xs font-bold text-yellow-600 uppercase mb-1">How to Measure</p>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            Use a soft measuring tape. Keep it level and not too tight. Measure over your undergarments for the most accurate results.
                          </p>
                       </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="overflow-x-auto rounded-2xl border border-gray-100">
                      <table className="w-full text-sm">
                        <thead className="bg-yellow-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-yellow-700 uppercase">Size</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-yellow-700 uppercase">Chest</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-yellow-700 uppercase">Waist</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-yellow-700 uppercase">Hip</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {sizes.map((s) => (
                            <tr key={s.size} className={selectedSize === s.size ? 'bg-yellow-50/50' : ''}>
                              <td className="px-4 py-3 font-bold text-gray-800">{s.size}</td>
                              <td className="px-4 py-3 text-center text-gray-600">{s.chest}</td>
                              <td className="px-4 py-3 text-center text-gray-600">{s.waist}</td>
                              <td className="px-4 py-3 text-center text-gray-600">{s.hip}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-widest text-center">* All measurements are in inches</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                 <button 
                  onClick={() => setShowSizeModal(false)}
                  className="w-full py-4 bg-yellow-500 text-white font-bold rounded-2xl shadow-lg shadow-yellow-100 hover:bg-yellow-600 transition-colors"
                 >
                   Got it, thanks!
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductDetailPage;
