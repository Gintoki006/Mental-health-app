import api from './api'

export const emergencyService = {
  async testEmergencyContact() {
    const response = await api.post('/emergency/test')
    return response.data
  },

  async getEmergencyStats(days = 30) {
    const response = await api.get('/emergency/stats', { params: { days } })
    return response.data
  },

  async triggerEmergency() {
    const response = await api.post('/emergency/trigger')
    return response.data
  },

  async getEmergencyResources() {
    const response = await api.get('/emergency/resources')
    return response.data
  }
}
