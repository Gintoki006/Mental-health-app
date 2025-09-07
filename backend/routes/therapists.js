const express = require('express');
const router = express.Router();
const {
  searchTherapists,
  getTherapist,
  addReview,
  getAvailability,
  getSpecializations
} = require('../controllers/therapistController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateTherapistSearch } = require('../middleware/validation');

// Public routes
router.get('/search', validateTherapistSearch, searchTherapists);
router.get('/specializations', getSpecializations);
router.get('/:id', optionalAuth, getTherapist);
router.get('/:id/availability', optionalAuth, getAvailability);

// Protected routes
router.post('/:id/review', authenticateToken, addReview);

module.exports = router;
