import joblib
import numpy as np
import os
import pickle
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.ensemble import VotingClassifier
import os.path
from backend.utils.logger import get_logger
from scipy import stats

logger = get_logger()

# Get the directory of the current script file
current_dir = os.path.dirname(os.path.abspath(__file__))

# Load the Random Forest model
rf_model = joblib.load(os.path.join(current_dir, "model/heart_model.pkl"))

# Load the main scaler used for most models
main_scaler = joblib.load(os.path.join(current_dir, "model/scaler.pkl"))

# Function to load all models
def load_all_models():
    """
    Loads all available models: Random Forest, Neural Network, Logistic Regression, SVM, and Ensemble
    """
    models = {
        'random_forest': rf_model  # Already loaded above
    }
    
    # Load Neural Network model
    try:
        if os.path.exists(os.path.join(current_dir, "model/nn_model.pkl")):
            logger.info("Loading scikit-learn neural network model (nn_model.pkl)")
            nn_model = joblib.load(os.path.join(current_dir, "model/nn_model.pkl"))
            nn_scaler = joblib.load(os.path.join(current_dir, "model/scaler_nn.pkl"))
            models['neural_network'] = {'model': nn_model, 'scaler': nn_scaler, 'type': 'sklearn'}
        else:
            logger.warning("Neural Network model not found")
    except Exception as e:
        logger.error(f"Error loading Neural Network model: {e}")
    
    # Load Logistic Regression model
    try:
        if os.path.exists(os.path.join(current_dir, "model/lr_model.pkl")):
            logger.info("Loading Logistic Regression model (lr_model.pkl)")
            lr_model = joblib.load(os.path.join(current_dir, "model/lr_model.pkl"))
            models['logistic_regression'] = {'model': lr_model, 'scaler': main_scaler, 'type': 'sklearn'}
        else:
            logger.warning("Logistic Regression model not found")
    except Exception as e:
        logger.error(f"Error loading Logistic Regression model: {e}")
    
    # Load SVM model
    try:
        if os.path.exists(os.path.join(current_dir, "model/svm_model.pkl")):
            logger.info("Loading SVM model (svm_model.pkl)")
            svm_model = joblib.load(os.path.join(current_dir, "model/svm_model.pkl"))
            models['svm'] = {'model': svm_model, 'scaler': main_scaler, 'type': 'sklearn'}
        else:
            logger.warning("SVM model not found")
    except Exception as e:
        logger.error(f"Error loading SVM model: {e}")
    
    # Load Ensemble model
    try:
        if os.path.exists(os.path.join(current_dir, "model/ensemble_model.pkl")):
            logger.info("Loading Ensemble model (ensemble_model.pkl)")
            ensemble_model = joblib.load(os.path.join(current_dir, "model/ensemble_model.pkl"))
            models['ensemble'] = {'model': ensemble_model, 'scaler': main_scaler, 'type': 'sklearn'}
        else:
            logger.warning("Ensemble model not found")
    except Exception as e:
        logger.error(f"Error loading Ensemble model: {e}")
    
    return models

# Load all available models
all_models = load_all_models()

def calculate_confidence_interval(probability, n=100, confidence=0.95):
    """
    Calculate confidence interval for a probability estimate
    
    Args:
        probability: The probability estimate (0-1)
        n: Sample size (default 100)
        confidence: Confidence level (default 0.95 for 95% CI)
        
    Returns:
        Dictionary with lower and upper bounds of the confidence interval
    """
    # Calculate standard error
    se = np.sqrt((probability * (1 - probability)) / n)
    
    # Calculate z-score for the given confidence level
    z = stats.norm.ppf((1 + confidence) / 2)
    
    # Calculate margin of error
    margin = z * se
    
    # Calculate lower and upper bounds
    lower = max(0, probability - margin)
    upper = min(1, probability + margin)
    
    return {
        "lower_bound": float(lower),
        "upper_bound": float(upper),
        "confidence_level": confidence
    }

def calculate_calibration_score(probability):
    """
    Calculate a simple calibration score indicating reliability of the probability
    
    Args:
        probability: The probability estimate (0-1)
        
    Returns:
        Calibration score (0-1) where higher is better calibrated
    """
    # This is a simplified measure - in production, you would want to use proper calibration curves
    # For this example, we'll use a simple heuristic that penalizes extreme probabilities
    if probability < 0.05 or probability > 0.95:
        return 0.8  # Slightly penalize very extreme probabilities
    elif probability < 0.15 or probability > 0.85:
        return 0.9  # Slightly penalize somewhat extreme probabilities
    else:
        return 1.0  # Middle probabilities are considered well-calibrated
    
