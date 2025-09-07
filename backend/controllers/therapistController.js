const Therapist = require('../models/Therapist');

// Search therapists
const searchTherapists = async (req, res) => {
  try {
    const { location, specialization, maxDistance = 50000, limit = 20 } = req.query;
    
    let therapists;
    
    if (location) {
      const coordinates = {
        lat: parseFloat(location.split(',')[0]),
        lng: parseFloat(location.split(',')[1])
      };
      
      therapists = await Therapist.findNearby(coordinates, parseInt(maxDistance), parseInt(limit));
    } else if (specialization) {
      therapists = await Therapist.findBySpecialization(specialization, parseInt(limit));
    } else {
      therapists = await Therapist.find({
        isActive: true,
        isVerified: true
      })
      .sort({ 'rating.average': -1 })
      .limit(parseInt(limit));
    }
    
    res.json({ therapists });
  } catch (error) {
    console.error('Search therapists error:', error);
    res.status(500).json({ message: 'Failed to search therapists', error: error.message });
  }
};

// Get therapist by ID
const getTherapist = async (req, res) => {
  try {
    const { id } = req.params;
    
    const therapist = await Therapist.findById(id);
    if (!therapist) {
      return res.status(404).json({ message: 'Therapist not found' });
    }
    
    res.json({ therapist });
  } catch (error) {
    console.error('Get therapist error:', error);
    res.status(500).json({ message: 'Failed to get therapist', error: error.message });
  }
};

// Add review to therapist
const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    
    const therapist = await Therapist.findById(id);
    if (!therapist) {
      return res.status(404).json({ message: 'Therapist not found' });
    }
    
    await therapist.addReview(req.user._id, rating, comment);
    
    res.json({ message: 'Review added successfully' });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Failed to add review', error: error.message });
  }
};

// Get therapist availability
const getAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    
    const therapist = await Therapist.findById(id);
    if (!therapist) {
      return res.status(404).json({ message: 'Therapist not found' });
    }
    
    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay();
    
    const availability = therapist.availability;
    const dayMap = {
      0: 'sunday',
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday'
    };
    
    const dayAvailability = availability[dayMap[dayOfWeek]] || [];
    
    res.json({ 
      date: requestedDate,
      availability: dayAvailability,
      services: therapist.services
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ message: 'Failed to get availability', error: error.message });
  }
};

// Get specializations
const getSpecializations = async (req, res) => {
  try {
    const specializations = [
      'anxiety', 'depression', 'trauma', 'addiction', 'relationships',
      'grief', 'eating-disorders', 'bipolar', 'ocd', 'ptsd',
      'adhd', 'autism', 'family-therapy', 'couples-therapy',
      'child-therapy', 'adolescent-therapy', 'geriatric-therapy'
    ];
    
    res.json({ specializations });
  } catch (error) {
    console.error('Get specializations error:', error);
    res.status(500).json({ message: 'Failed to get specializations', error: error.message });
  }
};

module.exports = {
  searchTherapists,
  getTherapist,
  addReview,
  getAvailability,
  getSpecializations
};
