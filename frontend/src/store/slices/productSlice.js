import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/products', { params });
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const fetchFeaturedProducts = createAsyncThunk('products/fetchFeatured', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/products/featured');
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const fetchProduct = createAsyncThunk('products/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/products/${id}`);
    return data.product;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const searchProducts = createAsyncThunk('products/search', async (query, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/products/search', { params: { q: query } });
    return data.products;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    product: null,
    featured: null,
    searchResults: [],
    total: 0,
    pages: 0,
    page: 1,
    loading: false,
    error: null,
    filters: {
      category: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      size: '',
      sort: 'newest',
    },
    recentlyViewed: [],
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { category: '', minPrice: '', maxPrice: '', rating: '', size: '', sort: 'newest' };
    },
    addToRecentlyViewed: (state, action) => {
      const exists = state.recentlyViewed.find(p => p._id === action.payload._id);
      if (!exists) {
        state.recentlyViewed = [action.payload, ...state.recentlyViewed].slice(0, 10);
      }
    },
    clearSearchResults: (state) => { state.searchResults = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
        state.page = action.payload.page;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featured = action.payload;
      })
      .addCase(fetchProduct.pending, (state) => { state.loading = true; })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      });
  },
});

export const { setFilters, clearFilters, addToRecentlyViewed, clearSearchResults } = productSlice.actions;
export default productSlice.reducer;
