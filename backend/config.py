import os
from dotenv import load_dotenv

# Load environment variables from .env file if present
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)

# Flask configuration
DEBUG = True
PORT = 5000
HOST = '0.0.0.0'

# Get the absolute path to the backend directory
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))

# Get the project root directory (one level up from backend)
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)

# Model paths
MODEL_DIR = os.path.join(BACKEND_DIR, 'model')
RF_MODEL_PATH = os.path.join(MODEL_DIR, 'heart_model.pkl')
NN_MODEL_PATH = os.path.join(MODEL_DIR, 'nn_model.pkl')
SCALER_PATH = os.path.join(MODEL_DIR, 'scaler.pkl')
SCALER_NN_PATH = os.path.join(MODEL_DIR, 'scaler_nn.pkl')

# Dataset paths
DATASET_DIR = os.path.join(BACKEND_DIR, 'dataset')
DATASET_PATH = os.path.join(DATASET_DIR, 'heart.csv')

# Logging configuration
LOG_DIR = os.path.join(BACKEND_DIR, 'logs')
os.makedirs(LOG_DIR, exist_ok=True)  # Create logs directory if it doesn't exist
LOG_LEVEL = 'INFO'
LOG_FILE = os.path.join(LOG_DIR, 'app.log')

# Database configuration
DB_DIR = os.path.join(BACKEND_DIR, 'instance')
os.makedirs(DB_DIR, exist_ok=True)  # Create db directory if it doesn't exist
SQLALCHEMY_DATABASE_URI = f'sqlite:///{os.path.join(DB_DIR, "heart_disease.db")}'
SQLALCHEMY_TRACK_MODIFICATIONS = False

# Gemini AI Configuration
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY') or os.getenv('VITE_GEMINI_API_KEY', '')
GEMINI_MODEL = os.getenv('GEMINI_MODEL') or os.getenv('VITE_GEMINI_MODEL', 'gemini-1.5-pro')
GEMINI_CONFIG = {
    'temperature': 0.7,
    'top_k': 40,
    'top_p': 0.95,
    'max_output_tokens': 1024
}
