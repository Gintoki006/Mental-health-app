const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  deactivateAccount,
  refreshToken,
  logout
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateUserLogin,
  validateEmergencyContact
} = require('../middleware/validation');

// Public routes
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.put('/change-password', authenticateToken, changePassword);
router.put('/deactivate', authenticateToken, deactivateAccount);
router.post('/refresh-token', authenticateToken, refreshToken);
router.post('/logout', authenticateToken, logout);

// Emergency contact routes
router.put('/emergency-contact', authenticateToken, validateEmergencyContact, updateProfile);

module.exports = router;
