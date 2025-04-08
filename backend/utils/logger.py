import os
import logging
from logging.handlers import RotatingFileHandler
import sys
from datetime import datetime
from backend.config import LOG_DIR, LOG_LEVEL

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
