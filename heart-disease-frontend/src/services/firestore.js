import { 
  collection, 
  addDoc, 
  getDocs,
  getDoc,
  setDoc,
  query, 
  where, 
  orderBy, 
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
  writeBatch,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase'; // Make sure this path is correct
import { getAuth } from 'firebase/auth';
import { logError, trackEvent } from './errorLogging'; // Import the error logging service

// Collection references
const predictionsRef = collection(db, "predictions");
const remindersRef = collection(db, "reminders"); // Add this line to fix the earlier error

// Get the current user ID
const getCurrentUserId = () => {
  const auth = getAuth();
  return auth.currentUser ? auth.currentUser.uid : null;
};

/**
 * Save a prediction to Firestore with better error handling
 * @param {string} userId - The user ID
 * @param {Object} predictionData - The prediction data to save
 * @returns {Promise<string>} - The document ID of the saved prediction
 */
export const savePrediction = async (userId, predictionData) => {
  try {
    // Validate userId
    if (!userId) {
      throw new Error("User ID is required");
    }
    
    const docRef = await addDoc(predictionsRef, {
      userId,
      ...predictionData,
      createdAt: new Date(),
      // Add additional metadata
      deviceInfo: navigator.userAgent,
      appVersion: '1.0.0'
    });
    
    // Track successful prediction
    trackEvent('prediction_saved', {
      userId,
      predictionId: docRef.id,
      riskLevel: predictionData.risk_level
    });
    
    console.log("Prediction saved with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error saving prediction:", error);
    // Use our error logging service
    logError('savePrediction', error, { userId });
    throw new Error(`Failed to save prediction: ${error.message}`);
  }
};

/**
 * Get all predictions for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} - An array of predictions
 */
export const getUserPredictions = async (userId) => {
  try {
    const q = query(
      predictionsRef, 
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const predictions = [];
    
    querySnapshot.forEach((doc) => {
      predictions.push({ id: doc.id, ...doc.data() });
    });
    
    return predictions;
  } catch (error) {
    console.error("Error getting user predictions:", error);
    throw new Error(`Failed to retrieve predictions: ${error.message}`);
  }
};

/**
 * Delete a prediction
 * @param {string} predictionId - The prediction document ID
 * @returns {Promise<void>}
 */
export const deletePrediction = async (predictionId) => {
  try {
    const predictionRef = doc(db, "predictions", predictionId);
    await deleteDoc(predictionRef);
  } catch (error) {
    console.error("Error deleting prediction:", error);
    throw new Error(`Failed to delete prediction: ${error.message}`);
  }
};

/**
 * Export prediction history as CSV
 * @param {Array} predictions - Array of prediction objects
 * @returns {string} - CSV formatted string
 */
export const exportPredictionsAsCSV = (predictions) => {
  // CSV header
  let csvContent = "Date,Prediction,Probability,Risk Level,Age,Sex,Chest Pain Type,Blood Pressure,Cholesterol,Fasting Blood Sugar,Resting ECG,Max Heart Rate,Exercise Angina,ST Depression,Slope,Vessels,Thalassemia\n";
  
  // Add each prediction as a row
  predictions.forEach(pred => {
    const inputs = pred.inputs;
    if (!inputs) {
      console.warn('Prediction missing input data:', pred);
      return;
    }
    
    const row = [
      new Date(pred.date).toLocaleDateString(),
      pred.prediction === 1 ? 'Positive' : 'Negative',
      (pred.probability * 100).toFixed(2) + '%',
      pred.risk_level,
      inputs.age,
      inputs.sex === 1 ? 'Male' : 'Female',
      ['Typical Angina', 'Atypical Angina', 'Non-anginal Pain', 'Asymptomatic'][inputs.cp],
      inputs.trestbps,
      inputs.chol,
      inputs.fbs === 1 ? 'Yes' : 'No',
      ['Normal', 'ST-T Wave Abnormality', 'Left Ventricular Hypertrophy'][inputs.restecg],
      inputs.thalach,
      inputs.exang === 1 ? 'Yes' : 'No',
      inputs.oldpeak,
      ['Upsloping', 'Flat', 'Downsloping'][inputs.slope],
      inputs.ca,
      ['Normal', 'Fixed Defect', 'Reversible Defect', 'Unknown'][inputs.thal]
    ].join(',');
    
    csvContent += row + "\n";
  });
  
  return csvContent;
};

/**
 * Create a downloadable CSV file
 * @param {Array} predictions - Array of prediction objects
 * @param {string} filename - Name of the file to download
 */
export const downloadCSV = (predictions, filename = 'heart-disease-predictions.csv') => {
  const csvContent = exportPredictionsAsCSV(predictions);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Schedule a reminder
 * @param {string} userId - The user's ID
 * @param {object} reminderData - The reminder data
 * @returns {Promise<string>} - The document ID of the saved reminder
 */
export const scheduleReminder = async (userId, reminderData) => {
  try {
    const auth = getAuth();
    if (!auth.currentUser) {
      throw new Error("User not authenticated");
    }
    
    // Use Timestamp for the date
    const dueDate = new Date(reminderData.date);
    
    const docRef = await addDoc(remindersRef, {
      userId,
      title: reminderData.title,
      description: reminderData.description,
      dueDate: Timestamp.fromDate(dueDate),
      type: reminderData.type,
      priority: reminderData.priority,
      isCompleted: false,
      createdAt: Timestamp.now()
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error scheduling reminder:", error);
    throw new Error(`Failed to schedule reminder: ${error.message}`);
  }
};

/**
 * Get user's reminders
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} - Array of reminder objects
 */
export const getUserReminders = async (userId) => {
  try {
    // Simpler query without orderBy
    const q = query(
      remindersRef,
      where("userId", "==", userId)
      // Remove the orderBy temporarily
      // orderBy("dueDate", "asc")
    );
    
    const querySnapshot = await getDocs(q);
    const reminders = [];
    
    querySnapshot.forEach((doc) => {
      reminders.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort reminders in JavaScript instead of in the database query
    reminders.sort((a, b) => {
      const dateA = a.dueDate && a.dueDate.toDate ? a.dueDate.toDate() : new Date(a.dueDate);
      const dateB = b.dueDate && b.dueDate.toDate ? b.dueDate.toDate() : new Date(b.dueDate);
      return dateA - dateB;
    });
    
    return reminders;
  } catch (error) {
    console.error("Error getting user reminders:", error);
    throw new Error(`Failed to retrieve reminders: ${error.message}`);
  }
};

/**
 * Mark a reminder as completed
 * @param {string} reminderId - The ID of the reminder to complete
 * @returns {Promise<boolean>} - True if update was successful
 */
export const completeReminder = async (reminderId) => {
  try {
    const reminderRef = doc(db, "reminders", reminderId);
    await updateDoc(reminderRef, {
      isCompleted: true,
      completedAt: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error("Error completing reminder:", error);
    throw new Error(`Failed to complete reminder: ${error.message}`);
  }
};

/**
 * Delete a reminder
 * @param {string} reminderId - The ID of the reminder to delete
 * @returns {Promise<boolean>} - True if deletion was successful
 */
export const deleteReminder = async (reminderId) => {
  try {
    const reminderRef = doc(db, "reminders", reminderId);
    await deleteDoc(reminderRef);
    return true;
  } catch (error) {
    console.error("Error deleting reminder:", error);
    throw new Error(`Failed to delete reminder: ${error.message}`);
  }
};

/**
 * Save user preferences
 * @param {string} userId - The user's ID
 * @param {object} preferences - User preferences object
 * @returns {Promise<boolean>} - True if save was successful
 */
export const saveUserPreferences = async (userId, preferences) => {
  try {
    const userPrefRef = doc(db, 'userPreferences', userId);
    
    // Check if document exists
    const docSnap = await getDoc(userPrefRef);
    
    if (docSnap.exists()) {
      // Update existing document
      await updateDoc(userPrefRef, {
        preferences: preferences,
        updatedAt: Timestamp.now()
      });
    } else {
      // Create new document
      await setDoc(userPrefRef, {
        userId: userId,
        preferences: preferences,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }
    
    console.log('User preferences saved for:', userId);
    return true;
  } catch (error) {
    console.error('Error saving user preferences:', error);
    throw new Error(`Failed to save preferences: ${error.message}`);
  }
};

/**
 * Get user preferences
 * @param {string} userId - The user's ID
 * @returns {Promise<object|null>} - User preferences or null if not found
 */
export const getUserPreferences = async (userId) => {
  try {
    const userPrefRef = doc(db, 'userPreferences', userId);
    const docSnap = await getDoc(userPrefRef);
    
    if (docSnap.exists()) {
      return docSnap.data().preferences;
    } else {
      console.log('No preferences found for user:', userId);
      return null;
    }
  } catch (error) {
    console.error('Error getting user preferences:', error);
    throw new Error(`Failed to retrieve preferences: ${error.message}`);
  }
};

/**
 * Add batch operations for multiple writes
 * @param {string} userId - The user ID
 * @param {Array} predictions - Array of prediction objects
 * @returns {Promise<boolean>} - True if save was successful
 */
export const batchSavePredictions = async (userId, predictions) => {
  if (!predictions || predictions.length === 0) return;
  
  try {
    const batch = writeBatch(db);
    
    predictions.forEach(predictionData => {
      const newDocRef = doc(collection(db, "predictions"));
      batch.set(newDocRef, {
        userId,
        ...predictionData,
        createdAt: Timestamp.now()
      });
    });
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error saving predictions in batch:", error);
    throw new Error(`Failed to save predictions: ${error.message}`);
  }
};

/**
 * Add real-time listeners with cleanup
 * @param {string} userId - The user ID
 * @param {function} callback - Callback function to handle real-time updates
 * @returns {function} - Unsubscribe function for cleanup
 */
export const subscribeToPredictions = (userId, callback) => {
  if (!userId) return () => {};
  
  const q = query(
    predictionsRef, 
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const predictions = [];
    querySnapshot.forEach((doc) => {
      predictions.push({ id: doc.id, ...doc.data() });
    });
    callback(predictions);
  }, (error) => {
    console.error("Error in predictions listener:", error);
  });
  
  // Return unsubscribe function for cleanup
  return unsubscribe;
};

/**
 * Add a function to check if a user has any data
 * @param {string} userId - The user ID
 * @returns {Promise<object>} - Object containing user data status
 */
export const checkUserData = async (userId) => {
  try {
    const predictions = await getUserPredictions(userId);
    const reminders = await getUserReminders(userId);
    const preferences = await getUserPreferences(userId);
    
    return {
      hasPredictions: predictions.length > 0,
      hasReminders: reminders.length > 0,
      hasPreferences: preferences !== null,
      predictionCount: predictions.length,
      reminderCount: reminders.length
    };
  } catch (error) {
    console.error("Error checking user data:", error);
    return {
      hasPredictions: false,
      hasReminders: false,
      hasPreferences: false,
      error: error.message
    };
  }
};