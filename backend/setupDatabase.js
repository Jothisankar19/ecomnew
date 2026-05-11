/**
 * Database Setup Script — Kurti Elegance
 * Run ONCE after connecting to a new MongoDB cluster:
 *   node setupDatabase.js
 *
 * This will:
 *   ✅ Create all collections
 *   ✅ Create indexes for fast queries
 *   ✅ Create admin user
 *   ✅ Create default kurti categories
 */

require('dotenv').config()
const mongoose = require('mongoose')

const ADMIN = {
  name: 'Kurti Elegance Admin',
  email: 'admin@kurtiegance.com',
  password: 'Admin@2026',
  role: 'admin',
  isVerified: true,
  isActive: true,
  phone: '9876543210',
}

const CATEGORIES = [
  { name: 'Anarkali Kurtis',     slug: 'anarkali-kurtis',     description: 'Flared & elegant anarkali style kurtis' },
  { name: 'A-Line Kurtis',       slug: 'a-line-kurtis',       description: 'Slim & flattering A-line kurtis' },
  { name: 'Straight Kurtis',     slug: 'straight-kurtis',     description: 'Classic straight cut kurtis' },
  { name: 'Printed Kurtis',      slug: 'printed-kurtis',      description: 'Bold & vibrant printed kurtis' },
  { name: 'Embroidered Kurtis',  slug: 'embroidered-kurtis',  description: 'Intricate embroidered kurtis' },
  { name: 'Cotton Kurtis',       slug: 'cotton-kurtis',       description: 'Comfortable everyday cotton kurtis' },
  { name: 'Party Wear Kurtis',   slug: 'party-wear-kurtis',   description: 'Glamorous party wear kurtis' },
  { name: 'Office Kurtis',       slug: 'office-kurtis',       description: 'Professional office wear kurtis' },
  { name: 'Festival Kurtis',     slug: 'festival-kurtis',     description: 'Vibrant festival kurtis' },
  { name: 'Casual Kurtis',       slug: 'casual-kurtis',       description: 'Comfortable everyday casual kurtis' },
  { name: "Women's Kurtis",      slug: 'womens-kurtis',       description: 'Kurtis for women 18-45 years' },
  { name: "Girls' Kurtis",       slug: 'girls-kurtis',        description: 'Kurtis for girls 8-17 years' },
  { name: 'Block Print Kurtis',  slug: 'block-print-kurtis',  description: 'Handcrafted block print kurtis' },
  { name: 'Flared Kurtis',       slug: 'flared-kurtis',       description: 'Free & flowy flared kurtis' },
  { name: 'Kaftan Kurtis',       slug: 'kaftan-kurtis',       description: 'Comfortable kaftan style kurtis' },
]

async function setup() {
  console.log('🔄 Connecting to MongoDB...')

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    })
    console.log('✅ MongoDB Connected:', mongoose.connection.host)
    console.log('')
  } catch (err) {
    console.error('❌ Connection failed:', err.message)
    console.error('   Check your MONGO_URI in backend/.env')
    process.exit(1)
  }

  const User     = require('./models/User')
  const Category = require('./models/Category')
  const Product  = require('./models/Product')
  const Order    = require('./models/Order')
  const Cart     = require('./models/Cart')
  const Review   = require('./models/Review')
  const Coupon   = require('./models/Coupon')
  const Payment  = require('./models/Payment')

  // ── 1. Create indexes ──────────────────────────────────────
  console.log('📑 Creating database indexes...')
  try {
    await Product.createIndexes()
    await User.createIndexes()
    await Order.createIndexes()
    await Category.createIndexes()
    console.log('   ✅ Indexes created')
  } catch (err) {
    console.log('   ⚠️  Index creation:', err.message)
  }

  // ── 2. Create categories ───────────────────────────────────
  console.log('')
  console.log('🏷️  Creating kurti categories...')
  let catCount = 0
  for (const cat of CATEGORIES) {
    try {
      const existing = await Category.findOne({ slug: cat.slug })
      if (!existing) {
        await Category.create({ ...cat, isActive: true, sortOrder: catCount })
        console.log(`   ✅ Created: ${cat.name}`)
        catCount++
      } else {
        console.log(`   ⏭️  Exists:  ${cat.name}`)
      }
    } catch (err) {
      console.log(`   ❌ Failed:  ${cat.name} — ${err.message}`)
    }
  }

  // ── 3. Create admin user ───────────────────────────────────
  console.log('')
  console.log('👤 Setting up admin user...')
  try {
    const existing = await User.findOne({ email: ADMIN.email })
    if (existing) {
      existing.role = 'admin'
      existing.isActive = true
      existing.isVerified = true
      existing.password = ADMIN.password
      await existing.save()
      console.log('   ✅ Admin user updated')
    } else {
      await User.create(ADMIN)
      console.log('   ✅ Admin user created')
    }
  } catch (err) {
    console.log('   ❌ Admin creation failed:', err.message)
  }

  // ── 4. Create a sample coupon ──────────────────────────────
  console.log('')
  console.log('🎟️  Creating sample coupon...')
  try {
    const existing = await Coupon.findOne({ code: 'WELCOME10' })
    if (!existing) {
      await Coupon.create({
        code: 'WELCOME10',
        description: '10% off on first order',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 500,
        maxDiscount: 200,
        usageLimit: 1000,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true,
      })
      console.log('   ✅ Coupon WELCOME10 created (10% off, min ₹500)')
    } else {
      console.log('   ⏭️  Coupon WELCOME10 already exists')
    }
  } catch (err) {
    console.log('   ⚠️  Coupon:', err.message)
  }

  // ── Summary ────────────────────────────────────────────────
  const totalCats = await Category.countDocuments()
  const totalUsers = await User.countDocuments()

  console.log('')
  console.log('═══════════════════════════════════════════')
  console.log('  ✅ DATABASE SETUP COMPLETE')
  console.log('═══════════════════════════════════════════')
  console.log(`  Categories : ${totalCats}`)
  console.log(`  Users      : ${totalUsers}`)
  console.log('')
  console.log('  Admin Login:')
  console.log(`  URL      : http://localhost:3000/admin/login`)
  console.log(`  Email    : ${ADMIN.email}`)
  console.log(`  Password : ${ADMIN.password}`)
  console.log('')
  console.log('  Sample Coupon: WELCOME10 (10% off)')
  console.log('═══════════════════════════════════════════')

  await mongoose.disconnect()
  process.exit(0)
}

setup()
