import numpy as np
import pandas as pd
import joblib
import shap
import logging
import os
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Get the current directory for absolute paths
current_dir = os.path.dirname(os.path.abspath(__file__))

# Get paths from environment variables or use defaults with absolute paths
MODEL_PATH = os.getenv('MODEL_PATH', os.path.join(current_dir, 'model', 'heart_model.pkl'))
SCALER_PATH = os.getenv('SCALER_PATH', os.path.join(current_dir, 'model', 'scaler.pkl'))
NN_MODEL_PATH = os.getenv('NN_MODEL_PATH', os.path.join(current_dir, 'model', 'nn_model.pkl'))
EXPLAINER_PATH = os.getenv('EXPLAINER_PATH', os.path.join(current_dir, 'model', 'shap_explainer.pkl'))
DATASET_PATH = os.getenv('DATASET_PATH', os.path.join(current_dir, 'dataset', 'heart.csv'))

# Feature names
feature_names = [
    'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg',
    'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal'
]

# Feature descriptions for human-readable explanations
feature_descriptions = {
    'age': 'Age in years',
    'sex': 'Gender (1 = male, 0 = female)',
    'cp': 'Chest pain type (0-3, where higher values indicate more severe pain)',
    'trestbps': 'Resting blood pressure in mm Hg',
    'chol': 'Serum cholesterol in mg/dl',
    'fbs': 'Fasting blood sugar > 120 mg/dl (1 = true, 0 = false)',
    'restecg': 'Resting electrocardiographic results (0-2)',
    'thalach': 'Maximum heart rate achieved',
    'exang': 'Exercise induced angina (1 = yes, 0 = no)',
    'oldpeak': 'ST depression induced by exercise relative to rest',
    'slope': 'Slope of the peak exercise ST segment (0-2)',
    'ca': 'Number of major vessels colored by fluoroscopy (0-3)',
    'thal': 'Thalassemia (1 = normal; 2 = fixed defect; 3 = reversible defect)'
}

# Normal ranges and risk thresholds for features
feature_ranges = {
    'age': {'low_risk': (18, 45), 'moderate_risk': (45, 65), 'high_risk': (65, 120)},
    'trestbps': {'normal': (90, 120), 'elevated': (120, 130), 'high': (130, 180), 'crisis': (180, 250)},
    'chol': {'optimal': (0, 200), 'borderline': (200, 240), 'high': (240, 500)},
    'thalach': {'low': (60, 100), 'normal': (100, 170), 'high': (170, 220)},
    'oldpeak': {'low_risk': (0, 1), 'moderate_risk': (1, 2), 'high_risk': (2, 10)}
}

# Recommendations based on feature values
feature_recommendations = {
    'age': 'Age is a non-modifiable risk factor. Regular check-ups become increasingly important with age.',
    'sex': 'Men generally have a higher risk of heart disease than women, especially at younger ages.',
    'cp': 'Chest pain should be evaluated by a healthcare professional, especially if severe or frequent.',
    'trestbps': 'Maintain healthy blood pressure through diet, exercise, and medication if prescribed.',
    'chol': 'Lower cholesterol through diet changes, exercise, and medication if prescribed.',
    'fbs': 'Manage blood sugar levels through diet, exercise, and medication if necessary.',
    'restecg': 'Abnormal ECG results should be evaluated by a healthcare professional.',
    'thalach': 'Regular aerobic exercise can improve your maximum heart rate capacity.',
    'exang': 'Exercise-induced angina warrants medical attention and possibly exercise restrictions.',
    'oldpeak': 'ST depression indicates potential heart issues and should be evaluated by a cardiologist.',
    'slope': 'The slope of the ST segment provides information about heart function during stress.',
    'ca': 'Blocked coronary arteries reduce blood flow to the heart and increase heart disease risk.',
    'thal': 'Thalassemia affects heart function and should be managed by a healthcare professional.'
}

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

def get_feature_category(feature, value):
    """
    Determine the category (normal, elevated, etc.) for a feature value
    
    Args:
        feature: Feature name
        value: Feature value
        
    Returns:
        Category string or None if not applicable
    """
    if feature not in feature_ranges:
        return None
        
    for category, (min_val, max_val) in feature_ranges[feature].items():
        if min_val <= value < max_val:
            return category
            
    return None

