import api from './api'

export const communityService = {
  async createCommunity(communityData) {
    const response = await api.post('/community', communityData)
    return response.data
  },

  async getCommunitiesByCategory(category, limit = 20) {
    const response = await api.get(`/community/category/${category}`, {
      params: { limit }
    })
    return response.data
  },

  async getUserCommunities() {
    const response = await api.get('/community/my-communities')
    return response.data
  },

  async getCommunity(id) {
    const response = await api.get(`/community/${id}`)
    return response.data
  },

  async updateCommunity(id, communityData) {
    const response = await api.put(`/community/${id}`, communityData)
    return response.data
  },

  async deleteCommunity(id) {
    const response = await api.delete(`/community/${id}`)
    return response.data
  },

  async joinCommunity(id) {
    const response = await api.post(`/community/${id}/join`)
    return response.data
  },

  async leaveCommunity(id) {
    const response = await api.post(`/community/${id}/leave`)
    return response.data
  },

  async getCommunityMembers(id) {
    const response = await api.get(`/community/${id}/members`)
    return response.data
  }
}
