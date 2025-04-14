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
        
        # Configure the model for concise responses
        model = genai.GenerativeModel(
            model_name=GEMINI_MODEL,
            generation_config={
                "temperature": 0.5,  # Lower for focused answers
                "top_k": GEMINI_CONFIG.get("top_k", 40),
                "top_p": 0.8,  # Slightly lower for less variability
                "max_output_tokens": 150,  # Cap at ~150 tokens (~100-150 words)
            },
            safety_settings=safety_settings
        )
        
        # Generate content
        response = model.generate_content(prompt)
        
        # Extract and return the text response
        if response.text:
            logger.info("Successfully generated response from Gemini")
            return response.text.strip()
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
    # Simplified prompt for concise advice
    prompt = f"""
    Patient health data:
    - Age: {health_data.get('age', 'N/A')}
    - Sex: {'Male' if health_data.get('sex') == 1 else 'Female'}
    - Resting BP: {health_data.get('trestbps', 'N/A')} mm Hg
    - Cholesterol: {health_data.get('chol', 'N/A')} mg/dl
    - Fasting Blood Sugar > 120 mg/dl: {'Yes' if health_data.get('fbs') == 1 else 'No'}
    - Max Heart Rate: {health_data.get('thalach', 'N/A')}
    - Exercise Angina: {'Yes' if health_data.get('exang') == 1 else 'No'}
    - Prediction: {'High' if health_data.get('prediction') == 1 else 'Low'} risk of heart disease

    Provide brief health advice:
    - 1-2 key observations about the metrics
    - 1-2 lifestyle tips
    - When to see a doctor
    Use short sentences and bullet points. Keep it under 100 words.
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
    # Determine if health data is available
    has_health_data = health_data and any(health_data.values())
    
    # Updated app context
    app_context = """
You’re a medical AI assistant with expertise in all kinds of health topics—heart disease, diabetes, mental health, you name it. Give accurate, easy-to-understand answers, and always tell users to check with a doctor for personal advice.
"""
    
    # Health data context
    health_context = ""
    if has_health_data:
        health_context = f"""
User health data:
- Age: {health_data.get('age', 'N/A')}
- Sex: {'Male' if health_data.get('sex') == 1 else 'Female'}
- Chest Pain Type: {health_data.get('cp', 'N/A')}
- Resting BP: {health_data.get('trestbps', 'N/A')} mm Hg
- Cholesterol: {health_data.get('chol', 'N/A')} mg/dl
- Fasting Blood Sugar > 120 mg/dl: {'Yes' if health_data.get('fbs') == 1 else 'No'}
- Resting ECG: {health_data.get('restecg', 'N/A')}
- Max Heart Rate: {health_data.get('thalach', 'N/A')}
- Exercise Angina: {'Yes' if health_data.get('exang') == 1 else 'No'}
- ST Depression: {health_data.get('oldpeak', 'N/A')}
- Slope: {health_data.get('slope', 'N/A')}
- Major Vessels: {health_data.get('ca', 'N/A')}
- Thalassemia: {health_data.get('thal', 'N/A')}
- Prediction: {'High' if health_data.get('prediction') == 1 else 'Low'} risk
"""
    else:
        health_context = "No user health data provided."
    
    # Prompt with brevity emphasis
    prompt = f"""
{app_context}

{health_context}

User question: "{question}"

Answer in 2-3 short sentences or a few bullet points (under 100 words). Use clear, non-expert language. For medical questions, note that users should consult a doctor for professional advice. Stay focused on the Neural Network model and provided data.
"""
    
    return get_gemini_response(prompt)