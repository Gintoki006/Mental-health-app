import api from './api'

export const moodService = {
  async createMoodEntry(moodData) {
    const response = await api.post('/mood', moodData)
    return response.data
  },

  async getMoodEntries(params = {}) {
    const response = await api.get('/mood', { params })
    return response.data
  },

  async getMoodStats(days = 30) {
    const response = await api.get('/mood/stats', { params: { days } })
    return response.data
  },

  async getMoodInsights(days = 30) {
    const response = await api.get('/mood/insights', { params: { days } })
    return response.data
  },

  async updateMoodEntry(id, moodData) {
    const response = await api.put(`/mood/${id}`, moodData)
    return response.data
  },

  async deleteMoodEntry(id) {
    const response = await api.delete(`/mood/${id}`)
    return response.data
  }
}
