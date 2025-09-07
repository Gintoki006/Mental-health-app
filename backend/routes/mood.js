const express = require('express');
const router = express.Router();
const {
  createMoodEntry,
  getMoodEntries,
  getMoodStats,
  getMoodInsights,
  updateMoodEntry,
  deleteMoodEntry
} = require('../controllers/moodController');
const { authenticateToken } = require('../middleware/auth');
const { validateMoodEntry } = require('../middleware/validation');

// All routes require authentication
router.use(authenticateToken);

// Mood entry routes
router.post('/', validateMoodEntry, createMoodEntry);
router.get('/', getMoodEntries);
router.get('/stats', getMoodStats);
router.get('/insights', getMoodInsights);
router.put('/:id', updateMoodEntry);
router.delete('/:id', deleteMoodEntry);

module.exports = router;
