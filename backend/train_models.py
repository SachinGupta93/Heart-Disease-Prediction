import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report
from utils.logger import get_logger

logger = get_logger()

def train_models():
    """
    Train all models: RandomForest, Neural Network, Logistic Regression, SVM, and Ensemble
    """
    try:
        # Define model directory within the backend folder
        BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
        MODEL_DIR = os.path.join(BACKEND_DIR, 'model')
        
        # Define model paths
        RF_MODEL_PATH = os.path.join(MODEL_DIR, 'heart_model.pkl')
        NN_MODEL_PATH = os.path.join(MODEL_DIR, 'nn_model.pkl')
        LR_MODEL_PATH = os.path.join(MODEL_DIR, 'lr_model.pkl')
        SVM_MODEL_PATH = os.path.join(MODEL_DIR, 'svm_model.pkl')
        ENSEMBLE_MODEL_PATH = os.path.join(MODEL_DIR, 'ensemble_model.pkl')
        SCALER_PATH = os.path.join(MODEL_DIR, 'scaler.pkl')
        SCALER_NN_PATH = os.path.join(MODEL_DIR, 'scaler_nn.pkl')
        
        # Define dataset path
        DATASET_PATH = os.path.join(BACKEND_DIR, 'dataset', 'heart.csv')
        
        # Create model directory if it doesn't exist
        os.makedirs(MODEL_DIR, exist_ok=True)
        
        # Load the dataset
        logger.info(f"Loading dataset from {DATASET_PATH}")
        data = pd.read_csv(DATASET_PATH)
        
        # Split features and target
        X = data.drop('target', axis=1)
        y = data['target']
        
        # Split the data into training and testing sets
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Scale the features (we'll use the same scaler for most models except NN)
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Train RandomForest model
        logger.info("Training RandomForest model")
        rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
        rf_model.fit(X_train_scaled, y_train)
        
        # Evaluate RandomForest model
        rf_pred = rf_model.predict(X_test_scaled)
        rf_accuracy = accuracy_score(y_test, rf_pred)
        logger.info(f"RandomForest accuracy: {rf_accuracy:.4f}")
        logger.info(f"RandomForest classification report:\n{classification_report(y_test, rf_pred)}")
        
        # Save RandomForest model and scaler
        logger.info(f"Saving RandomForest model to {RF_MODEL_PATH}")
        joblib.dump(rf_model, RF_MODEL_PATH)
        
        # Train Neural Network model
        logger.info("Training Neural Network model")
        
        # Scale the features for Neural Network (separate scaler for NN)
        nn_scaler = StandardScaler()
        X_train_nn_scaled = nn_scaler.fit_transform(X_train)
        X_test_nn_scaled = nn_scaler.transform(X_test)
        
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
        
        nn_model.fit(X_train_nn_scaled, y_train)
        
        # Evaluate Neural Network model
        nn_pred = nn_model.predict(X_test_nn_scaled)
        nn_accuracy = accuracy_score(y_test, nn_pred)
        logger.info(f"Neural Network accuracy: {nn_accuracy:.4f}")
        logger.info(f"Neural Network classification report:\n{classification_report(y_test, nn_pred)}")
        
        # Save Neural Network model and scaler
        logger.info(f"Saving Neural Network model to {NN_MODEL_PATH}")
        joblib.dump(nn_model, NN_MODEL_PATH)
        
        logger.info(f"Saving Neural Network scaler to {SCALER_NN_PATH}")
        joblib.dump(nn_scaler, SCALER_NN_PATH)
        
        # Train Logistic Regression model
        logger.info("Training Logistic Regression model")
        lr_model = LogisticRegression(max_iter=1000, random_state=42)
        lr_model.fit(X_train_scaled, y_train)
        
        # Evaluate Logistic Regression model
        lr_pred = lr_model.predict(X_test_scaled)
        lr_accuracy = accuracy_score(y_test, lr_pred)
        logger.info(f"Logistic Regression accuracy: {lr_accuracy:.4f}")
        logger.info(f"Logistic Regression classification report:\n{classification_report(y_test, lr_pred)}")
        
        # Save Logistic Regression model
        logger.info(f"Saving Logistic Regression model to {LR_MODEL_PATH}")
        joblib.dump(lr_model, LR_MODEL_PATH)
        
        # Train SVM model
        logger.info("Training SVM model")
        svm_model = SVC(probability=True, random_state=42)
        svm_model.fit(X_train_scaled, y_train)
        
        # Evaluate SVM model
        svm_pred = svm_model.predict(X_test_scaled)
        svm_accuracy = accuracy_score(y_test, svm_pred)
        logger.info(f"SVM accuracy: {svm_accuracy:.4f}")
        logger.info(f"SVM classification report:\n{classification_report(y_test, svm_pred)}")
        
        # Save SVM model
        logger.info(f"Saving SVM model to {SVM_MODEL_PATH}")
        joblib.dump(svm_model, SVM_MODEL_PATH)
        
        # Train Ensemble model
        logger.info("Training Ensemble model")
        ensemble_model = VotingClassifier(
            estimators=[
                ('rf', rf_model),
                ('lr', lr_model),
                ('svm', svm_model),
                ('nn', nn_model)
            ],
            voting='soft'  # Use probabilities for prediction
        )
        
        ensemble_model.fit(X_train_scaled, y_train)
        
        # Evaluate Ensemble model
        ensemble_pred = ensemble_model.predict(X_test_scaled)
        ensemble_accuracy = accuracy_score(y_test, ensemble_pred)
        logger.info(f"Ensemble accuracy: {ensemble_accuracy:.4f}")
        logger.info(f"Ensemble classification report:\n{classification_report(y_test, ensemble_pred)}")
        
        # Save Ensemble model
        logger.info(f"Saving Ensemble model to {ENSEMBLE_MODEL_PATH}")
        joblib.dump(ensemble_model, ENSEMBLE_MODEL_PATH)
        
        # Save main scaler (used for RF, LR, SVM, and Ensemble)
        logger.info(f"Saving main scaler to {SCALER_PATH}")
        joblib.dump(scaler, SCALER_PATH)
        
        logger.info("All models trained successfully")
        
        # Return the paths for reference
        return {
            'rf_model_path': RF_MODEL_PATH,
            'nn_model_path': NN_MODEL_PATH,
            'lr_model_path': LR_MODEL_PATH,
            'svm_model_path': SVM_MODEL_PATH,
            'ensemble_model_path': ENSEMBLE_MODEL_PATH,
            'main_scaler_path': SCALER_PATH,
            'nn_scaler_path': SCALER_NN_PATH
        }
        
    except Exception as e:
        logger.error(f"Error training models: {e}")
        raise

if __name__ == "__main__":
    paths = train_models()
    print("Models saved at:")
    for key, path in paths.items():
        print(f"{key}: {path}")
