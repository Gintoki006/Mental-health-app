const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendationController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Recommendation routes
router.get('/', getRecommendations);

module.exports = router;
