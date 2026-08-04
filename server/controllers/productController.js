const Product = require('../models/product');

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (we'll add auth later)
exports.createProduct = async (req, res) => {
  try {
    const { name, sku, description, quantity, price } = req.body;

    // Basic validation
    if (!name || !sku || !price) {
      return res.status(400).json({ message: 'Please provide name, SKU, and price.' });
    }

    const newProduct = await Product.create({
      name,
      sku,
      description,
      quantity,
      price
    });

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// ... (keep createProduct and getAllProducts functions)

// @desc    Get a single product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (we'll add auth later)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, description, quantity, price } = req.body;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update the product's fields
    product.name = name || product.name;
    product.sku = sku || product.sku;
    product.description = description || product.description;
    product.quantity = quantity === undefined ? product.quantity : quantity;
    product.price = price || product.price;

    await product.save();

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (we'll add auth later)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.destroy();

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};