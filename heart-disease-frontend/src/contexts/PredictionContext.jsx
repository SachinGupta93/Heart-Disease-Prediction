import React, { createContext, useContext, useState } from 'react';

const PredictionContext = createContext();

export function usePrediction() {
  return useContext(PredictionContext);
}

export function PredictionProvider({ children }) {
  const [predictionData, setPredictionData] = useState(null);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Update the current prediction data
  const updatePrediction = (data) => {
    setPredictionData(data);
  };

  // Clear the current prediction
  const clearPrediction = () => {
    setPredictionData(null);
  };

  // Update prediction history
  const updateHistory = (history) => {
    setPredictionHistory(history);
  };

  // Add a prediction to history
  const addToHistory = (prediction) => {
    setPredictionHistory(prev => [prediction, ...prev]);
  };

  // Remove a prediction from history
  const removeFromHistory = (predictionId) => {
    setPredictionHistory(prev => 
      prev.filter(item => item.id !== predictionId)
    );
  };

  const value = {
    predictionData,
    updatePrediction,
    clearPrediction,
    predictionHistory,
    updateHistory,
    addToHistory,
    removeFromHistory,
    loading,
    setLoading
  };

  return (
    <PredictionContext.Provider value={value}>
      {children}
    </PredictionContext.Provider>
  );
}