def get_risk_level(probability):
    """
    Get risk level based on probability
    """
    # Handle None or invalid values
    if probability is None or not isinstance(probability, (int, float)):
        return "Unknown Risk"
        
    # Now compare with valid numeric value
    if probability < 0.25:
        return "Low Risk"
    elif probability < 0.5:
        return "Moderate Risk"
    elif probability < 0.75:
        return "High Risk"
    else:
        return "Very High Risk"

def get_comparison_prediction(features):
    """
    Make predictions using all available models and return comparison results
    """
    # Convert features to numpy array
    features_array = np.array(features).reshape(1, -1)
    
    results = {}
    
    # Get predictions from each model
    for model_name, model_info in all_models.items():
        try:
            if model_name == 'random_forest':
                # Random Forest has a different structure
                scaled_features = main_scaler.transform(features_array)
                prediction = int(model_info.predict(scaled_features)[0])
                probability = float(model_info.predict_proba(scaled_features)[0][1])
            else:
                # Other models have a standardized structure
                model = model_info['model']
                scaler = model_info['scaler']
                model_type = model_info['type']
                
                scaled_features = scaler.transform(features_array)
                
                if model_type == 'sklearn':
                    prediction = int(model.predict(scaled_features)[0])
                    probability = float(model.predict_proba(scaled_features)[0][1])
                else:
                    # Handle non-sklearn models if needed
                    prediction = int(model.predict(scaled_features)[0])
                    probability = float(model.predict_proba(scaled_features)[0][1])
            
            # Calculate confidence interval
            confidence_interval = calculate_confidence_interval(probability)
            
            # Calculate calibration score
            calibration_score = calculate_calibration_score(probability)
            
            # Get risk level
            risk_level = get_risk_level(probability)
            
            # Determine prediction message based on risk level
            risk_messages = {
                "Low Risk": "Low risk of heart disease detected.",
                "Moderate Risk": "Moderate risk of heart disease detected. Consider lifestyle changes.",
                "High Risk": "High risk of heart disease detected. Consultation recommended.",
                "Very High Risk": "Very high risk of heart disease detected. Immediate consultation recommended."
            }
            
            message = risk_messages.get(risk_level, "Unknown risk level.")
            
            results[model_name] = {
                "prediction": prediction,
                "probability": probability,
                "confidence_interval": confidence_interval,
                "calibration_score": calibration_score,
                "risk_level": risk_level,
                "message": message
            }
        except Exception as e:
            logger.error(f"Error making prediction with {model_name} model: {e}")
            results[model_name] = {
                "prediction": None,
                "probability": None,
                "message": f"Error making prediction: {str(e)}"
            }
    
    # Check agreement among models
    predictions = [result['prediction'] for model, result in results.items() if result['prediction'] is not None]
    if predictions:
        majority_vote = 1 if sum(predictions) > len(predictions) / 2 else 0
        
        # Calculate agreement percentage
        agreement_percentage = (sum(1 for p in predictions if p == majority_vote) / len(predictions)) * 100
        
        # Calculate average probability for the positive class
        probabilities = [result['probability'] for model, result in results.items() 
                        if result['probability'] is not None]
        avg_probability = sum(probabilities) / len(probabilities) if probabilities else 0.5
        
        # Get risk level based on average probability
        avg_risk_level = get_risk_level(avg_probability)
        
        # Create message based on risk level
        risk_messages = {
            "Low Risk": "Low risk of heart disease based on majority vote.",
            "Moderate Risk": "Moderate risk of heart disease based on majority vote. Consider lifestyle changes.",
            "High Risk": "High risk of heart disease based on majority vote. Consultation recommended.",
            "Very High Risk": "Very high risk of heart disease based on majority vote. Immediate consultation recommended."
        }
        
        message = risk_messages.get(avg_risk_level, "Unknown risk level.")
        
        results['majority_vote'] = {
            "prediction": majority_vote,
            "agreement_percentage": agreement_percentage,
            "average_probability": avg_probability,
            "risk_level": avg_risk_level,
            "message": message
        }
    
    return results
