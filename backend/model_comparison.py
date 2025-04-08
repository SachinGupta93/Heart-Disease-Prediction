import joblib
import numpy as np
import os

# Load both models
rf_model = joblib.load("model/heart_model.pkl")
rf_scaler = joblib.load("model/scaler.pkl")
nn_model = joblib.load("model/neural_network_model.pkl")
nn_scaler = joblib.load("model/scaler_nn.pkl")

def get_comparison_prediction(features):
    """
    Make predictions using both models and return comparison results
    """
    # Convert features to numpy array
    features_array = np.array(features).reshape(1, -1)
    
    # Get Random Forest prediction
    rf_scaled = rf_scaler.transform(features_array)
    rf_prediction = int(rf_model.predict(rf_scaled)[0])
    rf_probability = float(rf_model.predict_proba(rf_scaled)[0][1])
    
    # Get Neural Network prediction
    nn_scaled = nn_scaler.transform(features_array)
    nn_prediction = int(nn_model.predict(nn_scaled)[0])
    nn_probability = float(nn_model.predict_proba(nn_scaled)[0][1])
    
    # Create response
    return {
        "random_forest": {
            "prediction": rf_prediction,
            "probability": rf_probability,
            "message": "High risk of heart disease detected." if rf_prediction == 1 else "Low risk of heart disease detected."
        },
        "neural_network": {
            "prediction": nn_prediction,
            "probability": nn_probability,
            "message": "High risk of heart disease detected." if nn_prediction == 1 else "Low risk of heart disease detected."
        },
        "agreement": rf_prediction == nn_prediction
    }
