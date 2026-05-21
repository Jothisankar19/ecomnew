const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const Coupon = require('./models/Coupon');
const Cart = require('./models/Cart');
const Product = require('./models/Product');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    // 1. Find all coupons in DB
    const coupons = await Coupon.find();
    console.log('\n--- ALL COUPONS IN DB ---');
    coupons.forEach(c => {
      console.log(`Code: ${c.code}, discountType: ${c.discountType}, discountValue: ${c.discountValue}, applicableCategories: ${JSON.stringify(c.applicableCategories)}, applicableProducts: ${JSON.stringify(c.applicableProducts)}`);
    });

    // Find the coupon SAVERE7RNXW9 specifically
    const coupon = await Coupon.findOne({ code: 'SAVERE7RNXW9' });
    if (!coupon) {
      console.log('\nCoupon SAVERE7RNXW9 NOT found in database!');
      return;
    }

    console.log('\n--- TARGET COUPON DETAILS ---');
    console.log(JSON.stringify(coupon, null, 2));

    // 2. Find a cart with populated products
    const carts = await Cart.find().populate('items.product');
    let cart = null;
    for (const c of carts) {
      const hasProduct = c.items.some(i => i.product);
      if (hasProduct) {
        cart = c;
        break;
      }
    }

    if (!cart) {
      console.log('No carts with populated products found.');
      return;
    }

    console.log(`\nFound valid Cart for user: ${cart.user}`);
    let subtotal = 0;
    cart.items.forEach(item => {
      if (item.product) {
        const price = item.product.discountPrice || item.product.price || 0;
        console.log(`- Product: ${item.product.name}, Qty: ${item.quantity}, Price: ${price}, Category: ${item.product.category}`);
        subtotal += price * item.quantity;
      }
    });
    console.log(`Calculated Subtotal: ₹${subtotal}`);

    console.log('\n--- Simulating validity check ---');
    const validity = coupon.isValid(subtotal, cart.user);
    console.log(`isValid:`, validity);

    console.log('\n--- Simulating calculateDiscount ---');
    const discount = coupon.calculateDiscount(cart.items, subtotal);
    console.log(`Calculated discount: ₹${discount}`);

    // Let's trace variables inside calculateDiscount manually
    const hasCategoryRestriction = coupon.applicableCategories && coupon.applicableCategories.length > 0;
    const hasProductRestriction = coupon.applicableProducts && coupon.applicableProducts.length > 0;
    console.log(`hasCategoryRestriction:`, hasCategoryRestriction);
    console.log(`hasProductRestriction:`, hasProductRestriction);

    if (hasCategoryRestriction || hasProductRestriction) {
      console.log('Tracing filter process:');
      const eligibleItems = cart.items.filter(item => {
        const product = item.product || {};
        const prodId = (product._id || product).toString();
        const catId = (item.category?._id || item.category || product.category?._id || product.category || '').toString();
        
        console.log(`  Checking item product name: ${product.name}`);
        console.log(`  prodId: ${prodId}`);
        console.log(`  catId: ${catId}`);
        
        const matchesCategory = !hasCategoryRestriction || 
          coupon.applicableCategories.some(cat => {
            console.log(`    Comparing cat: ${cat.toString()} === ${catId}`);
            return cat.toString() === catId;
          });
        const matchesProduct = !hasProductRestriction || 
          coupon.applicableProducts.some(p => {
            console.log(`    Comparing prod: ${p.toString()} === ${prodId}`);
            return p.toString() === prodId;
          });
          
        console.log(`  matchesCategory: ${matchesCategory}, matchesProduct: ${matchesProduct}`);
        return matchesCategory && matchesProduct;
      });

      console.log(`eligibleItems length:`, eligibleItems.length);
      const eligibleAmount = eligibleItems.reduce((sum, item) => {
        const price = item.price || (item.product?.discountPrice || item.product?.price || 0);
        return sum + (price * item.quantity);
      }, 0);
      console.log(`eligibleAmount: ₹${eligibleAmount}`);
    }

  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
