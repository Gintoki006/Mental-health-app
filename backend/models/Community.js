const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Community name is required'],
    trim: true,
    maxlength: [100, 'Community name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Community description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['chatroom', 'video-room', 'hobby-group'],
    required: true
  },
  category: {
    type: String,
    enum: [
      'general', 'anxiety', 'depression', 'trauma', 'addiction',
      'relationships', 'grief', 'eating-disorders', 'bipolar',
      'ocd', 'ptsd', 'adhd', 'autism', 'family', 'couples',
      'children', 'adolescents', 'seniors', 'lgbtq+', 'veterans',
      'students', 'professionals', 'parents', 'caregivers'
    ],
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin'],
      default: 'member'
    }
  }],
  settings: {
    isPublic: {
      type: Boolean,
      default: true
    },
    requiresApproval: {
      type: Boolean,
      default: false
    },
    maxMembers: {
      type: Number,
      default: 100
    },
    allowAnonymous: {
      type: Boolean,
      default: true
    },
    allowFileSharing: {
      type: Boolean,
      default: false
    },
    allowVideoCalls: {
      type: Boolean,
      default: false
    }
  },
  rules: [{
    rule: String,
    description: String
  }],
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  memberCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better performance
communitySchema.index({ type: 1, category: 1 });
communitySchema.index({ 'members.user': 1 });
communitySchema.index({ isActive: 1, lastActivity: -1 });
communitySchema.index({ tags: 1 });

// Virtual for member count
communitySchema.virtual('currentMemberCount').get(function() {
  return this.members.length;
});

// Static method to find communities by category
communitySchema.statics.findByCategory = function(category, limit = 20) {
  return this.find({
    category,
    isActive: true,
    'settings.isPublic': true
  })
  .populate('createdBy', 'username profilePicture')
  .sort({ memberCount: -1, lastActivity: -1 })
  .limit(limit);
};

// Static method to find user's communities
communitySchema.statics.findUserCommunities = function(userId) {
  return this.find({
    'members.user': userId,
    isActive: true
  })
  .populate('createdBy', 'username profilePicture')
  .sort({ lastActivity: -1 });
};

// Method to add member
communitySchema.methods.addMember = function(userId, role = 'member') {
  // Check if user is already a member
  const existingMember = this.members.find(member => member.user.equals(userId));
  if (existingMember) {
    return false;
  }
  
  // Check if community is full
  if (this.members.length >= this.settings.maxMembers) {
    return false;
  }
  
  this.members.push({
    user: userId,
    role,
    joinedAt: new Date()
  });
  
  this.memberCount = this.members.length;
  this.lastActivity = new Date();
  
  return this.save();
};

// Method to remove member
communitySchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => !member.user.equals(userId));
  this.memberCount = this.members.length;
  this.lastActivity = new Date();
  
  return this.save();
};

// Method to update member role
communitySchema.methods.updateMemberRole = function(userId, newRole) {
  const member = this.members.find(member => member.user.equals(userId));
  if (member) {
    member.role = newRole;
    this.lastActivity = new Date();
    return this.save();
  }
  return false;
};

// Method to check if user is member
communitySchema.methods.isMember = function(userId) {
  return this.members.some(member => member.user.equals(userId));
};

// Method to check if user is moderator or admin
communitySchema.methods.isModerator = function(userId) {
  const member = this.members.find(member => member.user.equals(userId));
  return member && ['moderator', 'admin'].includes(member.role);
};

// Method to check if user is admin
communitySchema.methods.isAdmin = function(userId) {
  const member = this.members.find(member => member.user.equals(userId));
  return member && member.role === 'admin';
};

module.exports = mongoose.model('Community', communitySchema);
