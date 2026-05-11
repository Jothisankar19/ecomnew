import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/cart');
    return data.cart;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const addToCart = createAsyncThunk('cart/add', async (item, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/cart/add', item);
    toast.success('Added to cart! 🛒');
    return data.cart;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to add to cart');
    return rejectWithValue(error.response?.data?.message);
  }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ itemId, quantity }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/cart/update/${itemId}`, { quantity });
    return data.cart;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const removeFromCart = createAsyncThunk('cart/remove', async (itemId, { rejectWithValue }) => {
  try {
    const { data } = await api.delete(`/cart/remove/${itemId}`);
    toast.success('Removed from cart');
    return data.cart;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const applyCoupon = createAsyncThunk('cart/applyCoupon', async ({ code, orderAmount }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/cart/apply-coupon', { code, orderAmount });
    toast.success(data.message);
    return data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Invalid coupon');
    return rejectWithValue(error.response?.data?.message);
  }
});

export const clearCart = createAsyncThunk('cart/clear', async () => {
  await api.delete('/cart/clear');
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    coupon: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCartLocal: (state) => {
      state.items = [];
      state.coupon = null;
    },
    setCoupon: (state, action) => {
      state.coupon = action.payload;
    },
    removeCouponLocal: (state) => {
      state.coupon = null;
    },
  },
  extraReducers: (builder) => {
    const setCart = (state, action) => {
      state.loading = false;
      if (action.payload) {
        state.items = action.payload.items || [];
        state.coupon = action.payload.coupon || null;
      }
    };
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, setCart)
      .addCase(fetchCart.rejected, (state) => { state.loading = false; })
      .addCase(addToCart.pending, (state) => { state.loading = true; })
      .addCase(addToCart.fulfilled, setCart)
      .addCase(addToCart.rejected, (state) => { state.loading = false; })
      .addCase(updateCartItem.fulfilled, setCart)
      .addCase(removeFromCart.fulfilled, setCart)
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.coupon = { code: action.payload.coupon.code, discount: action.payload.discount };
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.coupon = null;
      });
  },
});

export const { clearCartLocal, setCoupon, removeCouponLocal } = cartSlice.actions;

// Base selector
const selectCartState = (state) => state.cart;

// Memoized selectors
export const selectCartItems = createSelector(
  [selectCartState],
  (cart) => cart.items?.filter(i => !i.savedForLater) || []
);

export const selectSavedItems = createSelector(
  [selectCartState],
  (cart) => cart.items?.filter(i => i.savedForLater) || []
);

export const selectCartCount = createSelector(
  [selectCartItems],
  (items) => items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
);

export const selectCartSubtotal = createSelector(
  [selectCartItems],
  (items) => items.reduce((sum, item) => {
    const price = Number(item.product?.discountPrice || item.product?.price || item.price || 0)
    const qty = Number(item.quantity) || 1
    return sum + (price * qty)
  }, 0)
);

export default cartSlice.reducer;
