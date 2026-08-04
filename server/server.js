const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');

const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // To parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded data

// // Test database connection
// sequelize.authenticate()
//   .then(() => console.log('Database connected successfully.'))
//   .catch(err => console.error('Unable to connect to the database:', err));

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");

    await sequelize.sync();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error(err);
  }
})();

// Simple route for testing
app.get('/', (req, res) => {
  res.send('Welcome to the Inventory Management API!');
});

// Simple route for testing
app.get('/', (req, res) => {
  res.send('Welcome to the Inventory Management API!');
});

// === ADD THIS LINE ===
app.use('/api/products', require('./routes/productRoutes'));
// =====================

// User routes
app.use('/api/users', require('./routes/userRoutes'));

// Order routes
app.use('/api/orders', require('./routes/orderRoutes'));
// =====================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});