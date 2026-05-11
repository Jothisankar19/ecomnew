import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/wishlist');
    return data.wishlist;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (productId, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/wishlist/toggle/${productId}`);
    toast.success(data.message);
    return { productId, isWishlisted: data.isWishlisted };
  } catch (error) {
    toast.error('Please login to add to wishlist');
    return rejectWithValue(error.response?.data?.message);
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    loading: false,
  },
  reducers: {
    clearWishlist: (state) => { state.items = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.items = action.payload || [];
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        const { productId, isWishlisted } = action.payload;
        if (isWishlisted) {
          if (!state.items.find(item => (item._id || item) === productId)) {
            state.items.push(productId);
          }
        } else {
          state.items = state.items.filter(item => (item._id || item) !== productId);
        }
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export const selectIsWishlisted = (productId) => (state) =>
  state.wishlist.items.some(item => (item._id || item) === productId);
export default wishlistSlice.reducer;
