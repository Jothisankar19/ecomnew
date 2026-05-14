const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  createOrder, getMyOrders, getOrder, cancelOrder,
  requestReturn, getAllOrders, updateOrderStatus, deleteOrder, downloadOrderReceipt
} = require('../controllers/orderController');

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/admin/all', protect, adminOnly, getAllOrders);
router.get('/:id', protect, getOrder);
router.get('/:id/receipt', protect, downloadOrderReceipt);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/return', protect, requestReturn);
router.put('/admin/:id/status', protect, adminOnly, updateOrderStatus);
router.delete('/admin/:id', protect, adminOnly, deleteOrder);

module.exports = router;
