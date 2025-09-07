const mongoose = require('mongoose');

const hobbyPostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: [2000, 'Content cannot exceed 2000 characters']
  },
  hobby: {
    type: String,
    required: [true, 'Hobby category is required'],
    enum: [
      'art', 'music', 'sports', 'cooking', 'gardening', 'reading',
      'writing', 'photography', 'crafts', 'gaming', 'dancing',
      'fitness', 'travel', 'collecting', 'woodworking', 'sewing',
      'knitting', 'pottery', 'painting', 'drawing', 'sculpture',
      'jewelry-making', 'baking', 'fishing', 'hiking', 'cycling',
      'swimming', 'yoga', 'meditation', 'volunteering', 'learning',
      'technology', 'programming', 'electronics', 'mechanics',
      'other'
    ]
  },
  images: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  location: {
    city: String,
    state: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  engagement: {
    likes: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      likedAt: {
        type: Date,
        default: Date.now
      }
    }],
    comments: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      content: {
        type: String,
        required: true,
        maxlength: 500
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      isEdited: {
        type: Boolean,
        default: false
      },
      editedAt: Date
    }],
    shares: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      sharedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  visibility: {
    type: String,
    enum: ['public', 'friends', 'private'],
    default: 'public'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isReported: {
    type: Boolean,
    default: false
  },
  reportReason: String,
  moderatedAt: Date
}, {
  timestamps: true
});

// Indexes for better performance
hobbyPostSchema.index({ hobby: 1, createdAt: -1 });
hobbyPostSchema.index({ userId: 1, createdAt: -1 });
hobbyPostSchema.index({ tags: 1 });
hobbyPostSchema.index({ 'location.coordinates': '2dsphere' });
hobbyPostSchema.index({ isActive: 1, isReported: 1 });

// Virtual for like count
hobbyPostSchema.virtual('likeCount').get(function() {
  return this.engagement.likes.length;
});

// Virtual for comment count
hobbyPostSchema.virtual('commentCount').get(function() {
  return this.engagement.comments.length;
});

// Virtual for share count
hobbyPostSchema.virtual('shareCount').get(function() {
  return this.engagement.shares.length;
});

// Static method to find posts by hobby
hobbyPostSchema.statics.findByHobby = function(hobby, limit = 20, offset = 0) {
  return this.find({
    hobby,
    isActive: true,
    isReported: false
  })
  .populate('userId', 'username profilePicture')
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(offset);
};

// Static method to find posts by location
hobbyPostSchema.statics.findByLocation = function(coordinates, maxDistance = 50000, limit = 20) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [coordinates.lng, coordinates.lat]
        },
        $maxDistance: maxDistance
      }
    },
    isActive: true,
    isReported: false
  })
  .populate('userId', 'username profilePicture')
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to search posts
hobbyPostSchema.statics.searchPosts = function(query, limit = 20) {
  return this.find({
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { content: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ],
    isActive: true,
    isReported: false
  })
  .populate('userId', 'username profilePicture')
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Method to add like
hobbyPostSchema.methods.addLike = function(userId) {
  // Check if user already liked
  const existingLike = this.engagement.likes.find(like => like.userId.equals(userId));
  if (existingLike) {
    return false; // Already liked
  }
  
  this.engagement.likes.push({
    userId,
    likedAt: new Date()
  });
  
  return this.save();
};

// Method to remove like
hobbyPostSchema.methods.removeLike = function(userId) {
  this.engagement.likes = this.engagement.likes.filter(like => !like.userId.equals(userId));
  return this.save();
};

// Method to add comment
hobbyPostSchema.methods.addComment = function(userId, content) {
  this.engagement.comments.push({
    userId,
    content,
    createdAt: new Date()
  });
  
  return this.save();
};

// Method to edit comment
hobbyPostSchema.methods.editComment = function(commentId, newContent) {
  const comment = this.engagement.comments.id(commentId);
  if (comment) {
    comment.content = newContent;
    comment.isEdited = true;
    comment.editedAt = new Date();
    return this.save();
  }
  return false;
};

// Method to delete comment
hobbyPostSchema.methods.deleteComment = function(commentId) {
  this.engagement.comments = this.engagement.comments.filter(comment => !comment._id.equals(commentId));
  return this.save();
};

// Method to add share
hobbyPostSchema.methods.addShare = function(userId) {
  this.engagement.shares.push({
    userId,
    sharedAt: new Date()
  });
  
  return this.save();
};

// Method to check if user liked the post
hobbyPostSchema.methods.isLikedBy = function(userId) {
  return this.engagement.likes.some(like => like.userId.equals(userId));
};

module.exports = mongoose.model('HobbyPost', hobbyPostSchema);
