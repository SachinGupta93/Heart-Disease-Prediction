import pandas as pd
import numpy as np
import joblib
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

from config import DATASET_PATH, NN_MODEL_PATH, SCALER_NN_PATH
from utils.logger import get_logger

logger = get_logger()

def train_neural_network():
    """
    Train a neural network model for heart disease prediction using scikit-learn's MLPClassifier
    
    This implementation uses scikit-learn's MLPClassifier and saves the model as a pickle file.
    This is different from the TensorFlow implementation in neural_network_model.py which
    uses TensorFlow's native format.
    
    Returns:
        tuple: (model, scaler) - The trained scikit-learn MLPClassifier model and its scaler
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
        
        # Train the neural network
        logger.info("Training scikit-learn MLPClassifier neural network model")
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
        
        nn_model.fit(X_train_scaled, y_train)
        
        # Evaluate the model
        y_pred = nn_model.predict(X_test_scaled)
        accuracy = accuracy_score(y_test, y_pred)
        logger.info(f"Scikit-learn Neural Network accuracy: {accuracy:.4f}")
        
        # Print classification report
        report = classification_report(y_test, y_pred)
        logger.info(f"Classification report:\n{report}")
        
        # Print confusion matrix
        cm = confusion_matrix(y_test, y_pred)
        logger.info(f"Confusion matrix:\n{cm}")
        
        # Save the model and scaler
        logger.info(f"Saving scikit-learn neural network model to {NN_MODEL_PATH}")
        joblib.dump(nn_model, NN_MODEL_PATH)
        
        logger.info(f"Saving scikit-learn neural network scaler to {SCALER_NN_PATH}")
        joblib.dump(scaler, SCALER_NN_PATH)
        
        logger.info("Scikit-learn neural network model training completed successfully")
        
        return nn_model, scaler
        
    except Exception as e:
        logger.error(f"Error training scikit-learn neural network model: {e}")
        raise

def load_sklearn_nn_model():
    """
    Load the scikit-learn neural network model and its scaler
    
    Returns:
        tuple: (model, scaler) - The loaded scikit-learn neural network model and its scaler
    """
    try:
        # Load the model
        nn_model = joblib.load(NN_MODEL_PATH)
        
        # Load the scaler
        scaler = joblib.load(SCALER_NN_PATH)
        
        return nn_model, scaler
    except Exception as e:
        logger.error(f"Error loading scikit-learn neural network model: {e}")
        raise

if __name__ == "__main__":
    train_neural_network()
