const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './backend/.env' });

const Coupon = require('./backend/models/Coupon');
const Cart = require('./backend/models/Cart');
const Product = require('./backend/models/Product');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    // Find the active cart (we can find one that has items)
    const cart = await Cart.findOne({ 'items.0': { $exists: true } }).populate('items.product');
    if (!cart) {
      console.log('No carts with items found.');
      return;
    }

    console.log(`Found Cart for user: ${cart.user}`);
    console.log(`Cart subtotal calculation:`);
    let subtotal = 0;
    cart.items.forEach(item => {
      const price = item.product?.discountPrice || item.product?.price || 0;
      console.log(`- Product: ${item.product?.name}, Qty: ${item.quantity}, Price: ${price}, Category: ${item.product?.category}`);
      subtotal += price * item.quantity;
    });
    console.log(`Calculated Subtotal: ₹${subtotal}`);

    // Find the Coupon
    const coupon = await Coupon.findOne({ code: 'SAVERE7RNXW9' });
    if (!coupon) {
      console.log('Coupon SAVERE7RNXW9 not found.');
      // Find any coupon
      const anyCoupon = await Coupon.findOne();
      console.log('Available coupons in DB:', await Coupon.find().select('code discountType discountValue'));
      return;
    }

    console.log('\n--- Coupon details ---');
    console.log(`Code: ${coupon.code}`);
    console.log(`discountType: ${coupon.discountType}`);
    console.log(`discountValue: ${coupon.discountValue}`);
    console.log(`applicableCategories:`, coupon.applicableCategories);
    console.log(`applicableProducts:`, coupon.applicableProducts);

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
