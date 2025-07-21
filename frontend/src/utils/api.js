import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const getUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateUserPreferences = async (preferences) => {
  const response = await api.put('/auth/preferences', preferences);
  return response.data;
};

// Subscription API calls
export const getSubscriptions = async () => {
  const response = await api.get('/subscriptions');
  return response.data;
};

export const getSubscriptionStats = async () => {
  const response = await api.get('/subscriptions/stats');
  return response.data;
};

export const getUpcomingRenewals = async () => {
  const response = await api.get('/subscriptions/upcoming');
  return response.data;
};

export const createSubscription = async (subscriptionData) => {
  const response = await api.post('/subscriptions', subscriptionData);
  return response.data;
};

export const updateSubscription = async (id, subscriptionData) => {
  const response = await api.put(`/subscriptions/${id}`, subscriptionData);
  return response.data;
};

export const deleteSubscription = async (id) => {
  const response = await api.delete(`/subscriptions/${id}`);
  return response.data;
};

// Gmail API calls
export const getGmailAuthUrl = async () => {
  const response = await api.get('/gmail/auth-url');
  return response.data;
};

export const connectGmail = async (authData) => {
  const response = await api.post('/gmail/callback', authData);
  return response.data;
};

export const scanGmail = async () => {
  const response = await api.post('/gmail/scan');
  return response.data;
};

export const importSubscriptions = async (subscriptionsData) => {
  const response = await api.post('/gmail/import', subscriptionsData);
  return response.data;
};

export const disconnectGmail = async () => {
  const response = await api.post('/gmail/disconnect');
  return response.data;
};

// Profile API calls
export const updateProfile = async (profileData) => {
  const response = await api.put('/auth/profile', profileData);
  return response.data;
};

// Settings API calls
export const getUserSettings = async () => {
  const response = await api.get('/auth/settings');
  return response.data;
};

export const updateUserSettings = async (settings) => {
  const response = await api.put('/auth/settings', settings);
  return response.data;
};

export const deleteAccount = async () => {
  const response = await api.delete('/auth/account');
  return response.data;
};

// Multiple Gmail accounts API calls
export const getGmailAccounts = async () => {
  const response = await api.get('/gmail/accounts');
  return response.data;
};

export const connectGmailAccount = async (authData) => {
  console.log('API: Calling /gmail/accounts/connect with:', authData);
  try {
    const response = await api.post('/gmail/accounts/connect', authData);
    console.log('API: Success response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API: Error calling /gmail/accounts/connect:', error);
    console.error('API: Error response:', error.response?.data);
    console.error('API: Error status:', error.response?.status);
    throw error;
  }
};

export const disconnectGmailAccount = async (accountId) => {
  console.log('API: Disconnecting Gmail account:', accountId);
  try {
    const response = await api.delete(`/gmail/accounts/${accountId}`);
    console.log('API: Disconnect success:', response.data);
    return response.data;
  } catch (error) {
    console.error('API: Disconnect error:', error);
    console.error('API: Error response:', error.response?.data);
    console.error('API: Error status:', error.response?.status);
    throw error;
  }
};

export const scanGmailAccount = async (accountId) => {
  console.log('API: Scanning Gmail account:', accountId);
  console.log('API: Request URL:', `/gmail/accounts/${accountId}/scan`);
  console.log('API: Full URL will be:', `${api.defaults.baseURL}/gmail/accounts/${accountId}/scan`);
  console.log('API: Auth token present:', !!localStorage.getItem('token'));
  
  try {
    console.log('API: Making scan request...');
    console.log('API: Request details:', {
      method: 'POST',
      url: `/gmail/accounts/${accountId}/scan`,
      baseURL: api.defaults.baseURL,
      headers: api.defaults.headers
    });
    
    const response = await api.post(`/gmail/accounts/${accountId}/scan`);
    console.log('API: Scan success:', response.data);
    return response.data;
  } catch (error) {
    console.error('API: Scan error:', error);
    console.error('API: Error response:', error.response?.data);
    console.error('API: Error status:', error.response?.status);
    console.error('API: Error config:', error.config);
    console.error('API: Network error:', error.message);
    
    // Log specific network error details
    if (error.code === 'ERR_NETWORK') {
      console.error('API: Network error detected - server might be down or CORS issue');
    }
    if (error.response?.status === 404) {
      console.error('API: 404 error - endpoint not found');
    }
    
    throw error;
  }
};

export const scanAllGmailAccounts = async () => {
  const response = await api.post('/gmail/accounts/scan-all');
  return response.data;
};
