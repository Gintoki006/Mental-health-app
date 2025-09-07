import api from './api'

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  async getProfile() {
    const response = await api.get('/auth/profile')
    return response.data.user
  },

  async updateProfile(userData) {
    const response = await api.put('/auth/profile', userData)
    return response.data
  },

  async changePassword(currentPassword, newPassword) {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword
    })
    return response.data
  },

  async logout() {
    const response = await api.post('/auth/logout')
    return response.data
  },

  async refreshToken() {
    const response = await api.post('/auth/refresh-token')
    return response.data
  }
}
