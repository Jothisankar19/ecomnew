/**
 * Run this script ONCE to create/reset the admin user:
 *   node createAdmin.js
 */

const mongoose = require('mongoose')
require('dotenv').config()

const ADMIN_EMAIL = 'admin@kurtiegance.com'
const ADMIN_PASSWORD = 'Admin@2026'
const ADMIN_NAME = 'Kurti Elegance Admin'

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ MongoDB connected')

    const User = require('./models/User')

    const existing = await User.findOne({ email: ADMIN_EMAIL })

    if (existing) {
      // Force update all admin fields
      existing.role = 'admin'
      existing.isVerified = true
      existing.isActive = true
      existing.password = ADMIN_PASSWORD  // will be hashed by pre-save hook
      existing.name = ADMIN_NAME
      await existing.save()
      console.log('✅ Admin user updated!')
    } else {
      await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin',
        isVerified: true,
        isActive: true,
        phone: '9876543210',
      })
      console.log('✅ Admin user created!')
    }

    console.log('')
    console.log('  ┌─────────────────────────────────┐')
    console.log('  │       ADMIN CREDENTIALS          │')
    console.log('  ├─────────────────────────────────┤')
    console.log(`  │  Email   : ${ADMIN_EMAIL}  │`)
    console.log(`  │  Password: ${ADMIN_PASSWORD}           │`)
    console.log('  ├─────────────────────────────────┤')
    console.log('  │  Login : http://localhost:3000/login  │')
    console.log('  │  Admin : http://localhost:3000/admin  │')
    console.log('  └─────────────────────────────────┘')
    process.exit(0)
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

createAdmin()
