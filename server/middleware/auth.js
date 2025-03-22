const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');
  
  console.log('Authentication middleware checking token:', token ? 'Token provided' : 'No token');

  // Check if no token
  if (!token) {
    console.log('Authentication failed: No token provided');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const secretKey = process.env.JWT_SECRET || 'quantasharesecret';
    console.log('Attempting to verify token with secret key length:', secretKey.length);
    
    const decoded = jwt.verify(token, secretKey);
    console.log('Token verified successfully for user ID:', decoded.user.id);
    
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(401).json({ message: 'Token is not valid', error: err.message });
  }
};