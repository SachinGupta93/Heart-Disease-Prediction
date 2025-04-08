import joblib
import numpy as np
import pandas as pd

# Load the Random Forest model (which has feature_importances_)
model = joblib.load("model/heart_model.pkl")

# Feature names
feature_names = [
    'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg',
    'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal'
]

def get_feature_importance():
    """
    Extract feature importance from the Random Forest model
    """
    importances = model.feature_importances_
    
    # Sort features by importance
    indices = np.argsort(importances)[::-1]
    
    # Create a list of feature importance data
    importance_data = []
    for i in indices:
        importance_data.append({
            "feature": feature_names[i],
            "importance": float(importances[i]),
            "description": get_feature_description(feature_names[i])
        })
    
    return importance_data

def get_feature_description(feature):
    """
    Return a human-readable description of each feature
    """
    descriptions = {
        'age': 'Patient age in years',
        'sex': 'Gender (0 = female, 1 = male)',
        'cp': 'Chest pain type (0-3)',
        'trestbps': 'Resting blood pressure (mm Hg)',
        'chol': 'Serum cholesterol (mg/dl)',
        'fbs': 'Fasting blood sugar > 120 mg/dl (1 = true, 0 = false)',
        'restecg': 'Resting electrocardiographic results (0-2)',
        'thalach': 'Maximum heart rate achieved',
        'exang': 'Exercise induced angina (1 = yes, 0 = no)',
        'oldpeak': 'ST depression induced by exercise',
        'slope': 'Slope of the peak exercise ST segment (0-2)',
        'ca': 'Number of major vessels colored by fluoroscopy (0-3)',
        'thal': 'Thalassemia (1-3)'
    }
    return descriptions.get(feature, "No description available")
