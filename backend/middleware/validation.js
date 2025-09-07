const Joi = require('joi');

// User registration validation
const validateUserRegistration = (req, res, next) => {
  console.log('Validating user registration with data:', req.body);
  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().min(1).max(50).required(),
    lastName: Joi.string().min(1).max(50).required(),
    dateOfBirth: Joi.date().max('now').required(),
    gender: Joi.string().valid('male', 'female', 'other', 'prefer-not-to-say').required(),
    location: Joi.object({
      city: Joi.string().max(100),
      state: Joi.string().max(100),
      country: Joi.string().max(100),
      coordinates: Joi.object({
        lat: Joi.number().min(-90).max(90),
        lng: Joi.number().min(-180).max(180)
      })
    }).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    console.log('User registration validation error:', error.details);
    return res.status(400).json({ 
      message: 'Validation error', 
      details: error.details.map(detail => detail.message) 
    });
  }
  next();
};

// User login validation
const validateUserLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error', 
      details: error.details.map(detail => detail.message) 
    });
  }
  next();
};

// Mood entry validation
const validateMoodEntry = (req, res, next) => {
  const schema = Joi.object({
    score: Joi.number().integer().min(1).max(10).required(),
    mood: Joi.string().valid('very-low', 'low', 'moderate', 'good', 'very-good', 'excellent').required(),
    emotions: Joi.array().items(
      Joi.object({
        emotion: Joi.string().valid(
          'happy', 'sad', 'angry', 'anxious', 'calm', 'excited', 'frustrated',
          'grateful', 'lonely', 'confident', 'overwhelmed', 'peaceful',
          'stressed', 'hopeful', 'worried'
        ).required(),
        intensity: Joi.number().integer().min(1).max(5).required()
      })
    ).optional(),
    triggers: Joi.array().items(Joi.string().max(100)).optional(),
    activities: Joi.array().items(Joi.string().max(100)).optional(),
    sleep: Joi.object({
      hours: Joi.number().min(0).max(24),
      quality: Joi.string().valid('poor', 'fair', 'good', 'excellent')
    }).optional(),
    notes: Joi.string().max(1000).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error', 
      details: error.details.map(detail => detail.message) 
    });
  }
  next();
};

// Chat message validation
const validateChatMessage = (req, res, next) => {
  const schema = Joi.object({
    message: Joi.string().min(1).max(1000).required(),
    roomId: Joi.string().required(),
    messageType: Joi.string().valid('text', 'image', 'file', 'system').default('text')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error', 
      details: error.details.map(detail => detail.message) 
    });
  }
  next();
};

// Community creation validation
const validateCommunityCreation = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().min(1).max(500).required(),
    type: Joi.string().valid('chatroom', 'video-room', 'hobby-group').required(),
    category: Joi.string().valid(
      'general', 'anxiety', 'depression', 'trauma', 'addiction',
      'relationships', 'grief', 'eating-disorders', 'bipolar',
      'ocd', 'ptsd', 'adhd', 'autism', 'family', 'couples',
      'children', 'adolescents', 'seniors', 'lgbtq+', 'veterans',
      'students', 'professionals', 'parents', 'caregivers'
    ).required(),
    settings: Joi.object({
      isPublic: Joi.boolean().default(true),
      requiresApproval: Joi.boolean().default(false),
      maxMembers: Joi.number().integer().min(2).max(1000).default(100),
      allowAnonymous: Joi.boolean().default(true),
      allowFileSharing: Joi.boolean().default(false),
      allowVideoCalls: Joi.boolean().default(false)
    }).optional(),
    rules: Joi.array().items(
      Joi.object({
        rule: Joi.string().max(200).required(),
        description: Joi.string().max(500).optional()
      })
    ).optional(),
    tags: Joi.array().items(Joi.string().max(50)).max(10).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error', 
      details: error.details.map(detail => detail.message) 
    });
  }
  next();
};

// Hobby post validation
const validateHobbyPost = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(1).max(100).required(),
    content: Joi.string().min(1).max(2000).required(),
    hobby: Joi.string().valid(
      'art', 'music', 'sports', 'cooking', 'gardening', 'reading',
      'writing', 'photography', 'crafts', 'gaming', 'dancing',
      'fitness', 'travel', 'collecting', 'woodworking', 'sewing',
      'knitting', 'pottery', 'painting', 'drawing', 'sculpture',
      'jewelry-making', 'baking', 'fishing', 'hiking', 'cycling',
      'swimming', 'yoga', 'meditation', 'volunteering', 'learning',
      'technology', 'programming', 'electronics', 'mechanics',
      'other'
    ).required(),
    images: Joi.array().items(
      Joi.object({
        url: Joi.string().uri().required(),
        caption: Joi.string().max(200).optional()
      })
    ).max(5).optional(),
    tags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
    location: Joi.object({
      city: Joi.string().max(100),
      state: Joi.string().max(100),
      country: Joi.string().max(100),
      coordinates: Joi.object({
        lat: Joi.number().min(-90).max(90),
        lng: Joi.number().min(-180).max(180)
      })
    }).optional(),
    visibility: Joi.string().valid('public', 'friends', 'private').default('public')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error', 
      details: error.details.map(detail => detail.message) 
    });
  }
  next();
};

// Emergency contact validation
const validateEmergencyContact = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(1).max(100).required(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).required(),
    relationship: Joi.string().max(50).required(),
    isActive: Joi.boolean().default(true)
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error', 
      details: error.details.map(detail => detail.message) 
    });
  }
  next();
};

// Therapist search validation
const validateTherapistSearch = (req, res, next) => {
  const schema = Joi.object({
    location: Joi.object({
      lat: Joi.number().min(-90).max(90).required(),
      lng: Joi.number().min(-180).max(180).required()
    }).optional(),
    specialization: Joi.string().valid(
      'anxiety', 'depression', 'trauma', 'addiction', 'relationships',
      'grief', 'eating-disorders', 'bipolar', 'ocd', 'ptsd',
      'adhd', 'autism', 'family-therapy', 'couples-therapy',
      'child-therapy', 'adolescent-therapy', 'geriatric-therapy'
    ).optional(),
    maxDistance: Joi.number().integer().min(1).max(500000).default(50000),
    limit: Joi.number().integer().min(1).max(100).default(20)
  });

  const { error } = schema.validate(req.query);
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error', 
      details: error.details.map(detail => detail.message) 
    });
  }
  next();
};

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateMoodEntry,
  validateChatMessage,
  validateCommunityCreation,
  validateHobbyPost,
  validateEmergencyContact,
  validateTherapistSearch
};
