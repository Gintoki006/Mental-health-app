const cron = require('node-cron');
const User = require('../models/User');
const MoodEntry = require('../models/MoodEntry');
const twilio = require('twilio');

class EmergencyMonitor {
  constructor() {
    this.client = null;
    this.isInitialized = false;
    this.initializeTwilio();
  }

  initializeTwilio() {
    try {
      if (process.env.TWILIO_ACCOUNT_SID && 
          process.env.TWILIO_AUTH_TOKEN && 
          process.env.TWILIO_ACCOUNT_SID.startsWith('AC') &&
          process.env.TWILIO_AUTH_TOKEN.length > 20) {
        this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        this.isInitialized = true;
        console.log('Emergency Monitor: Twilio initialized successfully');
      } else {
        console.warn('Emergency Monitor: Twilio credentials not configured or invalid');
        this.isInitialized = false;
      }
    } catch (error) {
      console.error('Emergency Monitor: Failed to initialize Twilio:', error);
      this.isInitialized = false;
    }
  }

  // Calculate weekly average mood score
  async getWeeklyAverage(userId) {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const moodEntries = await MoodEntry.find({
        userId,
        date: { $gte: oneWeekAgo },
        isEmergency: { $ne: true } // Exclude emergency entries
      }).sort({ date: -1 });

      if (moodEntries.length === 0) {
        return null;
      }

      const totalScore = moodEntries.reduce((sum, entry) => sum + entry.score, 0);
      return totalScore / moodEntries.length;
    } catch (error) {
      console.error('Error calculating weekly average:', error);
      return null;
    }
  }

  // Check for emergency conditions
  async checkEmergencyConditions(user) {
    try {
      const recentMood = await MoodEntry.findOne({
        userId: user._id
      }).sort({ date: -1 });

      if (!recentMood) {
        return { isEmergency: false, reason: 'No mood data' };
      }

      // Check if mood score is critically low
      if (recentMood.score <= 2) {
        return { 
          isEmergency: true, 
          reason: 'Critical mood score',
          severity: 'high',
          score: recentMood.score
        };
      }

      // Check for sharp decline (50% drop in one day)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const yesterdayMood = await MoodEntry.findOne({
        userId: user._id,
        date: { $gte: yesterday }
      }).sort({ date: -1 });

      if (yesterdayMood && recentMood.score < (yesterdayMood.score * 0.5)) {
        return { 
          isEmergency: true, 
          reason: 'Sharp mood decline',
          severity: 'medium',
          score: recentMood.score,
          previousScore: yesterdayMood.score
        };
      }

      // Check against weekly average
      const weeklyAverage = await this.getWeeklyAverage(user._id);
      if (weeklyAverage && recentMood.score < (weeklyAverage * 0.4)) {
        return { 
          isEmergency: true, 
          reason: 'Significant drop from weekly average',
          severity: 'medium',
          score: recentMood.score,
          weeklyAverage: weeklyAverage
        };
      }

      return { isEmergency: false, reason: 'No emergency conditions detected' };
    } catch (error) {
      console.error('Error checking emergency conditions:', error);
      return { isEmergency: false, reason: 'Error in check' };
    }
  }

  // Send emergency SMS
  async sendEmergencySMS(user, emergencyData) {
    if (!this.isInitialized || !user.emergencyContact?.isActive) {
      console.log(`Emergency Monitor: Cannot send SMS for user ${user._id} - Twilio not initialized or no emergency contact`);
      return false;
    }

    try {
      let message = `EMERGENCY ALERT: ${user.firstName} ${user.lastName} may need immediate support.\n\n`;
      
      switch (emergencyData.reason) {
        case 'Critical mood score':
          message += `Their current mood score is ${emergencyData.score}/10, which indicates severe distress.\n`;
          break;
        case 'Sharp mood decline':
          message += `Their mood has dropped significantly from ${emergencyData.previousScore}/10 to ${emergencyData.score}/10.\n`;
          break;
        case 'Significant drop from weekly average':
          message += `Their current mood (${emergencyData.score}/10) is significantly below their weekly average (${emergencyAverage.toFixed(1)}/10).\n`;
          break;
      }

      message += `\nPlease check on them immediately. This is an automated alert from the Mental Health App.\n\n`;
      message += `If this is a life-threatening emergency, call 911 immediately.`;

      await this.client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: user.emergencyContact.phone
      });

      console.log(`Emergency Monitor: SMS sent to ${user.emergencyContact.phone} for user ${user._id}`);
      return true;
    } catch (error) {
      console.error('Emergency Monitor: Failed to send SMS:', error);
      return false;
    }
  }

  // Create emergency mood entry
  async createEmergencyEntry(user, emergencyData) {
    try {
      const emergencyEntry = new MoodEntry({
        userId: user._id,
        score: emergencyData.score,
        mood: emergencyData.score <= 2 ? 'very-low' : 'low',
        notes: `Emergency detected: ${emergencyData.reason}`,
        isEmergency: true,
        emergencyTriggered: true,
        emergencyData: {
          reason: emergencyData.reason,
          severity: emergencyData.severity,
          previousScore: emergencyData.previousScore,
          weeklyAverage: emergencyData.weeklyAverage
        }
      });

      await emergencyEntry.save();
      console.log(`Emergency Monitor: Emergency entry created for user ${user._id}`);
      return emergencyEntry;
    } catch (error) {
      console.error('Emergency Monitor: Failed to create emergency entry:', error);
      return null;
    }
  }

  // Main monitoring function
  async monitorUsers() {
    try {
      console.log('Emergency Monitor: Starting daily mood monitoring...');

      // Get all users with active emergency contacts
      const users = await User.find({
        'emergencyContact.isActive': true
      });

      console.log(`Emergency Monitor: Monitoring ${users.length} users`);

      for (const user of users) {
        try {
          // Check if user has recent mood data (within last 24 hours)
          const oneDayAgo = new Date();
          oneDayAgo.setDate(oneDayAgo.getDate() - 1);

          const recentMood = await MoodEntry.findOne({
            userId: user._id,
            date: { $gte: oneDayAgo }
          });

          if (!recentMood) {
            console.log(`Emergency Monitor: No recent mood data for user ${user._id}, skipping`);
            continue;
          }

          // Check for emergency conditions
          const emergencyData = await this.checkEmergencyConditions(user);

          if (emergencyData.isEmergency) {
            console.log(`Emergency Monitor: Emergency detected for user ${user._id}: ${emergencyData.reason}`);

            // Check if we already sent an alert for this user today
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const existingEmergency = await MoodEntry.findOne({
              userId: user._id,
              isEmergency: true,
              emergencyTriggered: true,
              date: { $gte: today }
            });

            if (existingEmergency) {
              console.log(`Emergency Monitor: Emergency alert already sent today for user ${user._id}, skipping`);
              continue;
            }

            // Send SMS and create emergency entry
            const smsSent = await this.sendEmergencySMS(user, emergencyData);
            await this.createEmergencyEntry(user, emergencyData);

            if (smsSent) {
              console.log(`Emergency Monitor: Emergency alert sent for user ${user._id}`);
            }
          }
        } catch (userError) {
          console.error(`Emergency Monitor: Error processing user ${user._id}:`, userError);
        }
      }

      console.log('Emergency Monitor: Daily monitoring completed');
    } catch (error) {
      console.error('Emergency Monitor: Error in monitoring process:', error);
    }
  }

  // Start the cron job
  start() {
    if (!this.isInitialized) {
      console.warn('Emergency Monitor: Cannot start - Twilio not initialized');
      return;
    }

    // Run daily at 9 AM
    cron.schedule('0 9 * * *', () => {
      console.log('Emergency Monitor: Running scheduled check...');
      this.monitorUsers();
    }, {
      scheduled: true,
      timezone: "America/New_York"
    });

    console.log('Emergency Monitor: Started - will run daily at 9 AM EST');
  }

  // Manual trigger for testing
  async runManualCheck() {
    console.log('Emergency Monitor: Running manual check...');
    await this.monitorUsers();
  }
}

module.exports = EmergencyMonitor;
