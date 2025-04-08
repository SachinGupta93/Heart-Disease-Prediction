from backend.utils.logger import get_logger

logger = get_logger()

def validate_input(data):
    """
    Validate the input data for prediction
    """
    required_fields = [
        'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg',
        'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal'
    ]
    
    # Check if all required fields are present
    for field in required_fields:
        if field not in data:
            logger.error(f"Missing required field: {field}")
            return False, f"Missing required field: {field}"
    
    # Validate age (typically between 20-100)
    try:
        age = float(data['age'])
        if not (20 <= age <= 100):
            logger.error(f"Invalid age value: {data['age']}")
            return False, "Age should be between 20 and 100"
    except ValueError:
        return False, "Age must be a number"
    
    # Add more validations as needed
    
    logger.info("Input validation successful")
    return True, "Validation successful"
