// Format currency in INR
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price || 0)
}

// Calculate discount percentage
export const calcDiscount = (original, discounted) => {
  if (!original || !discounted) return 0;
  return Math.round(((original - discounted) / original) * 100);
};

// Truncate text
export const truncate = (text, length = 100) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

// Format date
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
};

// Format date short
export const formatDateShort = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
};

// Get order status color — light theme
export const getStatusColor = (status) => {
  const colors = {
    processing:       'text-yellow-700 bg-yellow-100',
    confirmed:        'text-blue-700 bg-blue-100',
    packed:           'text-purple-700 bg-purple-100',
    shipped:          'text-indigo-700 bg-indigo-100',
    out_for_delivery: 'text-orange-700 bg-orange-100',
    delivered:        'text-green-700 bg-green-100',
    cancelled:        'text-red-700 bg-red-100',
    return_requested: 'text-pink-700 bg-pink-100',
    returned:         'text-gray-700 bg-gray-100',
  }
  return colors[status] || 'text-gray-700 bg-gray-100'
}

// Get order status label
export const getStatusLabel = (status) => {
  const labels = {
    processing: 'Processing',
    confirmed: 'Confirmed',
    packed: 'Packed',
    shipped: 'Shipped',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    return_requested: 'Return Requested',
    returned: 'Returned',
  };
  return labels[status] || status;
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Generate star rating array
export const generateStars = (rating) => {
  return Array.from({ length: 5 }, (_, i) => {
    if (i < Math.floor(rating)) return 'full';
    if (i < rating) return 'half';
    return 'empty';
  });
};

// Calculate cart totals — always use Number() to prevent string concatenation bugs
export const calculateCartTotals = (items, couponDiscount = 0) => {
  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.product?.discountPrice || item.product?.price || item.price || 0)
    const qty = Number(item.quantity) || 1
    return sum + (price * qty)
  }, 0)
  const shipping = subtotal > 999 ? 0 : 99
  const tax = Math.round((subtotal - couponDiscount) * 0.05)
  const total = subtotal - couponDiscount + shipping + tax
  return { subtotal, shipping, tax, total, couponDiscount }
}

// Validate Indian phone number
export const validatePhone = (phone) => /^[6-9]\d{9}$/.test(phone);

// Validate email
export const validateEmail = (email) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);

// Get image URL with fallback
export const getImageUrl = (image, fallback = 'https://via.placeholder.com/400x500?text=No+Image') => {
  if (!image) return fallback;
  if (typeof image === 'string') return image;
  return image.url || fallback;
};

// Scroll to top
export const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};
