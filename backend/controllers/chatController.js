const ChatMessage = require('../models/ChatMessage');
const Community = require('../models/Community');
const axios = require('axios');

// Send message to chatbot
const sendChatMessage = async (req, res) => {
  try {
    const { message, roomId = 'bot-chat' } = req.body;

    // Save user message
    const userMessage = new ChatMessage({
      userId: req.user._id,
      roomId,
      message,
      isBot: false,
    });
    await userMessage.save();

    // Get AI response
    let botResponse = null;
    try {
      const aiResponse = await axios.post(
        `${process.env.AI_SERVICE_URL}/chat`,
        {
          message,
          userId: req.user._id.toString(),
          userHistory: await getUserChatHistoryHelper(req.user._id, 10),
        }
      );

      botResponse = aiResponse.data;
    } catch (aiError) {
      console.error('AI chat failed:', aiError.message);
      botResponse = {
        response:
          "I'm sorry, I'm having trouble processing your message right now. Please try again later.",
        moodAnalysis: null,
        suggestions: [],
      };
    }

    // Save bot response
    const botMessage = new ChatMessage({
      userId: req.user._id,
      roomId,
      message: botResponse.response || botResponse.message,
      isBot: true,
      botResponse: {
        moodAnalysis: botResponse.moodAnalysis,
        suggestions: botResponse.suggestions,
        emergencyTriggered: botResponse.emergencyTriggered || false,
      },
    });
    await botMessage.save();

    // If emergency is triggered, handle it
    if (botResponse.emergencyTriggered) {
      try {
        await handleEmergencyTrigger(req.user._id, botResponse.moodAnalysis);
      } catch (emergencyError) {
        console.error('Emergency handling failed:', emergencyError.message);
      }
    }

    res.json({
      userMessage,
      botMessage,
      moodAnalysis: botResponse.moodAnalysis,
      suggestions: botResponse.suggestions,
    });
  } catch (error) {
    console.error('Send chat message error:', error);
    res
      .status(500)
      .json({ message: 'Failed to send message', error: error.message });
  }
};

// Get chat history
const getChatHistory = async (req, res) => {
  try {
    const { roomId = 'bot-chat', limit = 50, offset = 0 } = req.query;

    const messages = await ChatMessage.getRoomMessages(
      roomId,
      parseInt(limit),
      parseInt(offset)
    );

    res.json({ messages });
  } catch (error) {
    console.error('Get chat history error:', error);
    res
      .status(500)
      .json({ message: 'Failed to get chat history', error: error.message });
  }
};

// Get user's chat history
const getUserChatHistory = async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const messages = await ChatMessage.getUserChatHistory(
      req.user._id,
      parseInt(limit)
    );

    res.json({ messages });
  } catch (error) {
    console.error('Get user chat history error:', error);
    res
      .status(500)
      .json({
        message: 'Failed to get user chat history',
        error: error.message,
      });
  }
};

// Send message to community room
const sendCommunityMessage = async (req, res) => {
  try {
    const { message, roomId, messageType = 'text' } = req.body;

    // Check if user is member of the community
    const community = await Community.findById(roomId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (!community.isMember(req.user._id)) {
      return res
        .status(403)
        .json({ message: 'You are not a member of this community' });
    }

    // Save message
    const chatMessage = new ChatMessage({
      userId: req.user._id,
      roomId,
      message,
      messageType,
    });
    await chatMessage.save();

    // Update community last activity
    community.lastActivity = new Date();
    await community.save();

    res.json({
      message: 'Message sent successfully',
      chatMessage: await chatMessage.populate(
        'userId',
        'username profilePicture'
      ),
    });
  } catch (error) {
    console.error('Send community message error:', error);
    res
      .status(500)
      .json({ message: 'Failed to send message', error: error.message });
  }
};

// Get community messages
const getCommunityMessages = async (req, res) => {
  try {
    const { roomId, limit = 50, offset = 0 } = req.query;

    // Check if user is member of the community
    const community = await Community.findById(roomId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (!community.isMember(req.user._id)) {
      return res
        .status(403)
        .json({ message: 'You are not a member of this community' });
    }

    const messages = await ChatMessage.getRoomMessages(
      roomId,
      parseInt(limit),
      parseInt(offset)
    );

    res.json({ messages });
  } catch (error) {
    console.error('Get community messages error:', error);
    res
      .status(500)
      .json({
        message: 'Failed to get community messages',
        error: error.message,
      });
  }
};

// Add reaction to message
const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.addReaction(req.user._id, emoji);

    res.json({ message: 'Reaction added successfully' });
  } catch (error) {
    console.error('Add reaction error:', error);
    res
      .status(500)
      .json({ message: 'Failed to add reaction', error: error.message });
  }
};

// Remove reaction from message
const removeReaction = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.removeReaction(req.user._id);

    res.json({ message: 'Reaction removed successfully' });
  } catch (error) {
    console.error('Remove reaction error:', error);
    res
      .status(500)
      .json({ message: 'Failed to remove reaction', error: error.message });
  }
};

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user owns the message or is admin/moderator
    if (!message.userId.equals(req.user._id) && req.user.role !== 'admin') {
      return res
        .status(403)
        .json({ message: 'You can only delete your own messages' });
    }

    await message.softDelete();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res
      .status(500)
      .json({ message: 'Failed to delete message', error: error.message });
  }
};

// Helper function to get user chat history for AI context
const getUserChatHistoryHelper = async (userId, limit = 10) => {
  try {
    const messages = await ChatMessage.find({
      userId,
      isBot: false,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('message createdAt');

    return messages.reverse(); // Return in chronological order
  } catch (error) {
    console.error('Get user chat history error:', error);
    return [];
  }
};

// Helper function to handle emergency trigger
const handleEmergencyTrigger = async (userId, moodAnalysis) => {
  const User = require('../models/User');
  const user = await User.findById(userId);

  if (!user.emergencyContact || !user.emergencyContact.isActive) {
    console.log('No emergency contact configured for user:', userId);
    return;
  }

  // Send SMS to emergency contact
  const twilio = require('twilio');
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  const message = `URGENT: ${user.firstName} ${
    user.lastName
  } has triggered an emergency alert through the chatbot. 
    Mood analysis indicates: ${moodAnalysis?.sentiment || 'concerning state'}. 
    Please check on them immediately. 
    This is an automated message from the Mental Health App.`;

  try {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: user.emergencyContact.phone,
    });

    console.log('Emergency SMS sent to:', user.emergencyContact.phone);
  } catch (error) {
    console.error('Failed to send emergency SMS:', error);
    throw error;
  }
};

module.exports = {
  sendChatMessage,
  getChatHistory,
  getUserChatHistory,
  sendCommunityMessage,
  getCommunityMessages,
  addReaction,
  removeReaction,
  deleteMessage,
};
