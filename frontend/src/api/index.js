import apiClient from './client';

export const authApi = {
  login: (data) => apiClient.post('/auth/login', data).then(res => res.data),
  register: (data) => apiClient.post('/auth/register', data).then(res => res.data),
  registerAnonymous: () => apiClient.post('/auth/register/anonymous').then(res => res.data),
  logout: () => apiClient.post('/auth/logout').then(res => res.data),
  verifyEmail: (data) => apiClient.post('/auth/verify-email', data).then(res => res.data),
  forgotPassword: (data) => apiClient.post('/auth/forgot-password', data).then(res => res.data),
  resetPassword: (data) => apiClient.post('/auth/reset-password', data).then(res => res.data),
  enable2FA: () => apiClient.post('/auth/2fa/enable').then(res => res.data),
  verify2FA: (data) => apiClient.post('/auth/2fa/verify', data).then(res => res.data),
};

export const usersApi = {
  getMe: () => apiClient.get('/users/me').then(res => res.data),
  updateMe: (data) => apiClient.patch('/users/me', data).then(res => res.data),
  deleteMe: () => apiClient.delete('/users/me').then(res => res.data),
  exportData: () => apiClient.get('/users/me/export', { responseType: 'blob' }).then(res => res.data),
  toggleAnonymous: (enabled) => apiClient.patch('/users/me/anonymous-mode', { enabled }).then(res => res.data),
  changePassword: (data) => apiClient.post('/users/me/change-password', data).then(res => res.data),
};

export const journalApi = {
  list: (params) => apiClient.get('/journal', { params }).then(res => res.data),
  get: (id) => apiClient.get(`/journal/${id}`).then(res => res.data),
  create: (data) => apiClient.post('/journal', data).then(res => res.data),
  update: (id, data) => apiClient.patch(`/journal/${id}`, data).then(res => res.data),
  delete: (id) => apiClient.delete(`/journal/${id}`).then(res => res.data),
  getHeatmap: (params) => apiClient.get('/journal/mood-heatmap', { params }).then(res => res.data),
};

export const moodApi = {
  checkin: (data) => apiClient.post('/mood/checkin', data).then(res => res.data),
  getHistory: () => apiClient.get('/mood/history').then(res => res.data),
  getStreak: () => apiClient.get('/mood/streak').then(res => res.data),
};

export const therapistsApi = {
  list: (params) => apiClient.get('/therapists', { params }).then(res => res.data),
  get: (id) => apiClient.get(`/therapists/${id}`).then(res => res.data),
  getAvailability: (id) => apiClient.get(`/therapists/${id}/availability`).then(res => res.data),
  create: (data) => apiClient.post('/therapists', data).then(res => res.data),
  update: (id, data) => apiClient.patch(`/therapists/${id}`, data).then(res => res.data),
};

export const sessionsApi = {
  book: (data) => apiClient.post('/sessions', data).then(res => res.data),
  listMy: (params) => apiClient.get('/sessions/my', { params }).then(res => res.data),
  get: (id) => apiClient.get(`/sessions/${id}`).then(res => res.data),
  cancel: (id) => apiClient.patch(`/sessions/${id}/cancel`).then(res => res.data),
  complete: (id, data) => apiClient.patch(`/sessions/${id}/complete`, data).then(res => res.data),
  review: (id, data) => apiClient.post(`/sessions/${id}/review`, data).then(res => res.data),
};

export const messagesApi = {
  getHistory: (sessionId, params) => apiClient.get(`/messages/session/${sessionId}`, { params }).then(res => res.data),
};

export const resourcesApi = {
  list: (params) => apiClient.get('/resources', { params }).then(res => res.data),
  get: (id) => apiClient.get(`/resources/${id}`).then(res => res.data),
  create: (data) => apiClient.post('/resources', data).then(res => res.data),
};

export const crisisApi = {
  getContacts: () => apiClient.get('/crisis/contacts').then(res => res.data),
  getSafetyPlan: () => apiClient.get('/crisis/safety-plan').then(res => res.data),
  createSafetyPlan: (data) => apiClient.post('/crisis/safety-plan', data).then(res => res.data),
  updateSafetyPlan: (data) => apiClient.patch('/crisis/safety-plan', data).then(res => res.data),
};
