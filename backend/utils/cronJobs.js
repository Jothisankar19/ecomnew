const cron = require('node-cron');
const FlashVoucher = require('../models/FlashVoucher');
const cache = require('./cache');

// Initialize Cron Jobs
const initCronJobs = () => {
  console.log('⏰ Initializing Flash Sale Voucher Scheduler Daemon...');

  // Running every minute to check scheduled & active flash vouchers
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();

      // 1. Activate scheduled vouchers
      const toActivate = await FlashVoucher.find({
        status: 'scheduled',
        startTime: { $lte: now }
      });

      if (toActivate.length > 0) {
        for (const voucher of toActivate) {
          voucher.status = 'active';
          await voucher.save();
          console.log(`⚡ [Cron] Automatically Activated Flash Voucher: ${voucher.code}`);
        }
        await cache.del('active_flash_vouchers');
      }

      // 2. Expire active vouchers
      const toExpire = await FlashVoucher.find({
        status: 'active',
        endTime: { $lte: now }
      });

      if (toExpire.length > 0) {
        for (const voucher of toExpire) {
          voucher.status = 'expired';
          await voucher.save();
          console.log(`⏱️ [Cron] Automatically Expired Flash Voucher: ${voucher.code}`);
        }
        await cache.del('active_flash_vouchers');
      }
    } catch (err) {
      console.error('❌ [Cron] Error running Flash Sale scheduler cron job:', err.message);
    }
  });
};

module.exports = {
  initCronJobs
};
