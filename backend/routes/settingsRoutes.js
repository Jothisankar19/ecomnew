const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getSettings, updateSettings, getMaintenanceStatus } = require('../controllers/settingsController');

router.get('/maintenance', getMaintenanceStatus);
router.get('/', getSettings);
router.put('/', protect, adminOnly, updateSettings);

module.exports = router;
