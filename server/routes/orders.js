const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  createOrder,
  getSalesmanOrders,
  getAllOrders,
  updateOrderStatus,
  getOrderByQrId,
  getOrderDetails,
  getSalesmanStats
} = require('../controllers/orderController');

// Public route - get order by QR ID
router.get('/public/qr/:qrId', getOrderByQrId);

// All other routes require authentication
router.use(auth);

// Salesman routes
router.post('/salesman/orders', authorize('salesman'), createOrder);
router.get('/salesman/orders', authorize('salesman'), getSalesmanOrders);
router.get('/salesman/orders/:id', authorize('salesman'), getOrderDetails);

// Admin routes
router.get('/admin/orders', authorize('admin'), getAllOrders);
router.put('/admin/orders/:id/status', authorize('admin'), updateOrderStatus);
router.get('/admin/orders/:id', authorize('admin'), getOrderDetails);
// Get Salesman Statistics
router.get('/salesman/:id/stats', auth, authorize('salesman', 'admin'), getSalesmanStats);
module.exports = router;