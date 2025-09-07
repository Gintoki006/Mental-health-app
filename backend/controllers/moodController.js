const MoodEntry = require('../models/MoodEntry');
const User = require('../models/User');
const axios = require('axios');

// Create new mood entry
const createMoodEntry = async (req, res) => {
  try {
    const { score, mood, emotions, triggers, activities, sleep, notes } = req.body;
    
    // Create mood entry
    const moodEntry = new MoodEntry({
      userId: req.user._id,
      score,
      mood,
      emotions,
      triggers,
      activities,
      sleep,
      notes
    });

    // Analyze mood with AI service
    try {
      const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/analyze-mood`, {
        text: notes || '',
        score,
        mood,
        emotions
      });
      
      moodEntry.aiAnalysis = aiResponse.data.analysis;
    } catch (aiError) {
      console.error('AI analysis failed:', aiError.message);
      // Continue without AI analysis
    }

    // Check if emergency should be triggered
    const shouldTriggerEmergency = await moodEntry.shouldTriggerEmergency();
    if (shouldTriggerEmergency) {
      moodEntry.isEmergency = true;
      
      // Trigger emergency protocol
      try {
        await triggerEmergencyProtocol(req.user._id, moodEntry);
        moodEntry.emergencyTriggered = true;
      } catch (emergencyError) {
        console.error('Emergency protocol failed:', emergencyError.message);
      }
    }

    await moodEntry.save();

    res.status(201).json({
      message: 'Mood entry created successfully',
      moodEntry
    });
  } catch (error) {
    console.error('Create mood entry error:', error);
    res.status(500).json({ message: 'Failed to create mood entry', error: error.message });
  }
};

// Get user's mood entries
const getMoodEntries = async (req, res) => {
  try {
    const { limit = 30, offset = 0, days } = req.query;
    
    let query = { userId: req.user._id };
    
    if (days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      query.date = { $gte: startDate };
    }

    const moodEntries = await MoodEntry.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    res.json({ moodEntries });
  } catch (error) {
    console.error('Get mood entries error:', error);
    res.status(500).json({ message: 'Failed to get mood entries', error: error.message });
  }
};

// Get mood statistics
const getMoodStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    // Get mood trend
    const moodTrend = await MoodEntry.getMoodTrend(req.user._id, parseInt(days));
    
    // Get average mood
    const averageMood = await MoodEntry.getAverageMood(req.user._id, parseInt(days));
    
    // Get mood distribution
    const moodDistribution = await MoodEntry.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: '$mood',
          count: { $sum: 1 },
          averageScore: { $avg: '$score' }
        }
      }
    ]);

    // Get emotion frequency
    const emotionFrequency = await MoodEntry.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000) }
        }
      },
      { $unwind: '$emotions' },
      {
        $group: {
          _id: '$emotions.emotion',
          count: { $sum: 1 },
          averageIntensity: { $avg: '$emotions.intensity' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      moodTrend,
      averageMood,
      moodDistribution,
      emotionFrequency
    });
  } catch (error) {
    console.error('Get mood stats error:', error);
    res.status(500).json({ message: 'Failed to get mood statistics', error: error.message });
  }
};

// Get mood insights
const getMoodInsights = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    // Get recent mood entries with AI analysis
    const recentEntries = await MoodEntry.find({
      userId: req.user._id,
      date: { $gte: new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000) },
      'aiAnalysis.suggestions': { $exists: true, $ne: [] }
    })
    .sort({ date: -1 })
    .limit(10);

    // Extract common suggestions
    const allSuggestions = recentEntries.flatMap(entry => entry.aiAnalysis.suggestions);
    const suggestionFrequency = {};
    
    allSuggestions.forEach(suggestion => {
      suggestionFrequency[suggestion] = (suggestionFrequency[suggestion] || 0) + 1;
    });

    // Get top suggestions
    const topSuggestions = Object.entries(suggestionFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([suggestion, count]) => ({ suggestion, frequency: count }));

    // Get mood patterns
    const moodPatterns = await analyzeMoodPatterns(req.user._id, parseInt(days));

    res.json({
      topSuggestions,
      moodPatterns,
      recentInsights: recentEntries.map(entry => ({
        date: entry.date,
        score: entry.score,
        suggestions: entry.aiAnalysis.suggestions
      }))
    });
  } catch (error) {
    console.error('Get mood insights error:', error);
    res.status(500).json({ message: 'Failed to get mood insights', error: error.message });
  }
};

// Update mood entry
const updateMoodEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const moodEntry = await MoodEntry.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!moodEntry) {
      return res.status(404).json({ message: 'Mood entry not found' });
    }

    res.json({
      message: 'Mood entry updated successfully',
      moodEntry
    });
  } catch (error) {
    console.error('Update mood entry error:', error);
    res.status(500).json({ message: 'Failed to update mood entry', error: error.message });
  }
};

// Delete mood entry
const deleteMoodEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const moodEntry = await MoodEntry.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!moodEntry) {
      return res.status(404).json({ message: 'Mood entry not found' });
    }

    res.json({ message: 'Mood entry deleted successfully' });
  } catch (error) {
    console.error('Delete mood entry error:', error);
    res.status(500).json({ message: 'Failed to delete mood entry', error: error.message });
  }
};

// Helper function to analyze mood patterns
const analyzeMoodPatterns = async (userId, days) => {
  const moodEntries = await MoodEntry.find({
    userId,
    date: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
  }).sort({ date: 1 });

  const patterns = {
    weeklyPattern: {},
    triggerPatterns: {},
    activityPatterns: {}
  };

  // Analyze weekly patterns
  moodEntries.forEach(entry => {
    const dayOfWeek = entry.date.getDay();
    if (!patterns.weeklyPattern[dayOfWeek]) {
      patterns.weeklyPattern[dayOfWeek] = { scores: [], count: 0 };
    }
    patterns.weeklyPattern[dayOfWeek].scores.push(entry.score);
    patterns.weeklyPattern[dayOfWeek].count++;
  });

  // Calculate average scores for each day
  Object.keys(patterns.weeklyPattern).forEach(day => {
    const dayData = patterns.weeklyPattern[day];
    dayData.averageScore = dayData.scores.reduce((a, b) => a + b, 0) / dayData.scores.length;
  });

  // Analyze trigger patterns
  moodEntries.forEach(entry => {
    if (entry.triggers) {
      entry.triggers.forEach(trigger => {
        if (!patterns.triggerPatterns[trigger]) {
          patterns.triggerPatterns[trigger] = { scores: [], count: 0 };
        }
        patterns.triggerPatterns[trigger].scores.push(entry.score);
        patterns.triggerPatterns[trigger].count++;
      });
    }
  });

  // Analyze activity patterns
  moodEntries.forEach(entry => {
    if (entry.activities) {
      entry.activities.forEach(activity => {
        if (!patterns.activityPatterns[activity]) {
          patterns.activityPatterns[activity] = { scores: [], count: 0 };
        }
        patterns.activityPatterns[activity].scores.push(entry.score);
        patterns.activityPatterns[activity].count++;
      });
    }
  });

  return patterns;
};

// Helper function to trigger emergency protocol
const triggerEmergencyProtocol = async (userId, moodEntry) => {
  const user = await User.findById(userId);
  
  if (!user.emergencyContact || !user.emergencyContact.isActive) {
    console.log('No emergency contact configured for user:', userId);
    return;
  }

  // Send SMS to emergency contact
  const twilio = require('twilio');
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  const message = `URGENT: ${user.firstName} ${user.lastName} has reported a mental health emergency. 
    Mood score: ${moodEntry.score}/10. 
    Please check on them immediately. 
    This is an automated message from the Mental Health App.`;

  try {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: user.emergencyContact.phone
    });
    
    console.log('Emergency SMS sent to:', user.emergencyContact.phone);
  } catch (error) {
    console.error('Failed to send emergency SMS:', error);
    throw error;
  }
};

module.exports = {
  createMoodEntry,
  getMoodEntries,
  getMoodStats,
  getMoodInsights,
  updateMoodEntry,
  deleteMoodEntry
};
