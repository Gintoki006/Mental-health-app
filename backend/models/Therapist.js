const mongoose = require('mongoose');

const therapistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Therapist name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  license: {
    number: {
      type: String,
      required: [true, 'License number is required'],
      unique: true
    },
    state: {
      type: String,
      required: [true, 'License state is required']
    },
    expiryDate: {
      type: Date,
      required: [true, 'License expiry date is required']
    }
  },
  specialization: [{
    type: String,
    enum: [
      'anxiety', 'depression', 'trauma', 'addiction', 'relationships',
      'grief', 'eating-disorders', 'bipolar', 'ocd', 'ptsd',
      'adhd', 'autism', 'family-therapy', 'couples-therapy',
      'child-therapy', 'adolescent-therapy', 'geriatric-therapy'
    ]
  }],
  location: {
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'USA' }
    },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  availability: {
    monday: [{ start: String, end: String }],
    tuesday: [{ start: String, end: String }],
    wednesday: [{ start: String, end: String }],
    thursday: [{ start: String, end: String }],
    friday: [{ start: String, end: String }],
    saturday: [{ start: String, end: String }],
    sunday: [{ start: String, end: String }]
  },
  services: {
    inPerson: { type: Boolean, default: true },
    online: { type: Boolean, default: false },
    phone: { type: Boolean, default: false },
    groupTherapy: { type: Boolean, default: false }
  },
  pricing: {
    inPerson: Number,
    online: Number,
    phone: Number,
    group: Number,
    insurance: [String],
    slidingScale: { type: Boolean, default: false }
  },
  credentials: {
    degree: String,
    school: String,
    graduationYear: Number,
    certifications: [String],
    yearsExperience: Number
  },
  languages: [String],
  bio: {
    type: String,
    maxlength: 2000
  },
  profilePicture: String,
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  reviews: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emergencyAvailable: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better performance
therapistSchema.index({ 'location.coordinates': '2dsphere' });
therapistSchema.index({ specialization: 1 });
therapistSchema.index({ 'rating.average': -1 });
therapistSchema.index({ isVerified: 1, isActive: 1 });

// Virtual for full address
therapistSchema.virtual('fullAddress').get(function() {
  const addr = this.location.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}`;
});

// Static method to find therapists near location
therapistSchema.statics.findNearby = function(coordinates, maxDistance = 50000, limit = 20) {
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
    isVerified: true
  }).limit(limit);
};

// Static method to search therapists by specialization
therapistSchema.statics.findBySpecialization = function(specialization, limit = 20) {
  return this.find({
    specialization: { $in: [specialization] },
    isActive: true,
    isVerified: true
  })
  .sort({ 'rating.average': -1 })
  .limit(limit);
};

// Method to add review
therapistSchema.methods.addReview = function(userId, rating, comment) {
  // Remove existing review from this user
  this.reviews = this.reviews.filter(review => !review.userId.equals(userId));
  
  // Add new review
  this.reviews.push({
    userId,
    rating,
    comment,
    date: new Date()
  });
  
  // Update average rating
  this.updateRating();
  
  return this.save();
};

// Method to update rating
therapistSchema.methods.updateRating = function() {
  if (this.reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
  } else {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating.average = totalRating / this.reviews.length;
    this.rating.count = this.reviews.length;
  }
};

// Method to check availability for a specific time
therapistSchema.methods.isAvailable = function(dayOfWeek, time) {
  const dayMap = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday'
  };
  
  const day = dayMap[dayOfWeek];
  const dayAvailability = this.availability[day];
  
  if (!dayAvailability || dayAvailability.length === 0) {
    return false;
  }
  
  return dayAvailability.some(slot => {
    return time >= slot.start && time <= slot.end;
  });
};

module.exports = mongoose.model('Therapist', therapistSchema);
