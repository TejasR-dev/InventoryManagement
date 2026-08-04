const express = require('express');
const router = express.Router();
const { getAllOrders, createOrder,updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// All order routes are protected
router.use(protect);

router.route('/')
  .get(getAllOrders)
  .post(createOrder);

// === ADD THIS ROUTE ===
router.route('/:id/status').patch(updateOrderStatus);
// ======================

module.exports = router;