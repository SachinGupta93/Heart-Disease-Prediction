import numpy as np
from backend.utils.logger import get_logger

logger = get_logger()

def prepare_input_data(input_data):
    """
    Prepare input data for prediction
    """
    try:
        # Convert input data to correct format
        features = [
            float(input_data['age']),
            float(input_data['sex']),
            float(input_data['cp']),
            float(input_data['trestbps']),
            float(input_data['chol']),
            float(input_data['fbs']),
            float(input_data['restecg']),
            float(input_data['thalach']),
            float(input_data['exang']),
            float(input_data['oldpeak']),
            float(input_data['slope']),
            float(input_data['ca']),
            float(input_data['thal'])
        ]
        return np.array(features).reshape(1, -1)
    except KeyError as e:
        logger.error(f"Missing key in input data: {e}")
        raise ValueError(f"Missing required field: {e}")
    except ValueError as e:
        logger.error(f"Invalid value in input data: {e}")
        raise ValueError(f"Invalid value: {e}")
    except Exception as e:
        logger.error(f"Error preparing input data: {e}")
        raise
