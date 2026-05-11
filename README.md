# Ethnic Elegance — Premium Fashion E-Commerce Platform

A fully functional, production-ready fashion e-commerce platform built with React, Node.js, MongoDB, and Razorpay.

---

## Tech Stack

**Frontend:** React 18, Tailwind CSS, Framer Motion, Three.js / React Three Fiber, GSAP, Redux Toolkit, Axios, React Router DOM, Recharts, Swiper

**Backend:** Node.js, Express.js, MongoDB Atlas, JWT Authentication, bcrypt.js, Cloudinary, Multer, Nodemailer

**Payment:** Razorpay (UPI, Cards, Net Banking, Wallets)

---

## Project Structure

```
ecommerce/
├── backend/
│   ├── config/          # Cloudinary config
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, upload middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   └── server.js        # Entry point
└── frontend/
    ├── public/
    └── src/
        ├── components/  # Reusable UI components
        ├── pages/       # Route pages
        │   └── admin/   # Admin dashboard pages
        ├── store/       # Redux slices
        └── utils/       # API client, helpers
```

---

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values (see below)
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

## Environment Variables (backend/.env)

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/fashion-ecommerce

JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRE=30d

# Cloudinary — https://cloudinary.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay — https://razorpay.com
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Email (Gmail App Password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password

CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

---

## Features

### Customer
- Browse products with filters (category, price, size, rating, trending)
- Product detail with 3D viewer, zoom, color/size selection
- Product customization (embroidery text, sleeve type, gift wrapping)
- Shopping cart with coupon codes, GST calculation, free shipping threshold
- Wishlist sync across devices
- Razorpay checkout (UPI, Cards, Net Banking, Wallets, COD)
- Order tracking with real-time status timeline
- Return/cancel requests
- Reviews & ratings (verified purchase badge)
- Profile management with saved addresses
- Animated trending orders banner (live sales notifications)

### Admin Dashboard
- Revenue analytics with charts (7D / 30D / 12M)
- Category revenue breakdown (pie chart)
- Order management with status updates & tracking numbers
- Product CRUD with image upload to Cloudinary
- User management (activate/block)
- Category management
- Coupon creation and management
- Inventory monitoring with low-stock alerts

### UI/UX
- Glassmorphism design system
- Framer Motion page transitions & micro-interactions
- Three.js 3D floating orb hero section
- Auto-sliding hero banners with parallax
- Skeleton loaders
- Animated floating sales notifications
- Fully responsive (mobile, tablet, desktop)
- PWA ready

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| POST | /api/auth/forgot-password | Send reset email |
| PUT | /api/auth/reset-password/:token | Reset password |
| GET | /api/products | Get products (with filters) |
| GET | /api/products/featured | Get featured/trending |
| GET | /api/products/:id | Get single product |
| GET | /api/products/:id/related | Get related products |
| GET | /api/products/search | Search products |
| POST | /api/products | Create product (admin) |
| PUT | /api/products/:id | Update product (admin) |
| DELETE | /api/products/:id | Delete product (admin) |
| GET | /api/cart | Get cart |
| POST | /api/cart/add | Add to cart |
| PUT | /api/cart/update/:itemId | Update quantity |
| DELETE | /api/cart/remove/:itemId | Remove item |
| POST | /api/cart/apply-coupon | Apply coupon |
| GET | /api/wishlist | Get wishlist |
| POST | /api/wishlist/toggle/:productId | Toggle wishlist |
| POST | /api/orders | Create order |
| GET | /api/orders/my-orders | Get user orders |
| GET | /api/orders/:id | Get order detail |
| PUT | /api/orders/:id/cancel | Cancel order |
| PUT | /api/orders/:id/return | Request return |
| POST | /api/payments/create-order | Create Razorpay order |
| POST | /api/payments/verify | Verify payment |
| POST | /api/payments/webhook | Razorpay webhook |
| GET | /api/admin/dashboard | Dashboard stats |
| GET | /api/admin/analytics/revenue | Revenue charts |
| GET | /api/admin/users | All users |
| GET | /api/admin/inventory | Inventory report |
| GET | /api/admin/trending-orders | Trending banner data |

---

## Deployment

### Frontend → Vercel
```bash
cd frontend && npm run build
# Deploy /build folder to Vercel
# Set REACT_APP_API_URL=https://your-backend.onrender.com/api
```

### Backend → Render
```bash
# Connect GitHub repo to Render
# Set all environment variables in Render dashboard
# Build command: npm install
# Start command: node server.js
```

### Database → MongoDB Atlas
1. Create free cluster at mongodb.com/atlas
2. Add IP whitelist: 0.0.0.0/0 (for Render)
3. Copy connection string to MONGO_URI

---

## Creating an Admin User

After registering, update the user role in MongoDB Atlas:
```js
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

---

## License

MIT © 2026 Ethnic Elegance
