import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import MLPClassifier
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import os
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Dataset path - update this to your dataset location
DATASET_PATH = './data/heart_disease_dataset.csv'
ENSEMBLE_MODEL_PATH = './model/ensemble_model.pkl'
SCALER_PATH = './model/scaler.pkl'

def train_ensemble_model():
    """
    Train an ensemble model combining Random Forest, Logistic Regression, SVM, and Neural Network
    """
    try:
        # Load the dataset
        logger.info(f"Loading dataset from {DATASET_PATH}")
        data = pd.read_csv(DATASET_PATH)
        
        # Split features and target
        X = data.drop('target', axis=1)
        y = data['target']
        
        # Split the data into training and testing sets
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Scale the features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Initialize individual models
        logger.info("Initializing individual models")
        rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
        lr_model = LogisticRegression(max_iter=1000, random_state=42)
        svm_model = SVC(probability=True, random_state=42)
        nn_model = MLPClassifier(
            hidden_layer_sizes=(64, 32, 16),
            activation='relu',
            solver='adam',
            alpha=0.0001,
            batch_size=32,
            learning_rate='adaptive',
            max_iter=1000,
            random_state=42
        )
        
        # Create the ensemble model using VotingClassifier
        logger.info("Creating ensemble model")
        ensemble_model = VotingClassifier(
            estimators=[
                ('rf', rf_model),
                ('lr', lr_model),
                ('svm', svm_model),
                ('nn', nn_model)
            ],
            voting='soft'  # Use probabilities for prediction
        )
        
        # Train the ensemble model
        logger.info("Training ensemble model")
        ensemble_model.fit(X_train_scaled, y_train)
        
        # Evaluate the model
        y_pred = ensemble_model.predict(X_test_scaled)
        accuracy = accuracy_score(y_test, y_pred)
        logger.info(f"Ensemble model accuracy: {accuracy:.4f}")
        
        # Print classification report
        report = classification_report(y_test, y_pred)
        logger.info(f"Classification report:\n{report}")
        
        # Print confusion matrix
        cm = confusion_matrix(y_test, y_pred)
        logger.info(f"Confusion matrix:\n{cm}")
        
        # Save the model and scaler
        os.makedirs(os.path.dirname(ENSEMBLE_MODEL_PATH), exist_ok=True)
        logger.info(f"Saving ensemble model to {ENSEMBLE_MODEL_PATH}")
        joblib.dump(ensemble_model, ENSEMBLE_MODEL_PATH)
        
        logger.info(f"Saving scaler to {SCALER_PATH}")
        joblib.dump(scaler, SCALER_PATH)
        
        return ensemble_model, scaler
        
    except Exception as e:
        logger.error(f"Error training ensemble model: {e}")
        raise

if __name__ == "__main__":
    train_ensemble_model()
import numpy as np
import pandas as pd
import joblib
import shap
import logging
import os

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Paths
ENSEMBLE_MODEL_PATH = './model/ensemble_model.pkl'
SCALER_PATH = './model/scaler.pkl'
EXPLAINER_PATH = './model/shap_explainer.pkl'
DATASET_PATH = './data/heart_disease_dataset.csv'

# Feature names
feature_names = [
    'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg',
    'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal'
]

def create_shap_explainer():
    """
    Create and save a SHAP explainer for the ensemble model
    """
    try:
        # Load model and scaler
        logger.info(f"Loading model from {ENSEMBLE_MODEL_PATH}")
        model = joblib.load(ENSEMBLE_MODEL_PATH)
        
        logger.info(f"Loading scaler from {SCALER_PATH}")
        scaler = joblib.load(SCALER_PATH)
        
        # Load a sample of the dataset for the explainer
        logger.info(f"Loading dataset from {DATASET_PATH}")
        data = pd.read_csv(DATASET_PATH)
        X = data.drop('target', axis=1)
        
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
