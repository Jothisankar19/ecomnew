const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(morgan('dev'));

// Rate limiting — relaxed for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// More relaxed limiter for public/polling endpoints
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/admin/trending-orders', publicLimiter);
app.use('/api/products/featured', publicLimiter);

// CORS
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      process.env.CLIENT_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:5173',
    ]
    // Allow Vercel preview URLs and production
    if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/flash-sales', require('./routes/flashVoucherRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/hero-slides', require('./routes/heroSlideRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Kurti Elegance API is running', timestamp: new Date() });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    name: 'Kurti Elegance API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      auth: '/api/auth/login',
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Database Connection & Server Startup
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('');
    console.error('🔧 Fix checklist:');
    console.error('   1. Log in to cloud.mongodb.com');
    console.error('   2. Click "Connect" on your cluster → Drivers → copy the URI');
    console.error('   3. Paste it as MONGO_URI in backend/.env');
    console.error('   4. Network Access → Add IP: 0.0.0.0/0');
    console.error('   5. Make sure cluster is not paused');
    process.exit(1);
  }
};

const { initCronJobs } = require('./utils/cronJobs');

const { exec } = require('child_process');

const killPortProcess = (port) => {
  return new Promise((resolve) => {
    if (process.platform === 'win32') {
      exec(`netstat -ano | findstr :${port}`, (err, stdout) => {
        if (err || !stdout) return resolve();
        const lines = stdout.split('\n');
        const pids = new Set();
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 5) {
            const localAddress = parts[1];
            if (localAddress.endsWith(`:${port}`) || localAddress.endsWith(`.${port}`)) {
              const pid = parts[parts.length - 1];
              if (parseInt(pid) > 0) {
                pids.add(pid);
              }
            }
          }
        });
        if (pids.size === 0) return resolve();
        let killedCount = 0;
        pids.forEach(pid => {
          exec(`taskkill /F /PID ${pid}`, () => {
            killedCount++;
            if (killedCount === pids.size) {
              setTimeout(resolve, 1000); // 1s buffer for OS socket release
            }
          });
        });
      });
    } else {
      exec(`lsof -t -i:${port}`, (err, stdout) => {
        if (err || !stdout) {
          exec(`fuser -k ${port}/tcp`, () => setTimeout(resolve, 1000));
          return;
        }
        const pids = stdout.trim().split('\n');
        let killedCount = 0;
        pids.forEach(pid => {
          exec(`kill -9 ${pid}`, () => {
            killedCount++;
            if (killedCount === pids.size) {
              setTimeout(resolve, 1000);
            }
          });
        });
      });
    }
  });
};

const startServer = (PORT) => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 API: http://localhost:${PORT}/api`);
    console.log(`🔑 Admin: http://localhost:3000/admin/login`);
    initCronJobs();
  });

  server.on('error', async (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${PORT} is in use. Attempting to free the port...`);
      await killPortProcess(PORT);
      console.log(`✅ Port ${PORT} freed. Restarting server...`);
      startServer(PORT);
    } else {
      console.error('Server error:', err);
    }
  });
};

connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  startServer(PORT);
});

module.exports = app;
