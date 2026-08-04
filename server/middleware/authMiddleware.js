const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  // Check if the token is sent in the headers and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 1. Get token from header (e.g., "Bearer eyJhbGci...")
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify the token using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Get the user from the database using the id from the token
      // We attach the user to the request object so we can access it in our controllers
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] } // Exclude the password from the user object
      });

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // 4. Move on to the next step (the actual route controller)
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};