const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

// @desc    Get all products with filters
// @route   GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const {
      keyword, category, minPrice, maxPrice, rating, size, color,
      sort, page = 1, limit = 12, isFeatured, isTrending, isNewArrival, isBestSeller
    } = req.query;

    const query = { isActive: true };

    if (keyword) {
      query.$text = { $search: keyword };
    }
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (rating) query.ratings = { $gte: Number(rating) };
    if (size) query['sizes.size'] = size;
    if (color) query['colors.name'] = { $regex: color, $options: 'i' };
    if (isFeatured === 'true') query.isFeatured = true;
    if (isTrending === 'true') query.isTrending = true;
    if (isNewArrival === 'true') query.isNewArrival = true;
    if (isBestSeller === 'true') query.isBestSeller = true;

    let sortObj = {};
    switch (sort) {
      case 'price_asc': sortObj = { price: 1 }; break;
      case 'price_desc': sortObj = { price: -1 }; break;
      case 'rating': sortObj = { ratings: -1 }; break;
      case 'newest': sortObj = { createdAt: -1 }; break;
      case 'popular': sortObj = { sold: -1 }; break;
      default: sortObj = { createdAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');

    // Build query — only include _id condition if it's a valid ObjectId
    const isObjectId = mongoose.Types.ObjectId.isValid(id) && id.length === 24;
    const query = isObjectId
      ? { $or: [{ _id: id }, { slug: id }], isActive: true }
      : { slug: id, isActive: true };

    const product = await Product.findOne(query).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create product (Admin)
// @route   POST /api/products
exports.createProduct = async (req, res) => {
  try {
    // Strip internal calculator fields
    const { _gst, _shipping, _freeShipAbove, discountPercent, ...productData } = req.body;

    // Parse numeric fields
    if (productData.price !== undefined) productData.price = Number(productData.price);
    if (productData.discountPrice !== undefined) {
      productData.discountPrice = productData.discountPrice === '' ? undefined : Number(productData.discountPrice);
    }
    if (productData.stock !== undefined) productData.stock = Number(productData.stock);

    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'ethnic-elegance/products', transformation: [{ width: 800, height: 1000, crop: 'limit' }] },
            (error, result) => {
              if (error) reject(error);
              else resolve({ public_id: result.public_id, url: result.secure_url });
            }
          );
          stream.end(file.buffer);
        });
      });
      productData.images = await Promise.all(imagePromises);
    }
    const product = await Product.create(productData);
    res.status(201).json({ success: true, message: 'Product created successfully', product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Strip internal calculator fields that shouldn't be saved
    const { _gst, _shipping, _freeShipAbove, discountPercent, ...updateData } = req.body;

    // Explicitly parse numeric fields to prevent string storage
    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.discountPrice !== undefined) {
      updateData.discountPrice = updateData.discountPrice === '' ? undefined : Number(updateData.discountPrice);
    }
    if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);

    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'ethnic-elegance/products' },
            (error, result) => {
              if (error) reject(error);
              else resolve({ public_id: result.public_id, url: result.secure_url });
            }
          );
          stream.end(file.buffer);
        });
      });
      const newImages = await Promise.all(imagePromises);
      updateData.images = [...(product.images || []), ...newImages];
    }

    // Apply updates
    Object.keys(updateData).forEach(key => {
      product[key] = updateData[key];
    });

    await product.save();
    
    // Fetch again to populate
    product = await Product.findById(product._id).populate('category', 'name slug');

    res.json({ success: true, message: 'Product updated successfully', product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    // Delete images from Cloudinary
    for (const image of product.images) {
      if (image.public_id) {
        await cloudinary.uploader.destroy(image.public_id);
      }
    }
    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get featured/trending products
// @route   GET /api/products/featured
exports.getFeaturedProducts = async (req, res) => {
  try {
    const [featured, trending, newArrivals, bestSellers] = await Promise.all([
      Product.find({ isFeatured: true, isActive: true }).limit(8).populate('category', 'name'),
      Product.find({ isTrending: true, isActive: true }).limit(8).populate('category', 'name'),
      Product.find({ isNewArrival: true, isActive: true }).sort({ createdAt: -1 }).limit(8).populate('category', 'name'),
      Product.find({ isBestSeller: true, isActive: true }).sort({ sold: -1 }).limit(8).populate('category', 'name')
    ]);
    res.json({ success: true, featured, trending, newArrivals, bestSellers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get related products
// @route   GET /api/products/:id/related
exports.getRelatedProducts = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const { id } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(id) && id.length === 24;

    const product = isObjectId
      ? await Product.findOne({ $or: [{ _id: id }, { slug: id }] })
      : await Product.findOne({ slug: id });

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true
    }).limit(6).populate('category', 'name');
    res.json({ success: true, products: related });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search products
// @route   GET /api/products/search
exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, products: [] });
    const products = await Product.find({
      $text: { $search: q },
      isActive: true
    }).limit(10).populate('category', 'name').lean();
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
