import api from './api'

export const recommendationService = {
  async getRecommendations(type = null) {
    const params = type ? { type } : {}
    const response = await api.get('/recommendations', { params })
    return response.data
  }
}
