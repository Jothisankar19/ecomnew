import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShoppingCart, FiHeart, FiUser, FiSearch, FiMenu, FiX,
  FiChevronDown, FiLogOut, FiPackage, FiSettings
} from 'react-icons/fi';
import { toggleCart, toggleSearch, toggleMobileMenu, closeMobileMenu, openAuthModal } from '../../store/slices/uiSlice';
import { logoutUser } from '../../store/slices/authSlice';
import { selectCartCount } from '../../store/slices/cartSlice';
import { fetchCategories } from '../../store/slices/categorySlice';



const HARDCODED_CATEGORIES = [
  // By Type
  { name: '— By Type —', slug: null, isHeader: true },
  { name: 'Anarkali Kurtis', slug: 'anarkali-kurtis' },
  { name: 'A-Line Kurtis', slug: 'a-line-kurtis' },
  { name: 'Straight Kurtis', slug: 'straight-kurtis' },
  { name: 'Flared Kurtis', slug: 'flared-kurtis' },
  { name: 'Kaftan Kurtis', slug: 'kaftan-kurtis' },
  // By Design
  { name: '— By Design —', slug: null, isHeader: true },
  { name: 'Printed Kurtis', slug: 'printed-kurtis' },
  { name: 'Embroidered Kurtis', slug: 'embroidered-kurtis' },
  { name: 'Block Print Kurtis', slug: 'block-print-kurtis' },
  { name: 'Plain Kurtis', slug: 'plain-kurtis' },
];

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const userMenuRef = useRef(null);

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { mobileMenuOpen } = useSelector((state) => state.ui);
  const { categories: dynamicCategories } = useSelector((state) => state.categories);
  const cartCount = useSelector(selectCartCount);
  const wishlistCount = useSelector((state) => state.wishlist.items.length);

  const navCategories = dynamicCategories?.length > 0 
    ? [
        { name: '— Our Collections —', slug: null, isHeader: true },
        ...dynamicCategories.map(cat => ({ name: cat.name, slug: cat.slug }))
      ]
    : HARDCODED_CATEGORIES;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    dispatch(fetchCategories());
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dispatch]);

  useEffect(() => {
    dispatch(closeMobileMenu());
  }, [location, dispatch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white shadow-md border-b border-gray-100'
          : 'bg-white/95 backdrop-blur-sm border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">KE</span>
            </div>
            <div>
              <span className="font-display text-xl font-bold text-yellow-600">Kurti</span>
              <span className="font-display text-xl font-light text-gray-700 ml-1">Elegance</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/products" className="nav-link">All Products</Link>

            {/* Categories Dropdown */}
            <div className="relative" onMouseEnter={() => setCategoriesOpen(true)} onMouseLeave={() => setCategoriesOpen(false)}>
              <Link to="/categories" className="nav-link flex items-center gap-1">
                Collections <FiChevronDown size={14} className={`transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
              </Link>
              <AnimatePresence>
                {categoriesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100 max-h-96 overflow-y-auto"
                  >
                    {navCategories.map((cat, i) =>
                      cat.isHeader ? (
                        <p key={i} className="px-4 pt-3 pb-1 text-xs font-bold text-gray-400 uppercase tracking-widest">
                          {cat.name}
                        </p>
                      ) : (
                        <Link
                          key={cat.slug}
                          to={`/category/${cat.slug}`}
                          className="block px-4 py-2.5 text-sm text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 transition-colors"
                        >
                          {cat.name}
                        </Link>
                      )
                    )}
                    <div className="border-t border-gray-100 my-1"></div>
                    <Link
                      to="/categories"
                      className="block px-4 py-2.5 text-sm font-bold text-yellow-600 hover:bg-yellow-50 transition-colors"
                    >
                      View All Collections →
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/products?isTrending=true" className="nav-link">Trending</Link>
            <Link to="/products?isNewArrival=true" className="nav-link">New Arrivals</Link>
            <Link to="/about" className="nav-link">About Us</Link>
            <Link 
              to="/flash-sales" 
              className="nav-link flex items-center gap-1.5 text-yellow-600 hover:text-yellow-700 font-extrabold transition-all"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Flash Sale
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              onClick={() => dispatch(toggleSearch())}
              className="p-2 text-gray-500 hover:text-yellow-600 transition-colors rounded-full hover:bg-yellow-50"
              aria-label="Search"
            >
              <FiSearch size={20} />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2 text-gray-500 hover:text-pink-500 transition-colors rounded-full hover:bg-pink-50"
              aria-label="Wishlist"
            >
              <FiHeart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={() => dispatch(toggleCart())}
              className="relative p-2 text-gray-500 hover:text-yellow-600 transition-colors rounded-full hover:bg-yellow-50"
              aria-label="Cart"
            >
              <FiShoppingCart size={20} />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <img
                    src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${user?.name}&background=D4AF37&color=fff`}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-yellow-400"
                  />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 bg-yellow-50">
                        <p className="font-semibold text-gray-800">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 transition-colors text-sm">
                        <FiUser size={15} /> My Profile
                      </Link>
                      <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 transition-colors text-sm">
                        <FiPackage size={15} /> My Orders
                      </Link>
                      {user?.role === 'admin' && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-yellow-600 hover:bg-yellow-50 transition-colors text-sm font-medium">
                          <FiSettings size={15} /> Admin Panel
                        </Link>
                      )}
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 transition-colors text-sm border-t border-gray-100">
                        <FiLogOut size={15} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => dispatch(openAuthModal('login'))}
                className="hidden sm:flex btn-primary text-sm py-2 px-5"
              >
                Login
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => dispatch(toggleMobileMenu())}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] lg:hidden"
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-md" 
              onClick={() => dispatch(closeMobileMenu())}
            />
            
            {/* Menu Content */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col z-[110]"
              style={{ backgroundColor: '#ffffff' }}
            >
              <div className="p-6 flex items-center justify-between border-b border-gray-100 bg-white">
                <Link to="/" onClick={() => dispatch(closeMobileMenu())} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">KE</span>
                  </div>
                  <span className="font-display font-bold text-gray-800">Kurti Elegance</span>
                </Link>
                <button 
                  onClick={() => dispatch(closeMobileMenu())}
                  className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>
 
              <div className="flex-1 overflow-y-auto py-6 px-6 no-scrollbar bg-white">
                <div className="space-y-1 mb-8">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Quick Links</p>
                  {[
                    { label: 'Home', to: '/', icon: null },
                    { label: 'Flash Sale', to: '/flash-sales', icon: '⚡' },
                    { label: 'New Arrivals', to: '/products?isNewArrival=true', icon: '✨' },
                    { label: 'Trending Now', to: '/products?isTrending=true', icon: '🔥' },
                    { label: 'Shop All', to: '/products', icon: '🛍️' },
                    { label: 'Collections', to: '/categories', icon: '📁' },
                    { label: 'About Us', to: '/about', icon: '📖' },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => dispatch(closeMobileMenu())}
                      className="flex items-center justify-between py-4 border-b border-gray-50 group"
                    >
                      <span className="text-lg font-medium text-gray-700 group-hover:text-yellow-600 transition-colors">
                        {item.label} {item.icon && <span className="ml-1 text-sm">{item.icon}</span>}
                      </span>
                      <FiChevronDown size={14} className="text-gray-300 -rotate-90" />
                    </Link>
                  ))}
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Collections</p>
                  <div className="grid grid-cols-1 gap-1">
                    {navCategories.map((cat, index) => (
                      cat.isHeader ? (
                        <p key={`header-${index}`} className="px-3 pt-4 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-t border-gray-50 mt-2 first:mt-0 first:border-0 first:pt-0">
                          {cat.name}
                        </p>
                      ) : (
                        <Link
                          key={cat.slug}
                          to={`/category/${cat.slug}`}
                          onClick={() => dispatch(closeMobileMenu())}
                          className="flex items-center gap-3 p-3 rounded-2xl hover:bg-yellow-50 text-gray-600 hover:text-yellow-700 transition-all border border-transparent hover:border-yellow-100"
                        >
                          <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-400">
                            {cat.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium">{cat.name}</span>
                        </Link>
                      )
                    ))}
                  </div>
                </div>

                {/* Account Section for Mobile */}
                {isAuthenticated && (
                  <div className="space-y-1 mt-8 pb-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Account Settings</p>
                    <div className="grid grid-cols-1 gap-1">
                      <Link
                        to="/profile"
                        onClick={() => dispatch(closeMobileMenu())}
                        className="flex items-center gap-3 p-3 rounded-2xl hover:bg-yellow-50 text-gray-600 hover:text-yellow-700 transition-all"
                      >
                        <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                          <FiUser className="text-gray-400" size={16} />
                        </div>
                        <span className="text-sm font-medium">My Profile</span>
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => dispatch(closeMobileMenu())}
                        className="flex items-center gap-3 p-3 rounded-2xl hover:bg-yellow-50 text-gray-600 hover:text-yellow-700 transition-all"
                      >
                        <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                          <FiPackage className="text-gray-400" size={16} />
                        </div>
                        <span className="text-sm font-medium">My Orders</span>
                      </Link>
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => dispatch(closeMobileMenu())}
                          className="flex items-center gap-3 p-3 rounded-2xl bg-yellow-50 text-yellow-700 font-medium transition-all border border-yellow-100"
                        >
                          <div className="w-8 h-8 rounded-xl bg-yellow-100 flex items-center justify-center">
                            <FiSettings className="text-yellow-600" size={16} />
                          </div>
                          <span className="text-sm">Admin Panel</span>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-white border-t border-gray-100">
                {!isAuthenticated ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => { dispatch(closeMobileMenu()); dispatch(openAuthModal('login')); }}
                      className="bg-white text-gray-800 font-bold py-3.5 rounded-2xl shadow-sm border border-gray-200 text-sm hover:bg-gray-50 transition-colors"
                    >
                      Login
                    </button>
                    <button 
                      onClick={() => { dispatch(closeMobileMenu()); dispatch(openAuthModal('register')); }}
                      className="bg-yellow-500 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-yellow-200 text-sm hover:bg-yellow-600 transition-colors"
                    >
                      Join Now
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 text-red-500 font-bold py-3.5 bg-red-50 rounded-2xl border border-red-100 text-sm hover:bg-red-100 transition-colors"
                  >
                    <FiLogOut /> Logout Account
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
