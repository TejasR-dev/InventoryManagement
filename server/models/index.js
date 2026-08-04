const sequelize = require('../config/database');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const User = require('./User');

// Define Associations
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

// Sync all models
const syncModels = async () => {
  await sequelize.sync();
};

module.exports = {
  Product,
  Order,
  OrderItem,
  User,
  syncModels,
};