const express = require('express');
const router = express.Router();
const {
  testEmergencyContact,
  getEmergencyStats,
  triggerEmergency,
  getEmergencyResources,
  runEmergencyCheck
} = require('../controllers/emergencyController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Emergency routes
router.post('/test', testEmergencyContact);
router.get('/stats', getEmergencyStats);
router.post('/trigger', triggerEmergency);
router.get('/resources', getEmergencyResources);
router.post('/check', runEmergencyCheck);

module.exports = router;
