const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token - user not found' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    if (user.isLocked) {
      return res.status(401).json({ message: 'Account is temporarily locked' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(500).json({ message: 'Token verification failed' });
  }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive && !user.isLocked) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Check if user is moderator or admin
const requireModerator = (req, res, next) => {
  if (!req.user || !['moderator', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Moderator access required' });
  }
  next();
};

// Check if user owns resource or is admin
const requireOwnershipOrAdmin = (req, res, next) => {
  const resourceUserId = req.params.userId || req.body.userId;
  
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user._id.toString() !== resourceUserId && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  next();
};

// Rate limiting for sensitive operations
const sensitiveOperationLimit = (req, res, next) => {
  // This would typically use a more sophisticated rate limiting system
  // For now, we'll rely on the general rate limiter in server.js
  next();
};

// Validate emergency contact setup
const validateEmergencyContact = (req, res, next) => {
  const { emergencyContact } = req.body;
  
  if (emergencyContact && emergencyContact.isActive) {
    if (!emergencyContact.name || !emergencyContact.phone) {
      return res.status(400).json({ 
        message: 'Emergency contact name and phone are required when active' 
      });
    }
  }
  
  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  requireModerator,
  requireOwnershipOrAdmin,
  sensitiveOperationLimit,
  validateEmergencyContact
};
