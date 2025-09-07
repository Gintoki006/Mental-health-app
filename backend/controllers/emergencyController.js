const User = require('../models/User');
const MoodEntry = require('../models/MoodEntry');
const EmergencyMonitor = require('../services/emergencyMonitor');

// Test emergency contact
const testEmergencyContact = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.emergencyContact || !user.emergencyContact.isActive) {
      return res.status(400).json({ 
        message: 'No active emergency contact configured' 
      });
    }
    
    // Send test SMS
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    const message = `TEST MESSAGE: This is a test from the Mental Health App. 
      ${user.firstName} ${user.lastName} is testing their emergency contact setup. 
      If you receive this message, the emergency system is working correctly.`;
    
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: user.emergencyContact.phone
    });
    
    res.json({ message: 'Test message sent successfully' });
  } catch (error) {
    console.error('Test emergency contact error:', error);
    res.status(500).json({ 
      message: 'Failed to send test message', 
      error: error.message 
    });
  }
};

// Get emergency statistics
const getEmergencyStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const emergencyEntries = await MoodEntry.find({
      userId: req.user._id,
      isEmergency: true,
      date: { $gte: startDate }
    }).sort({ date: -1 });
    
    const stats = {
      totalEmergencies: emergencyEntries.length,
      triggeredEmergencies: emergencyEntries.filter(entry => entry.emergencyTriggered).length,
      recentEmergencies: emergencyEntries.slice(0, 5)
    };
    
    res.json({ stats });
  } catch (error) {
    console.error('Get emergency stats error:', error);
    res.status(500).json({ 
      message: 'Failed to get emergency statistics', 
      error: error.message 
    });
  }
};

// Manual emergency trigger
const triggerEmergency = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.emergencyContact || !user.emergencyContact.isActive) {
      return res.status(400).json({ 
        message: 'No active emergency contact configured' 
      });
    }
    
    // Send emergency SMS
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    const message = `EMERGENCY ALERT: ${user.firstName} ${user.lastName} has manually triggered an emergency alert. 
      Please check on them immediately. 
      This is an automated message from the Mental Health App.`;
    
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: user.emergencyContact.phone
    });
    
    // Create emergency mood entry
    const emergencyEntry = new MoodEntry({
      userId: req.user._id,
      score: 1,
      mood: 'very-low',
      notes: 'Manual emergency trigger',
      isEmergency: true,
      emergencyTriggered: true
    });
    
    await emergencyEntry.save();
    
    res.json({ message: 'Emergency alert sent successfully' });
  } catch (error) {
    console.error('Trigger emergency error:', error);
    res.status(500).json({ 
      message: 'Failed to trigger emergency alert', 
      error: error.message 
    });
  }
};

// Get emergency resources
const getEmergencyResources = async (req, res) => {
  try {
    const resources = {
      hotlines: [
        {
          name: 'National Suicide Prevention Lifeline',
          number: '988',
          description: '24/7 crisis support'
        },
        {
          name: 'Crisis Text Line',
          number: 'Text HOME to 741741',
          description: '24/7 crisis support via text'
        },
        {
          name: 'National Alliance on Mental Illness (NAMI)',
          number: '1-800-950-NAMI (6264)',
          description: 'Mental health support and resources'
        }
      ],
      websites: [
        {
          name: 'National Institute of Mental Health',
          url: 'https://www.nimh.nih.gov/',
          description: 'Mental health information and resources'
        },
        {
          name: 'Mental Health America',
          url: 'https://www.mhanational.org/',
          description: 'Mental health advocacy and resources'
        }
      ],
      apps: [
        {
          name: 'My3',
          description: 'Safety planning app'
        },
        {
          name: 'Safety Plan',
          description: 'Crisis intervention app'
        }
      ]
    };
    
    res.json({ resources });
  } catch (error) {
    console.error('Get emergency resources error:', error);
    res.status(500).json({ 
      message: 'Failed to get emergency resources', 
      error: error.message 
    });
  }
};

// Manual emergency check (for testing/admin use)
const runEmergencyCheck = async (req, res) => {
  try {
    const emergencyMonitor = new EmergencyMonitor();
    await emergencyMonitor.runManualCheck();
    
    res.json({ 
      message: 'Emergency check completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Manual emergency check error:', error);
    res.status(500).json({ 
      message: 'Failed to run emergency check', 
      error: error.message 
    });
  }
};

module.exports = {
  testEmergencyContact,
  getEmergencyStats,
  triggerEmergency,
  getEmergencyResources,
  runEmergencyCheck
};
