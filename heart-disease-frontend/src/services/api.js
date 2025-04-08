import axios from 'axios';
import { auth } from '../firebase';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  } catch (error) {
    console.error("Auth token error:", error);
    return config;
  }
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => {
    console.log(`API Response: ${response.status}`, response.data);
    return response;
  },
  error => {
    if (error.response) {
      console.error("API Response Error:", {
        status: error.response.status,
        data: error.response.data
      });
    } else {
      console.error("API Response Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// Check API health
export const checkApiHealth = async () => {
  try {
    const response = await api.get('/health/status');
    return { ...response.data, online: true };
  } catch (error) {
    console.error('API health check failed:', error);
    return { online: false, message: 'API server is unreachable' };
  }
};

// Ensemble prediction
export const getEnsemblePrediction = async (formData) => {
  try {
    console.log('Calling ensemble prediction API with data:', formData);
    const response = await api.post('/predict/ensemble', formData);
    return response.data;
  } catch (error) {
    console.error('Error getting ensemble prediction:', error);
    throw new Error(error.response?.data?.message || 'Failed to get prediction');
  }
};

// Get prediction from specific model
export const getModelPrediction = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      console.warn('API returned HTML instead of JSON');
      return {
        success: false,
        error: 'API returned HTML instead of JSON',
        data: null
      };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error making prediction:', error);
    return {
      success: false,
      error: error.message || 'Failed to get prediction',
      data: null
    };
  }
};

// Get feature importance data

// Use a proper singleton pattern for API request tracking
const apiRequestTracker = {
  _requests: new Set(),
  isRequesting: function(endpoint) {
    return this._requests.has(endpoint);
  },
  startRequest: function(endpoint) {
    this._requests.add(endpoint);
    return true;
  },
  endRequest: function(endpoint) {
    this._requests.delete(endpoint);
  }
};

export const getFeatureImportance = async () => {
  const endpoint = 'models/feature-importance';
  
  // Check if a request is already in progress
  if (apiRequestTracker.isRequesting(endpoint)) {
    console.log('Preventing duplicate feature importance request');
    return {
      success: false,
      error: 'Request already in progress',
      data: null,
      useFallback: true
    };
  }
  
  // Mark request as in progress
  apiRequestTracker.startRequest(endpoint);
  
  try {
    // Add timestamp to prevent caching
    const response = await axios.get(`${API_BASE_URL}/${endpoint}`, {
      params: { _: Date.now() },
      timeout: 5000 // 5 second timeout
    });
    
    // Mark request as complete
    apiRequestTracker.endRequest(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching feature importance:', error);
    
    // Mark request as complete
    apiRequestTracker.endRequest(endpoint);
    
    // For 500 errors, return a structured error with fallback indicator
    if (error.response && error.response.status === 500) {
      return {
        success: false,
        error: 'The server encountered an internal error. Using simulation data instead.',
        data: null,
        useFallback: true
      };
    }
    
    // For network errors, CORS, etc.
    return {
      success: false,
      error: error.message || 'Failed to fetch feature importance data',
      data: null,
      useFallback: true
    };
  }
};

// Get user prediction history - FIXED ENDPOINT
export const getUserPredictions = async (userId) => {
  try {
    const response = await api.get(`/history/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting prediction history:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch prediction history');
  }
};

// Save prediction to history - FIXED ENDPOINT
export const savePrediction = async (userId, predictionData) => {
  try {
    console.log('Would save prediction for user:', userId, predictionData);
    return { success: true, message: 'Prediction saved (mock)' };
  } catch (error) {
    console.error('Error saving prediction:', error);
    return { success: false, message: 'Failed to save prediction' };
  }
};

// Delete prediction from user history
export const deletePrediction = async (userId, predictionId) => {
  try {
    const response = await api.delete(`/users/${userId}/predictions/${predictionId}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error deleting prediction:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to delete prediction'
    };
  }
};

// Improved model comparison API with proper HTML detection
export const getModelComparison = async () => {
  try {
    // Use fetch instead of axios for more control over response parsing
    const response = await fetch(`${API_BASE_URL}/models/comparison`);
    
    // Check if response is OK
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    // Get the content type
    const contentType = response.headers.get('content-type');
    
    // Check if response is HTML (causing the error)
    if (contentType && contentType.includes('text/html')) {
      console.warn('API returned HTML instead of JSON. Using fallback data');
      
      // Return a well-formed fallback response instead of throwing
      return {
        success: false,
        error: 'API returned HTML instead of JSON',
        data: null
      };
    }
    
    // Parse JSON response carefully
    try {
      const data = await response.json();
      return data;
    } catch (jsonError) {
      console.error('Failed to parse JSON response:', jsonError);
      
      // Return a well-formed fallback
      return {
        success: false,
        error: 'Invalid JSON response',
        data: null
      };
    }
  } catch (error) {
    console.error('Error fetching model comparison:', error);
    
    // Return a well-formed object that won't break the frontend
    return {
      success: false,
      error: error.message || 'Failed to fetch model data',
      data: null
    };
  }
};


export const getFeatureExplanation = async (inputs) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/explain`, { inputs });
    return response.data;
  } catch (error) {
    console.error('Error getting feature explanation:', error);
    
    // If in development mode or API fails, return a structured response
    if (process.env.NODE_ENV === 'development' || error.message.includes('Network Error')) {
      console.log('Using fallback explanation data');
      return {
        success: false,
        message: 'Could not fetch explanation from API, using fallback data',
        data: null
      };
    }
    
    return {
      success: false,
      message: error.response?.data?.message || error.message,
      error: error
    };
  }
};

export default api;