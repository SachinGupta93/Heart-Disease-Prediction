// Error logging utility for Firebase integration
import { doc, setDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Log application errors to Firestore for monitoring
 * @param {string} operation - The operation where the error occurred
 * @param {Error} error - The error object
 * @param {object} metadata - Additional metadata about the error context
 */
export const logError = async (operation, error, metadata = {}) => {
  try {
    // Create a reference to the errors collection
    const errorLogRef = doc(collection(db, "errorLogs"));
    
    // Record the error with timestamp and details
    await setDoc(errorLogRef, {
      operation,
      errorMessage: error.message,
      errorStack: error.stack,
      timestamp: Timestamp.now(),
      metadata,
      userAgent: navigator.userAgent,
      path: window.location.pathname
    });
    
    console.log("Error logged to Firestore:", operation);
  } catch (logError) {
    // Don't throw from the error logger to avoid infinite loops
    console.error("Failed to log error to Firestore:", logError);
  }
};

/**
 * Track application usage for analytics
 * @param {string} action - The action being performed
 * @param {object} data - Additional data about the action
 */
export const trackEvent = async (action, data = {}) => {
  try {
    const eventLogRef = doc(collection(db, "appEvents"));
    
    await setDoc(eventLogRef, {
      action,
      data,
      timestamp: Timestamp.now(),
      userId: data.userId || null,
      path: window.location.pathname
    });
  } catch (error) {
    console.error("Failed to track event:", error);
  }
};