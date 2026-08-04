const sequelize = require('../config/database');
const { Order, OrderItem, Product } = require('../models');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      // Include associated items and the product details for each item
      include: {
        model: OrderItem,
        as: 'items',
        include: {
          model: Product,
        },
      },
      order: [['createdAt', 'DESC']], // Show latest orders first
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  // Expected body: { customerName: "John Doe", items: [{ productId: 1, quantity: 2 }, ...] }
  const { customerName, items } = req.body;

  // Use a transaction to ensure all operations succeed or none do
  const t = await sequelize.transaction();

  try {
    if (!customerName || !items || items.length === 0) {
      return res.status(400).json({ message: 'Customer name and items are required.' });
    }

    let totalAmount = 0;
    const orderItemsData = [];

    // First pass: Validate stock and calculate total amount
    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction: t });

      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found.`);
      }
      if (product.quantity < item.quantity) {
        throw new Error(`Not enough stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`);
      }
      
      totalAmount += product.price * item.quantity;
      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: product.price,
      });
    }

    // Create the order
    const newOrder = await Order.create({
      customerName,
      orderDate: new Date(),
      totalAmount,
    }, { transaction: t });

    // Create the order items and update product stock
    for (const itemData of orderItemsData) {
      // Create the entry in the OrderItems table
      await OrderItem.create({
        orderId: newOrder.id,
        ...itemData,
      }, { transaction: t });

      // Decrement the product's quantity
      await Product.decrement('quantity', {
        by: itemData.quantity,
        where: { id: itemData.productId },
        transaction: t,
      });
    }

    // If everything is successful, commit the transaction
    await t.commit();
    res.status(201).json(newOrder);

  } catch (error) {
    // If any error occurred, roll back the transaction
    await t.rollback();
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

// ... (keep getAllOrders and createOrder)

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // You might want to add validation here to ensure 'status' is a valid value
    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};