def get_personalized_recommendation(feature, value, shap_value):
    """
    Generate a personalized recommendation based on feature value and SHAP value
    
    Args:
        feature: Feature name
        value: Feature value
        shap_value: SHAP value for this feature
        
    Returns:
        Personalized recommendation string
    """
    base_recommendation = feature_recommendations.get(feature, "No specific recommendation available.")
    
    # If SHAP value is negligible, the feature isn't important for this prediction
    if abs(shap_value) < 0.01:
        return f"This factor has minimal impact on your heart disease risk prediction."
        
    # For important features with high SHAP values
    if shap_value > 0.1:  # Significant positive contribution to risk
        if feature == 'age':
            return f"Your age ({value} years) increases your heart disease risk. {base_recommendation}"
        elif feature == 'sex':
            gender = "male" if value == 1 else "female"
            return f"Being {gender} {'increases' if gender == 'male' else 'decreases'} your risk. {base_recommendation}"
        elif feature == 'trestbps':
            category = get_feature_category(feature, value)
            if category in ['high', 'crisis']:
                return f"Your blood pressure ({value} mm Hg) is {category} and significantly increases your heart disease risk. Consider lifestyle changes and consult a healthcare professional."
            return f"Your blood pressure is {category}. {base_recommendation}"
        elif feature == 'chol':
            category = get_feature_category(feature, value)
            if category in ['high', 'borderline']:
                return f"Your cholesterol level ({value} mg/dl) is {category} and contributes to your risk. Consider dietary changes, exercise, and possibly medication."
            return f"Your cholesterol level is {category}. {base_recommendation}"
        else:
            return f"This factor significantly increases your heart disease risk. {base_recommendation}"
    
    # For features with negative SHAP values (reducing risk)
    elif shap_value < -0.1:
        if feature == 'thalach':
            return f"Your maximum heart rate ({value}) is helping reduce your risk. Continue maintaining good cardiovascular fitness."
        else:
            return f"This factor is helping reduce your heart disease risk. {base_recommendation}"
    
    # For features with moderate impact
    else:
        return base_recommendation

def get_shap_values(input_data, original_values=None):
    """
    Get SHAP values for a specific input and generate personalized explanations
    
    Args:
        input_data: Scaled input data for prediction
        original_values: Original (unscaled) values for better interpretability
        
    Returns:
        Dictionary with SHAP values, base value, and personalized explanations
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
        
        # Get base value (expected value)
        base_value = explainer.expected_value if not isinstance(explainer.expected_value, list) else explainer.expected_value[1]
        
        # Calculate total SHAP value (sum of all SHAP values)
        total_shap = sum(shap_values[0])
        
        # Create a list to store feature data
        features_data = []
        
        # Process each feature
        for i, feature in enumerate(feature_names):
            shap_value = float(shap_values[0][i])
            original_value = original_values[i] if original_values is not None else None
            
            feature_data = {
                'feature': feature,
                'feature_display_name': feature.replace('_', ' ').title(),
                'description': feature_descriptions.get(feature, ""),
                'value': original_value,
                'shap_value': shap_value,
                'relative_contribution': shap_value / (total_shap if total_shap != 0 else 1) * 100,
                'contribution_type': 'increases risk' if shap_value > 0 else 'decreases risk',
                'recommendation': get_personalized_recommendation(feature, original_value, shap_value) if original_value is not None else feature_recommendations.get(feature, "")
            }
            
            features_data.append(feature_data)
        
        # Sort by absolute SHAP value (descending)
        features_data.sort(key=lambda x: abs(x['shap_value']), reverse=True)
        
        # Get top positive and negative contributors
        top_positive = [f for f in features_data if f['shap_value'] > 0][:3]
        top_negative = [f for f in features_data if f['shap_value'] < 0][:3]
        
        # Generate summary explanation
        summary = "Based on our analysis, "
        
        if top_positive:
            summary += f"the main factors increasing your heart disease risk are: "
            summary += ", ".join([f"{f['feature_display_name']}" for f in top_positive])
            summary += ". "
        
        if top_negative:
            summary += f"The main factors decreasing your risk are: "
            summary += ", ".join([f"{f['feature_display_name']}" for f in top_negative])
            summary += ". "
            
        # Calculate prediction (logit) from base value and SHAP values
        prediction_logit = base_value + total_shap
        
        # Convert logit to probability using sigmoid function
        prediction_probability = 1 / (1 + np.exp(-prediction_logit))
        
        # Create the full response object
        response = {
            'base_value': float(base_value),
            'total_shap_value': float(total_shap),
            'prediction_probability': float(prediction_probability),
            'summary': summary,
            'features': features_data,
            'top_positive_contributors': top_positive,
            'top_negative_contributors': top_negative
        }
        
        return response
        
    except Exception as e:
        logger.error(f"Error calculating SHAP values: {e}")
        raise

if __name__ == "__main__":
    create_shap_explainer()
