import numpy as np
import pandas as pd
import joblib
import shap
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Get paths from environment variables or use defaults
MODEL_PATH = os.getenv('MODEL_PATH', './model/heart_model.pkl')
SCALER_PATH = os.getenv('SCALER_PATH', './model/scaler.pkl')
NN_MODEL_PATH = os.getenv('NN_MODEL_PATH', './model/nn_model.pkl')
EXPLAINER_PATH = os.getenv('EXPLAINER_PATH', './model/shap_explainer.pkl')
# Update this line in model_explainer.py
DATASET_PATH = os.getenv('DATASET_PATH', 'C://Users//DELL//OneDrive//Desktop//Mini Project//dataset//heart.csv')

# Feature names
feature_names = [
    'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg',
    'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal'
]

def create_shap_explainer():
    """
    Create and save a SHAP explainer for the model
    """
    try:
        # Load model and scaler
        logger.info(f"Loading model from {MODEL_PATH}")
        model = joblib.load(MODEL_PATH)
        
        logger.info(f"Loading scaler from {SCALER_PATH}")
        scaler = joblib.load(SCALER_PATH)
        
        # Load a sample of the dataset for the explainer
        logger.info(f"Loading dataset from {DATASET_PATH}")
        data = pd.read_csv(DATASET_PATH)
        X = data.drop('target', axis=1) if 'target' in data.columns else data
        
        # Scale the data
        X_scaled = scaler.transform(X)
        
        # Create a background dataset for SHAP (using a sample for efficiency)
        background_data = shap.sample(X_scaled, 100)
        
        # Create the SHAP explainer
        logger.info("Creating SHAP explainer")
        
        # For tree-based models like Random Forest
        if hasattr(model, 'estimators_') and hasattr(model.estimators_[0], 'feature_importances_'):
            explainer = shap.TreeExplainer(model)
        # For other models
        else:
            explainer = shap.KernelExplainer(model.predict_proba, background_data)
        
        # Save the explainer
        os.makedirs(os.path.dirname(EXPLAINER_PATH), exist_ok=True)
        logger.info(f"Saving SHAP explainer to {EXPLAINER_PATH}")
        joblib.dump(explainer, EXPLAINER_PATH)
        
        return explainer
        
    except Exception as e:
        logger.error(f"Error creating SHAP explainer: {e}")
        raise

def get_shap_values(input_data):
    """
    Get SHAP values for a specific input
    
    Args:
        input_data: Scaled input data for prediction
        
    Returns:
        Dictionary with SHAP values and base value
    """
    try:
        # Load the explainer
        explainer = joblib.load(EXPLAINER_PATH)
        
        # Calculate SHAP values
        shap_values = explainer.shap_values(input_data)
        
        # For binary classification, shap_values is a list with two arrays
        # The first array is for class 0, the second for class 1
        if isinstance(shap_values, list) and len(shap_values) == 2:
            shap_values = shap_values[1]  # We're interested in class 1 (heart disease)
        
        # Create a dictionary with feature names and SHAP values
        shap_dict = {
            'base_value': explainer.expected_value if not isinstance(explainer.expected_value, list) 
                         else explainer.expected_value[1],
            'shap_values': [
                {
                    'feature': feature_names[i],
                    'shap_value': float(shap_values[0][i]),
                    'contribution': 'positive' if shap_values[0][i] > 0 else 'negative'
                }
                for i in range(len(feature_names))
            ]
        }
        
        # Sort by absolute SHAP value (descending)
        shap_dict['shap_values'].sort(key=lambda x: abs(x['shap_value']), reverse=True)
        
        return shap_dict
        
    except Exception as e:
        logger.error(f"Error calculating SHAP values: {e}")
        raise

if __name__ == "__main__":
    create_shap_explainer()
