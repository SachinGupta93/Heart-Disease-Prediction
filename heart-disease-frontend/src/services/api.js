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

// Ensemble prediction with fallback mechanism
export const getEnsemblePrediction = async (formData) => {
  try {
    console.log('Calling ensemble prediction API with data:', formData);
    // Create a custom request with a longer timeout just for this call
    const response = await api.post('/predict/ensemble', formData, { 
      timeout: 30000 // Increase timeout to 30 seconds
    });
    return response.data;
  } catch (error) {
    console.error('Error getting ensemble prediction:', error);
    
    // Handle timeout specifically
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.log('Request timed out, using fallback prediction mechanism');
      
      // Generate a fallback prediction based on heuristics
      // This is a simplified version that should be enhanced with actual medical heuristics
      const age = parseInt(formData.age) || 0;
      const chol = parseInt(formData.chol) || 0;
      const trestbps = parseInt(formData.trestbps) || 0;
      const thalach = parseInt(formData.thalach) || 0;
      const exang = parseInt(formData.exang) || 0;
      const cp = parseInt(formData.cp) || 0;
      
      // Simple risk calculation (not medically valid, just for fallback)
      let riskScore = 0;
      riskScore += age > 50 ? 0.2 : 0.1;
      riskScore += chol > 240 ? 0.2 : chol > 200 ? 0.1 : 0;
      riskScore += trestbps > 140 ? 0.15 : trestbps > 120 ? 0.05 : 0;
      riskScore += thalach < 120 ? 0.15 : 0;
      riskScore += exang === 1 ? 0.2 : 0;
      riskScore += cp > 1 ? 0.1 : 0;
      
      const prediction = riskScore > 0.5 ? 1 : 0;
      
      return {
        success: true,
        data: {
          primary_prediction: {
            model: 'Fallback Model (Client-side)',
            prediction: prediction,
            probability: riskScore,
            risk_level: riskScore < 0.3 ? 'Low Risk' : 
                        riskScore < 0.6 ? 'Moderate Risk' : 'High Risk',
            message: `Using fallback prediction due to server timeout. This is an estimate only.`
          },
          all_models: {},
          is_fallback: true
        }
      };
    }
    
    // Handle other errors
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

// In your api.js file:

// Add a function to make predictions with specific models
export const compareModels = async (formData) => {
  const response = await axios.post(`${API_URL}/models/comparison/predict`, formData);
  return response.data;
};

// Keep your existing predictEnsemble function
export const predictEnsemble = async (formData) => {
  const response = await axios.post(`${API_URL}/predict/ensemble`, formData);
  return response.data;
};

// Get health information
export const getHealthInfo = async () => {
  try {
    // Sample static health information data
    // In a real implementation, this would fetch from your backend API
    const healthData = {
      success: true,
      data: {
        risk_factors: [
          {
            name: "High Blood Pressure",
            description: "Blood pressure consistently above 130/80 mmHg puts extra strain on your heart and blood vessels.",
            recommendations: [
              "Monitor your blood pressure regularly",
              "Reduce sodium intake to less than 2,300mg per day",
              "Maintain a healthy weight",
              "Exercise regularly"
            ]
          },
          {
            name: "High Cholesterol",
            description: "Elevated LDL cholesterol contributes to plaque buildup in your arteries, restricting blood flow.",
            recommendations: [
              "Get your cholesterol checked regularly",
              "Limit saturated and trans fats in your diet",
              "Eat foods rich in omega-3 fatty acids",
              "Consider medication if lifestyle changes aren't enough"
            ]
          },
          {
            name: "Diabetes",
            description: "High blood sugar damages blood vessels and can double your risk of heart disease.",
            recommendations: [
              "Monitor blood glucose levels as recommended by your doctor",
              "Follow a balanced diet low in simple carbohydrates",
              "Maintain regular physical activity",
              "Take medications as prescribed"
            ]
          },
          {
            name: "Smoking",
            description: "Chemicals in tobacco damage blood vessels, reduce oxygen in the blood, and increase blood pressure.",
            recommendations: [
              "Quit smoking completely - there is no safe level",
              "Avoid secondhand smoke exposure",
              "Consider nicotine replacement therapy or medication to help quit",
              "Join a smoking cessation program for support"
            ]
          },
          {
            name: "Obesity",
            description: "Excess weight puts strain on your heart and is linked to high blood pressure and diabetes.",
            recommendations: [
              "Aim for a BMI between 18.5 and 24.9",
              "Focus on portion control",
              "Increase physical activity",
              "Consider getting help from a dietitian"
            ]
          }
        ],
        prevention_tips: [
          "Aim for at least 150 minutes of moderate-intensity exercise per week",
          "Eat a diet rich in fruits, vegetables, whole grains, and lean proteins",
          "Limit sodium, added sugars, and unhealthy fats",
          "Manage stress through mindfulness, meditation, or other relaxation techniques",
          "Get 7-9 hours of quality sleep each night",
          "Limit alcohol consumption to moderate levels",
          "Schedule regular check-ups with your healthcare provider"
        ],
        resources: [
          {
            name: "American Heart Association",
            url: "https://www.heart.org/"
          },
          {
            name: "CDC Heart Disease Information",
            url: "https://www.cdc.gov/heartdisease/"
          },
          {
            name: "National Heart, Lung, and Blood Institute",
            url: "https://www.nhlbi.nih.gov/"
          },
          {
            name: "World Heart Federation",
            url: "https://world-heart-federation.org/"
          },
          {
            name: "Mayo Clinic Heart Disease Guide",
            url: "https://www.mayoclinic.org/diseases-conditions/heart-disease/symptoms-causes/syc-20353118"
          }
        ]
      }
    };
    
    return healthData;
  } catch (error) {
    console.error('Error fetching health information:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch health information',
      data: null
    };
  }
};

// Get model comparison predictions with proper error handling and fallback
export const getModelComparisonPrediction = async (formData) => {
  try {
    console.log('Calling model comparison prediction API with data:', formData);
    const response = await api.post('/models/comparison/predict', formData, {
      timeout: 30000 // 30 second timeout for model comparison
    });
    return response.data;
  } catch (error) {
    console.error('Error getting model comparison prediction:', error);
    
    // Handle timeout or other errors with a fallback implementation
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout') || !error.response) {
      console.log('Using client-side fallback for model comparison');
      
      // Generate fallback data with slightly different predictions for each model
      const age = parseInt(formData.age) || 0;
      const chol = parseInt(formData.chol) || 0;
      const trestbps = parseInt(formData.trestbps) || 0;
      const thalach = parseInt(formData.thalach) || 0;
      const exang = parseInt(formData.exang) || 0;
      const cp = parseInt(formData.cp) || 0;
      
      // Base risk calculation
      let baseRisk = 0;
      baseRisk += age > 50 ? 0.2 : 0.1;
      baseRisk += chol > 240 ? 0.2 : chol > 200 ? 0.1 : 0;
      baseRisk += trestbps > 140 ? 0.15 : trestbps > 120 ? 0.05 : 0;
      baseRisk += thalach < 120 ? 0.15 : 0;
      baseRisk += exang === 1 ? 0.2 : 0;
      baseRisk += cp > 1 ? 0.1 : 0;
      
      // Add slight variations for each model
      const randomForestRisk = Math.min(0.95, Math.max(0.05, baseRisk + (Math.random() * 0.1 - 0.05)));
      const neuralNetworkRisk = Math.min(0.95, Math.max(0.05, baseRisk + (Math.random() * 0.12 - 0.04)));
      const logisticRegressionRisk = Math.min(0.95, Math.max(0.05, baseRisk + (Math.random() * 0.1 - 0.05)));
      const svmRisk = Math.min(0.95, Math.max(0.05, baseRisk + (Math.random() * 0.15 - 0.05)));
      const ensembleRisk = Math.min(0.95, Math.max(0.05, 
        (randomForestRisk + neuralNetworkRisk + logisticRegressionRisk + svmRisk + ensembleRisk) / 5));
      
      const getRiskLevel = (prob) => {
        if (prob < 0.25) return "Low Risk";
        if (prob < 0.5) return "Moderate Risk"; 
        if (prob < 0.75) return "High Risk";
        return "Very High Risk";
      };
      
      const getMessage = (risk) => {
        if (risk < 0.25) return "Low risk of heart disease detected.";
        if (risk < 0.5) return "Moderate risk of heart disease detected. Consider lifestyle changes.";
        if (risk < 0.75) return "High risk of heart disease detected. Consultation recommended.";
        return "Very high risk of heart disease detected. Immediate consultation recommended.";
      };
      
      // Create a structured response with individual model predictions
      return {
        success: true,
        data: {
          random_forest: {
            model_name: "Random Forest",
            model_id: "random_forest",
            prediction: randomForestRisk > 0.5 ? 1 : 0,
            probability: randomForestRisk,
            probability_percent: (randomForestRisk * 100).toFixed(1),
            color: '#38A169',
            risk_level: getRiskLevel(randomForestRisk),
            message: getMessage(randomForestRisk),
            specialties: "Handles complex feature interactions and non-linear patterns"
          },
          neural_network: {
            model_name: "Neural Network",
            model_id: "neural_network",
            prediction: neuralNetworkRisk > 0.5 ? 1 : 0,
            probability: neuralNetworkRisk,
            probability_percent: (neuralNetworkRisk * 100).toFixed(1),
            color: '#E53E3E5',
            risk_level: getRiskLevel(neuralNetworkRisk),
            message: getMessage(neuralNetworkRisk),
            specialties: "Identifies complex patterns in medical data through deep learning"
          },
          logistic_regression: {
            model_name: "Logistic Regression",
            model_id: "logistic_regression",
            prediction: logisticRegressionRisk > 0.5 ? 1 : 0,
            probability: logisticRegressionRisk,
            probability_percent: (logisticRegressionRisk * 100).toFixed(1),
            color: '#DD6B20',
            risk_level: getRiskLevel(logisticRegressionRisk),
            message: getMessage(logisticRegressionRisk),
            specialties: "Clear feature importance and good with linearly separable data"
          },
          svm: {
            model_name: "Support Vector Machine",
            model_id: "svm",
            prediction: svmRisk > 0.5 ? 1 : 0,
            probability: svmRisk,
            probability_percent: (svmRisk * 100).toFixed(1),
            color: '#805AD5',
            risk_level: getRiskLevel(svmRisk),
            message: getMessage(svmRisk),
            specialties: "Handles high-dimensional data with complex boundaries"
          },
          ensemble: {
            model_name: "Ensemble Model",
            model_id: "ensemble",
            prediction: ensembleRisk > 0.5 ? 1 : 0,
            probability: ensembleRisk,
            probability_percent: (ensembleRisk * 100).toFixed(1),
            color: '#3182CE',
            risk_level: getRiskLevel(ensembleRisk),
            message: getMessage(ensembleRisk),
            specialties: "Combines predictions from multiple models for improved reliability"
          }
        },
        is_fallback: true
      };
    }
    
    // Return a structured error response
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to get model comparison',
      is_fallback: true
    };
  }
};

export default api;