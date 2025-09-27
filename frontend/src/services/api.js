import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add mock auth token to requests (for prototype)
api.interceptors.request.use(async (config) => {
  // For prototype, just add a mock token
  config.headers.Authorization = `Bearer mock-token-${Date.now()}`
  return config
})

export const apiService = {
  // Auth endpoints
  signup: (userData) => api.post('/api/auth/signup', userData),
  login: (credentials) => api.post('/api/auth/login', credentials),
  
  // Symptom endpoints
  getSymptoms: () => api.get('/api/symptoms'),
  getProbableSymptoms: (symptoms) => api.post('/api/symptoms/probable-symptoms', { symptoms }),
  evaluateSymptoms: (data) => api.post('/api/symptoms/evaluate', data),
  
  // Log endpoints
  saveSymptomLog: (logData) => api.post('/api/symptom_logs', logData),
  getSymptomLogs: () => api.get('/api/symptom_logs'),
  
  // Admin endpoints
  getRules: () => api.get('/api/rules'),
  updateRule: (ruleId, ruleData) => api.put(`/api/rules/${ruleId}`, ruleData),
  testRule: (payload) => api.post('/api/test_rule', payload),
}

export default api