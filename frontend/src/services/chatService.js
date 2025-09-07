import api from './api'

export const chatService = {
  async sendChatMessage(message, roomId = 'bot-chat') {
    const response = await api.post('/chat/bot', { message, roomId })
    return response.data
  },

  async getChatHistory(roomId = 'bot-chat', limit = 50, offset = 0) {
    const response = await api.get('/chat/bot/history', {
      params: { roomId, limit, offset }
    })
    return response.data
  },

  async getUserChatHistory(limit = 100) {
    const response = await api.get('/chat/user/history', { params: { limit } })
    return response.data
  },

  async sendCommunityMessage(message, roomId, messageType = 'text') {
    const response = await api.post('/chat/community', {
      message,
      roomId,
      messageType
    })
    return response.data
  },

  async getCommunityMessages(roomId, limit = 50, offset = 0) {
    const response = await api.get(`/chat/community/${roomId}`, {
      params: { limit, offset }
    })
    return response.data
  },

  async addReaction(messageId, emoji) {
    const response = await api.post(`/chat/message/${messageId}/reaction`, {
      emoji
    })
    return response.data
  },

  async removeReaction(messageId) {
    const response = await api.delete(`/chat/message/${messageId}/reaction`)
    return response.data
  },

  async deleteMessage(messageId) {
    const response = await api.delete(`/chat/message/${messageId}`)
    return response.data
  }
}
