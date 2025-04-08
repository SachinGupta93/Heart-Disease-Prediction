// Configuration for the Heart Disease Prediction App

// API URL - matches the URL in the .env file
export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

// Other configuration options
export const APP_NAME = 'Heart Disease Prediction';
export const APP_VERSION = '1.0.0';

// Feature flags
export const FEATURES = {
  aiAssistant: true,
  modelComparison: true,
  featureImportance: true,
  healthInformation: true
};