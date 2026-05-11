const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
dotenv.config();

const isConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== 'your_api_key';

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('✅ Cloudinary configured:', process.env.CLOUDINARY_CLOUD_NAME);
} else {
  console.log('⚠️  Cloudinary not configured — image uploads disabled');
}

module.exports = cloudinary;
