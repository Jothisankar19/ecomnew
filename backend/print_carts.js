const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

// Register models in order
const Category = require('./models/Category');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');
const User = require('./models/User');
const Cart = require('./models/Cart');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const carts = await Cart.find()
      .populate({
        path: 'items.product',
        populate: { path: 'category' }
      })
      .populate('user', 'name email');
      
    console.log('\n--- ALL CARTS IN DB ---');
    carts.forEach((cart, index) => {
      console.log(`\nCart #${index + 1}:`);
      console.log(`User: ${cart.user?.name} (${cart.user?.email || 'N/A'}), ID: ${cart.user?._id}`);
      console.log(`Coupon Applied:`, cart.coupon);
      let subtotal = 0;
      cart.items.forEach(item => {
        if (item.product) {
          const price = item.product.discountPrice || item.product.price || 0;
          console.log(`  - Product: "${item.product.name}" (ID: ${item.product._id}), Qty: ${item.quantity}, Price: ₹${price}, Category ID: ${item.product.category?._id || item.product.category}, Category Name: ${item.product.category?.name}`);
          subtotal += price * item.quantity;
        } else {
          console.log(`  - Product: [NULL/DELETED] (ID: ${item.product}), Qty: ${item.quantity}`);
        }
      });
      console.log(`Calculated Subtotal: ₹${subtotal}`);
    });

  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
