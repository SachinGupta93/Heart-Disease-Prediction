import os

# Flask configuration
DEBUG = True
PORT = 5000
HOST = '0.0.0.0'

# Get the absolute path to the backend directory
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))

# Get the project root directory (one level up from backend)
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)

# Model paths
MODEL_DIR = os.path.join(PROJECT_ROOT, 'model')
RF_MODEL_PATH = os.path.join(MODEL_DIR, 'heart_model.pkl')
NN_MODEL_PATH = os.path.join(MODEL_DIR, 'nn_model.pkl')
SCALER_PATH = os.path.join(MODEL_DIR, 'scaler.pkl')
SCALER_NN_PATH = os.path.join(MODEL_DIR, 'scaler_nn.pkl')

# Dataset paths
DATASET_DIR = os.path.join(PROJECT_ROOT, 'dataset')
DATASET_PATH = os.path.join(DATASET_DIR, 'heart.csv')

# Logging configuration
LOG_DIR = os.path.join(BACKEND_DIR, 'logs')
os.makedirs(LOG_DIR, exist_ok=True)  # Create logs directory if it doesn't exist
LOG_LEVEL = 'INFO'
LOG_FILE = os.path.join(LOG_DIR, 'app.log')
