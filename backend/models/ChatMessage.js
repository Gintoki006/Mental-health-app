const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roomId: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text',
    },
    isBot: {
      type: Boolean,
      default: false,
    },
    botResponse: {
      moodAnalysis: {
        score: Number,
        sentiment: String,
        confidence: Number,
      },
      suggestions: [String],
      emergencyTriggered: {
        type: Boolean,
        default: false,
      },
    },
    metadata: {
      timestamp: {
        type: Date,
        default: Date.now,
      },
      edited: {
        type: Boolean,
        default: false,
      },
      editedAt: Date,
      reactions: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          emoji: String,
          timestamp: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
chatMessageSchema.index({ roomId: 1, createdAt: -1 });
chatMessageSchema.index({ userId: 1, createdAt: -1 });
chatMessageSchema.index({ isBot: 1 });

// Virtual for formatted timestamp
chatMessageSchema.virtual('formattedTime').get(function () {
  return this.metadata.timestamp.toLocaleTimeString();
});

// Static method to get messages for a room
chatMessageSchema.statics.getRoomMessages = async function (
  roomId,
  limit = 50,
  offset = 0
) {
  return await this.find({
    roomId,
    isDeleted: false,
  })
    .populate('userId', 'username profilePicture')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset);
};

// Static method to get user's chat history
chatMessageSchema.statics.getUserChatHistory = async function (
  userId,
  limit = 100
) {
  return await this.find({
    userId,
    isDeleted: false,
  })
    .populate('userId', 'username profilePicture')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Method to add reaction
chatMessageSchema.methods.addReaction = function (userId, emoji) {
  // Remove existing reaction from this user
  this.metadata.reactions = this.metadata.reactions.filter(
    (reaction) => !reaction.userId.equals(userId)
  );

  // Add new reaction
  this.metadata.reactions.push({
    userId,
    emoji,
    timestamp: new Date(),
  });

  return this.save();
};

// Method to remove reaction
chatMessageSchema.methods.removeReaction = function (userId) {
  this.metadata.reactions = this.metadata.reactions.filter(
    (reaction) => !reaction.userId.equals(userId)
  );

  return this.save();
};

// Method to soft delete message
chatMessageSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
