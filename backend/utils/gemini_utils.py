import os
import google.generativeai as genai
from backend.config import GEMINI_API_KEY, GEMINI_MODEL, GEMINI_CONFIG, LOG_DIR
from backend.utils.logger import setup_logger
from datetime import datetime

# Set up logger
log_file = os.path.join(LOG_DIR, f'gemini_{datetime.now().strftime("%Y%m%d")}.log')
logger = setup_logger(__name__, log_file)

def initialize_gemini():
    """Initialize Gemini API with API key from configuration."""
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        logger.info("Gemini API initialized successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize Gemini API: {str(e)}")
        return False

def get_gemini_response(prompt, safety_settings=None):
    """
    Get a response from Gemini model.
    
    Args:
        prompt (str): The prompt to send to Gemini
        safety_settings (list, optional): Safety settings for content filtering
        
    Returns:
        str: The generated response or error message
    """
    if not GEMINI_API_KEY:
        logger.warning("Gemini API key not found in configuration")
        return "Gemini API key is not configured."
    
    try:
        # Initialize the API if not done already
        initialize_gemini()
        
        # Configure the model
        model = genai.GenerativeModel(
            model_name=GEMINI_MODEL,
            generation_config={
                "temperature": GEMINI_CONFIG.get("temperature", 0.7),
                "top_k": GEMINI_CONFIG.get("top_k", 40),
                "top_p": GEMINI_CONFIG.get("top_p", 0.95),
                "max_output_tokens": GEMINI_CONFIG.get("max_output_tokens", 1024),
            },
            safety_settings=safety_settings
        )
        
        # Generate content
        response = model.generate_content(prompt)
        
        # Extract and return the text response
        if response.text:
            logger.info("Successfully generated response from Gemini")
            return response.text
        else:
            logger.warning("Received empty response from Gemini")
            return "No response generated from the AI model."
            
    except Exception as e:
        error_message = f"Error generating content with Gemini: {str(e)}"
        logger.error(error_message)
        return f"An error occurred: {str(e)}"

def get_health_advice(health_data):
    """
    Get personalized health advice based on user health data.
    
    Args:
        health_data (dict): User health metrics and prediction results
        
    Returns:
        str: Personalized health advice
    """
    # Construct a prompt based on the health data
    prompt = f"""
    I have the following health information for a patient:
    - Age: {health_data.get('age', 'N/A')}
    - Sex: {'Male' if health_data.get('sex') == 1 else 'Female'}
    - Chest Pain Type: {health_data.get('cp', 'N/A')}
    - Resting Blood Pressure: {health_data.get('trestbps', 'N/A')} mm Hg
    - Cholesterol: {health_data.get('chol', 'N/A')} mg/dl
    - Fasting Blood Sugar > 120 mg/dl: {'Yes' if health_data.get('fbs') == 1 else 'No'}
    - Resting ECG: {health_data.get('restecg', 'N/A')}
    - Maximum Heart Rate: {health_data.get('thalach', 'N/A')}
    - Exercise Induced Angina: {'Yes' if health_data.get('exang') == 1 else 'No'}
    - ST Depression: {health_data.get('oldpeak', 'N/A')}
    - Slope of Peak Exercise ST Segment: {health_data.get('slope', 'N/A')}
    - Number of Major Vessels: {health_data.get('ca', 'N/A')}
    - Thalassemia: {health_data.get('thal', 'N/A')}
    
    The prediction model indicates {'a high' if health_data.get('prediction') == 1 else 'a low'} risk 
    of heart disease for this patient.
    
    Please provide:
    1. A concise analysis of these health metrics
    2. Personalized lifestyle and health recommendations
    3. Potential warning signs they should be aware of
    4. When they should consider consulting a healthcare professional
    
    Format the response in clear, patient-friendly language with bullet points where appropriate.
    """
    
    return get_gemini_response(prompt)

def answer_health_question(question, health_data=None):
    """
    Answer a general health question using Gemini AI.
    
    Args:
        question (str): The user's question about heart health or the app
        health_data (dict, optional): User health metrics for context
        
    Returns:
        str: AI response to the question
    """
    # Determine if health data is available to provide context
    has_health_data = health_data and any(health_data.values())
    
    # Base context about the application
    app_context = """
You are an AI assistant for a Heart Disease Prediction system powered by a Multi-Layer Perceptron (MLP) Neural Network. The system predicts the likelihood of heart disease (binary outcome: 0 = no disease, 1 = disease) using the UCI Heart Disease dataset, which includes 13 clinical features: age, sex, chest pain type, resting blood pressure, cholesterol, fasting blood sugar, resting ECG, maximum heart rate, exercise-induced angina, ST depression, slope of peak exercise ST segment, number of major vessels, and thalassemia. The model is trained to capture complex, nonlinear patterns in these features to provide accurate risk assessments. Your role is to:
- Answer questions about heart disease risk, the model’s predictions, or general heart health.
- Use patient-friendly language and include disclaimers that users should consult healthcare professionals for medical advice.
- Base responses on the provided health data (if any) and the model’s context.
- Avoid referencing web app features, visualizations, or other machine learning models unless asked.
"""
    
    # Add health data context if available
    health_context = ""
    if has_health_data:
        health_context = f"""
        The user has the following health information:
        - Age: {health_data.get('age', 'N/A')}
        - Sex: {'Male' if health_data.get('sex') == 1 else 'Female'}
        - Chest Pain Type: {health_data.get('cp', 'N/A')}
        - Resting Blood Pressure: {health_data.get('trestbps', 'N/A')} mm Hg
        - Cholesterol: {health_data.get('chol', 'N/A')} mg/dl
        - Fasting Blood Sugar > 120 mg/dl: {'Yes' if health_data.get('fbs') == 1 else 'No'}
        - Resting ECG: {health_data.get('restecg', 'N/A')}
        - Maximum Heart Rate: {health_data.get('thalach', 'N/A')}
        - Exercise Induced Angina: {'Yes' if health_data.get('exang') == 1 else 'No'}
        - ST Depression: {health_data.get('oldpeak', 'N/A')}
        - Slope of Peak Exercise ST Segment: {health_data.get('slope', 'N/A')}
        - Number of Major Vessels: {health_data.get('ca', 'N/A')}
        - Thalassemia: {health_data.get('thal', 'N/A')}
        - Current prediction: {'High' if health_data.get('prediction') == 1 else 'Low'} risk of heart disease
        """
    else:
        health_context = "No specific health data provided by the user."
    
    # Construct the prompt with the user's question
    prompt = f"""
    {app_context}

    {health_context}

    The user asks: "{question}"

    Provide a concise, accurate response strictly based on the system’s context and health data (if provided). Use simple, clear language suitable for non-experts. For medical questions, emphasize that the information is not a substitute for professional medical advice and recommend consulting a doctor when appropriate. Use bullet points for clarity where relevant.
    """
        
    return get_gemini_response(prompt)