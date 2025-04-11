// Configuration for the Heart Disease Prediction App

// API URL - matches the URL in the .env file
export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

// Other configuration options
export const APP_NAME = 'Heart Disease Prediction';
export const APP_VERSION = '1.0.0';

// AI API Configuration
export const AI_CONFIG = {
  // Gemini API configuration
  gemini: {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
    model: import.meta.env.VITE_GEMINI_MODEL || 'gemini-pro',
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
    enabled: true
  },
  // HuggingFace API configuration (existing)
  huggingFace: {
    apiKey: import.meta.env.VITE_HF_API_KEY || '',
    model: import.meta.env.VITE_HF_MODEL_ID || 'mistralai/Mistral-7B-Instruct-v0.2',
    enabled: true
  }
};

// Feature flags
export const FEATURES = {
  aiAssistant: true,
  modelComparison: true,
  featureImportance: true,
  healthInformation: true
};