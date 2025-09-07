const Community = require('../models/Community');

// Create community
const createCommunity = async (req, res) => {
  try {
    const { name, description, type, category, settings, rules, tags } = req.body;
    
    const community = new Community({
      name,
      description,
      type,
      category,
      createdBy: req.user._id,
      settings,
      rules,
      tags
    });
    
    // Add creator as admin member
    community.members.push({
      user: req.user._id,
      role: 'admin',
      joinedAt: new Date()
    });
    
    community.memberCount = 1;
    await community.save();
    
    res.status(201).json({
      message: 'Community created successfully',
      community
    });
  } catch (error) {
    console.error('Create community error:', error);
    res.status(500).json({ message: 'Failed to create community', error: error.message });
  }
};

// Get communities by category
const getCommunitiesByCategory = async (req, res) => {
  try {
    const { category, limit = 20 } = req.query;
    
    const communities = await Community.findByCategory(category, parseInt(limit));
    
    res.json({ communities });
  } catch (error) {
    console.error('Get communities by category error:', error);
    res.status(500).json({ message: 'Failed to get communities', error: error.message });
  }
};

// Get user's communities
const getUserCommunities = async (req, res) => {
  try {
    const communities = await Community.findUserCommunities(req.user._id);
    
    res.json({ communities });
  } catch (error) {
    console.error('Get user communities error:', error);
    res.status(500).json({ message: 'Failed to get user communities', error: error.message });
  }
};

// Join community
const joinCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    
    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    if (!community.isActive) {
      return res.status(400).json({ message: 'Community is not active' });
    }
    
    if (community.isMember(req.user._id)) {
      return res.status(400).json({ message: 'You are already a member of this community' });
    }
    
    const success = await community.addMember(req.user._id);
    if (!success) {
      return res.status(400).json({ message: 'Failed to join community' });
    }
    
    res.json({ message: 'Successfully joined community' });
  } catch (error) {
    console.error('Join community error:', error);
    res.status(500).json({ message: 'Failed to join community', error: error.message });
  }
};

// Leave community
const leaveCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    
    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    if (!community.isMember(req.user._id)) {
      return res.status(400).json({ message: 'You are not a member of this community' });
    }
    
    await community.removeMember(req.user._id);
    
    res.json({ message: 'Successfully left community' });
  } catch (error) {
    console.error('Leave community error:', error);
    res.status(500).json({ message: 'Failed to leave community', error: error.message });
  }
};

// Get community details
const getCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    
    const community = await Community.findById(id)
      .populate('createdBy', 'username profilePicture')
      .populate('members.user', 'username profilePicture');
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    // Check if user is member (for private communities)
    if (!community.settings.isPublic && !community.isMember(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json({ community });
  } catch (error) {
    console.error('Get community error:', error);
    res.status(500).json({ message: 'Failed to get community', error: error.message });
  }
};

// Update community
const updateCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    // Check if user is admin
    if (!community.isAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const updatedCommunity = await Community.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json({
      message: 'Community updated successfully',
      community: updatedCommunity
    });
  } catch (error) {
    console.error('Update community error:', error);
    res.status(500).json({ message: 'Failed to update community', error: error.message });
  }
};

// Delete community
const deleteCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    
    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    // Check if user is admin
    if (!community.isAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    community.isActive = false;
    await community.save();
    
    res.json({ message: 'Community deleted successfully' });
  } catch (error) {
    console.error('Delete community error:', error);
    res.status(500).json({ message: 'Failed to delete community', error: error.message });
  }
};

// Get community members
const getCommunityMembers = async (req, res) => {
  try {
    const { id } = req.params;
    
    const community = await Community.findById(id)
      .populate('members.user', 'username profilePicture firstName lastName')
      .select('members');
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    // Check if user is member
    if (!community.isMember(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json({ members: community.members });
  } catch (error) {
    console.error('Get community members error:', error);
    res.status(500).json({ message: 'Failed to get community members', error: error.message });
  }
};

module.exports = {
  createCommunity,
  getCommunitiesByCategory,
  getUserCommunities,
  joinCommunity,
  leaveCommunity,
  getCommunity,
  updateCommunity,
  deleteCommunity,
  getCommunityMembers
};
