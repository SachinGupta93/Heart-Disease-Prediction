import os
import logging
from logging.handlers import RotatingFileHandler
import sys
from datetime import datetime
from backend.config import LOG_DIR, LOG_LEVEL

def setup_logger(name, log_file, level=logging.INFO):
    """Function to set up a logger with file and console handlers
    
    Args:
        name (str): Name of the logger
        log_file (str): Path to the log file
        level (int, optional): Logging level. Defaults to logging.INFO.
        
    Returns:
        logging.Logger: Configured logger instance
    """
    # Create logs directory if it doesn't exist
    os.makedirs(os.path.dirname(log_file), exist_ok=True)
    
    # Create formatter
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    
    # Create file handler
    file_handler = RotatingFileHandler(log_file, maxBytes=10485760, backupCount=5)
    file_handler.setFormatter(formatter)
    
    # Create console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    
    # Get logger
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Add handlers if they don't exist
    if not logger.handlers:
        logger.addHandler(file_handler)
        logger.addHandler(console_handler)
    
    return logger

# Set up logger
logger = logging.getLogger('heart_disease_prediction')
logger.setLevel(getattr(logging, LOG_LEVEL))

# Create formatter
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# Create console handler
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

# Create file handler
log_file = os.path.join(LOG_DIR, f'app_{datetime.now().strftime("%Y%m%d")}.log')
file_handler = RotatingFileHandler(log_file, maxBytes=10485760, backupCount=5)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

def get_logger():
    return logger
