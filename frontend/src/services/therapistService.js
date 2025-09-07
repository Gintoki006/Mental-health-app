import api from './api'

export const therapistService = {
  async searchTherapists(params = {}) {
    const response = await api.get('/therapists/search', { params })
    return response.data
  },

  async getTherapist(id) {
    const response = await api.get(`/therapists/${id}`)
    return response.data
  },

  async addReview(therapistId, rating, comment) {
    const response = await api.post(`/therapists/${therapistId}/review`, {
      rating,
      comment
    })
    return response.data
  },

  async getAvailability(therapistId, date) {
    const response = await api.get(`/therapists/${therapistId}/availability`, {
      params: { date }
    })
    return response.data
  },

  async getSpecializations() {
    const response = await api.get('/therapists/specializations')
    return response.data
  }
}
