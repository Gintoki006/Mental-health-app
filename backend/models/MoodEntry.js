const mongoose = require('mongoose');

const moodEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  mood: {
    type: String,
    required: true,
    enum: ['very-low', 'low', 'moderate', 'good', 'very-good', 'excellent']
  },
  emotions: [{
    emotion: {
      type: String,
      enum: ['happy', 'sad', 'angry', 'anxious', 'calm', 'excited', 'frustrated', 'grateful', 'lonely', 'confident', 'overwhelmed', 'peaceful', 'stressed', 'hopeful', 'worried']
    },
    intensity: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  triggers: [String],
  activities: [String],
  sleep: {
    hours: Number,
    quality: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent']
    }
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  aiAnalysis: {
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral']
    },
    confidence: Number,
    keywords: [String],
    suggestions: [String]
  },
  isEmergency: {
    type: Boolean,
    default: false
  },
  emergencyTriggered: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
moodEntrySchema.index({ userId: 1, date: -1 });
moodEntrySchema.index({ userId: 1, score: 1 });
moodEntrySchema.index({ isEmergency: 1 });

// Virtual for mood description
moodEntrySchema.virtual('moodDescription').get(function() {
  const descriptions = {
    'very-low': 'Very Low (1-2)',
    'low': 'Low (3-4)',
    'moderate': 'Moderate (5-6)',
    'good': 'Good (7-8)',
    'very-good': 'Very Good (9)',
    'excellent': 'Excellent (10)'
  };
  return descriptions[this.mood];
});

// Static method to get user's mood trend
moodEntrySchema.statics.getMoodTrend = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.find({
    userId,
    date: { $gte: startDate }
  }).sort({ date: 1 });
};

// Static method to get average mood score
moodEntrySchema.statics.getAverageMood = async function(userId, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const result = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        averageScore: { $avg: '$score' },
        count: { $sum: 1 }
      }
    }
  ]);
  
  return result.length > 0 ? result[0] : { averageScore: 0, count: 0 };
};

// Method to check if emergency should be triggered
moodEntrySchema.methods.shouldTriggerEmergency = async function() {
  // Check if current score is critically low
  if (this.score <= 2) {
    return true;
  }
  
  // Check if there's a drastic drop from recent average
  const recentAverage = await this.constructor.getAverageMood(this.userId, 7);
  if (recentAverage.averageScore > 0 && (recentAverage.averageScore - this.score) >= 4) {
    return true;
  }
  
  return false;
};

module.exports = mongoose.model('MoodEntry', moodEntrySchema);
