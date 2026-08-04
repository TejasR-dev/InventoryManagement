const express = require('express');
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
// === IMPORT THE MIDDLEWARE ===
const { protect } = require('../middleware/authMiddleware');

// Public Routes (anyone can access)
router.route('/').get(getAllProducts);
router.route('/:id').get(getProductById);

// Protected Routes (only logged-in users can access)
router.route('/').post(protect, createProduct); // We add 'protect' before the controller
router.route('/:id').put(protect, updateProduct);
router.route('/:id').delete(protect, deleteProduct);

module.exports = router;