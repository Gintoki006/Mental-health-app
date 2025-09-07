const express = require('express');
const router = express.Router();
const {
  sendChatMessage,
  getChatHistory,
  getUserChatHistory,
  sendCommunityMessage,
  getCommunityMessages,
  addReaction,
  removeReaction,
  deleteMessage
} = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/auth');
const { validateChatMessage } = require('../middleware/validation');

// All routes require authentication
router.use(authenticateToken);

// Bot chat routes
router.post('/bot', validateChatMessage, sendChatMessage);
router.get('/bot/history', getChatHistory);
router.get('/user/history', getUserChatHistory);

// Community chat routes
router.post('/community', validateChatMessage, sendCommunityMessage);
router.get('/community/:roomId', getCommunityMessages);

// Message interaction routes
router.post('/message/:messageId/reaction', addReaction);
router.delete('/message/:messageId/reaction', removeReaction);
router.delete('/message/:messageId', deleteMessage);

module.exports = router;
