import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    cartOpen: false,
    searchOpen: false,
    mobileMenuOpen: false,
    authModalOpen: false,
    authModalMode: 'login',
    loading: false,
    trendingBannerVisible: true,
  },
  reducers: {
    toggleCart: (state) => { state.cartOpen = !state.cartOpen; },
    openCart: (state) => { state.cartOpen = true; },
    closeCart: (state) => { state.cartOpen = false; },
    toggleSearch: (state) => { state.searchOpen = !state.searchOpen; },
    closeSearch: (state) => { state.searchOpen = false; },
    toggleMobileMenu: (state) => { state.mobileMenuOpen = !state.mobileMenuOpen; },
    closeMobileMenu: (state) => { state.mobileMenuOpen = false; },
    openAuthModal: (state, action) => {
      state.authModalOpen = true;
      state.authModalMode = action.payload || 'login';
    },
    closeAuthModal: (state) => { state.authModalOpen = false; },
    setAuthModalMode: (state, action) => { state.authModalMode = action.payload; },
    setLoading: (state, action) => { state.loading = action.payload; },
    hideTrendingBanner: (state) => { state.trendingBannerVisible = false; },
  },
});

export const {
  toggleCart, openCart, closeCart,
  toggleSearch, closeSearch,
  toggleMobileMenu, closeMobileMenu,
  openAuthModal, closeAuthModal, setAuthModalMode,
  setLoading, hideTrendingBanner
} = uiSlice.actions;

export default uiSlice.reducer;
