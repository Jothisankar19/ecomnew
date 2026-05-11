import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials)
    return data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Login failed')
  }
})

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', userData)
    return data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Registration failed')
  }
})

// User-initiated logout — shows toast
export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try { await api.post('/auth/logout') } catch {}
  return { showToast: true }
})

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me')
    return data
  } catch (error) {
    // 401 = stale token, silently clear — not an error to show user
    return rejectWithValue(null)
  }
})

export const googleLogin = createAsyncThunk('auth/googleLogin', async (googleData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/google', googleData)
    return data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Google login failed')
  }
})

export const verifyOTP = createAsyncThunk('auth/verifyOTP', async (otpData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/verify-otp', otpData)
    return data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'OTP verification failed')
  }
})

const clearAuthState = (state) => {
  state.user = null
  state.token = null
  state.isAuthenticated = false
  state.loading = false
  state.error = null
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null },
    setToken: (state, action) => { state.token = action.payload },
    updateUser: (state, action) => { state.user = { ...state.user, ...action.payload } },
    // Silent logout — no toast (used by 401 interceptor)
    silentLogout: (state) => { clearAuthState(state) },
  },
  extraReducers: (builder) => {
    builder
      // ── Login ──────────────────────────────────────────────
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
        toast.success(`Welcome back, ${action.payload.user?.name?.split(' ')[0]}! 👋`)
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        if (action.payload) toast.error(action.payload)
      })

      // ── Register ───────────────────────────────────────────
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
        toast.success(`Welcome, ${action.payload.user?.name?.split(' ')[0]}! Account created 🎉`)
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        if (action.payload) toast.error(action.payload)
      })

      // ── Logout (user-initiated) ────────────────────────────
      .addCase(logoutUser.fulfilled, (state, action) => {
        clearAuthState(state)
        if (action.payload?.showToast) {
          toast.success('Logged out successfully')
        }
      })

      // ── Get Me (token validation on app load) ──────────────
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.isAuthenticated = true
        state.loading = false
      })
      .addCase(getMe.rejected, (state) => {
        // Stale token — clear silently, no toast, no error
        clearAuthState(state)
      })

      // ── Google Login ───────────────────────────────────────
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        toast.success('Logged in with Google! 🎉')
      })
      .addCase(googleLogin.rejected, (state, action) => {
        if (action.payload) toast.error(action.payload)
      })
  },
})

export const { clearError, setToken, updateUser, silentLogout } = authSlice.actions
export default authSlice.reducer
