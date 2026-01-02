import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (email, password, name) =>
    api.post('/auth/register', { email, password, name }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
};

export const carbonAPI = {
  getEntries: () => api.get('/carbon'),
  addEntry: (data) =>
    api.post('/carbon', data),
  deleteEntry: (id) => api.delete(`/carbon/${id}`),
  getAppliances: () => api.get('/carbon/appliances'),
  getTransportTypes: () => api.get('/carbon/transport-types'),
};

export const reportAPI = {
  getMonthly: (month, year) =>
    api.get('/reports/monthly', { params: { month, year } }),
  getTotal: () => api.get('/reports/total'),
  getCategories: () => api.get('/reports/categories'),
};

export default api;
