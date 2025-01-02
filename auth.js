require('dotenv').config();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

const auth = (req, res, next) => {
  // Check if the Authorization header is present
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header is missing' });
  }

  // Extract the token from the Authorization header
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: 'Token is missing from Authorization header' });
  }

  // Verify the token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId; // Attach the decoded user object to the request
    next(); // Call the next middleware
  } catch (error) {
    return res
      .status(401)
      .json({ message: 'Invalid jwt token', error: error.message });
  }
};

module.exports = auth;
