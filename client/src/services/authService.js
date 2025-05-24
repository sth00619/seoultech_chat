import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.user) {
        // JWT 토큰 없이 사용자 정보만 저장
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('isAuthenticated', 'true');
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message };
    }
  },

  async register(userData) {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message };
    }
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return localStorage.getItem('isAuthenticated') === 'true';
  },

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
  }
};