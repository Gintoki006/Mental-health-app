const express = require('express');
const router = express.Router();
const {
  createCommunity,
  getCommunitiesByCategory,
  getUserCommunities,
  joinCommunity,
  leaveCommunity,
  getCommunity,
  updateCommunity,
  deleteCommunity,
  getCommunityMembers
} = require('../controllers/communityController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateCommunityCreation } = require('../middleware/validation');

// Public routes
router.get('/category/:category', getCommunitiesByCategory);

// Protected routes
router.use(authenticateToken);

router.post('/', validateCommunityCreation, createCommunity);
router.get('/my-communities', getUserCommunities);
router.get('/:id', getCommunity);
router.put('/:id', updateCommunity);
router.delete('/:id', deleteCommunity);
router.get('/:id/members', getCommunityMembers);
router.post('/:id/join', joinCommunity);
router.post('/:id/leave', leaveCommunity);

module.exports = router;
