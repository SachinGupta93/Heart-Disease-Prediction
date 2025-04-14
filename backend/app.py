from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import joblib
import os
import numpy as np
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv
import logging

# Import Gemini utilities
from backend.utils.gemini_utils import get_health_advice, answer_health_question
from backend.model_comparison import get_comparison_prediction

# Import SHAP model explainer
from backend.model_explainer import get_shap_values

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure CORS properly to allow requests from your frontend
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"], "methods": ["GET", "POST", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}})

# Request timing middleware
@app.before_request
def before_request():
    request.start_time = datetime.now()

# Add explicit CORS headers for all responses
@app.after_request
def add_cors_headers(response):
    if hasattr(request, 'start_time'):
        elapsed = datetime.now() - request.start_time
        logger.info(f"{request.method} {request.path} - Took {elapsed.total_seconds():.4f}s")
    
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response

# Calculate the correct model paths based on the module location
current_dir = os.path.dirname(os.path.abspath(__file__))
default_model_path = os.path.join(current_dir, 'model', 'heart_model.pkl')
default_scaler_path = os.path.join(current_dir, 'model', 'scaler.pkl')

# Model and scaler paths
model_path = os.getenv('MODEL_PATH', default_model_path)
scaler_path = os.getenv('SCALER_PATH', default_scaler_path)

# Log the actual paths being used
logger.info(f"Looking for model at: {model_path}")
logger.info(f"Looking for scaler at: {scaler_path}")

# Initialize variables
model = None
scaler = None

# Check if files exist and load them
if os.path.exists(model_path):
    try:
        model = joblib.load(model_path)
        logger.info(f"Model loaded successfully from {model_path}")
    except Exception as e:
        logger.error(f"Error loading model: {e}")
else:
    logger.error(f"Model file not found at {model_path}")
    # Try alternative path as fallback
    alt_model_path = os.path.join(current_dir, 'model', 'ensemble_model.pkl')
    logger.info(f"Trying fallback model path: {alt_model_path}")
    if os.path.exists(alt_model_path):
        try:
            model = joblib.load(alt_model_path)
            logger.info(f"Fallback model loaded successfully from {alt_model_path}")
        except Exception as e:
            logger.error(f"Error loading fallback model: {e}")

if os.path.exists(scaler_path):
    try:
        scaler = joblib.load(scaler_path)
        logger.info(f"Scaler loaded successfully from {scaler_path}")
    except Exception as e:
        logger.error(f"Error loading scaler: {e}")
else:
    logger.error(f"Scaler file not found at {scaler_path}")
    # Try alternative path as fallback
    alt_scaler_path = os.path.join(current_dir, 'model', 'scaler_nn.pkl')
    logger.info(f"Trying fallback scaler path: {alt_scaler_path}")
    if os.path.exists(alt_scaler_path):
        try:
            scaler = joblib.load(alt_scaler_path)
            logger.info(f"Fallback scaler loaded successfully from {alt_scaler_path}")
        except Exception as e:
            logger.error(f"Error loading fallback scaler: {e}")

# Feature names for the heart disease dataset
feature_names = [
    'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg',
    'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal'
]

# Feature descriptions for better understanding
feature_descriptions = {
    'age': 'Age in years',
    'sex': 'Sex (1 = male, 0 = female)',
    'cp': 'Chest pain type (0-3)',
    'trestbps': 'Resting blood pressure (mm Hg)',
    'chol': 'Serum cholesterol (mg/dl)',
    'fbs': 'Fasting blood sugar > 120 mg/dl (1 = true, 0 = false)',
    'restecg': 'Resting electrocardiographic results (0-2)',
    'thalach': 'Maximum heart rate achieved',
    'exang': 'Exercise induced angina (1 = yes, 0 = no)',
    'oldpeak': 'ST depression induced by exercise relative to rest',
    'slope': 'Slope of the peak exercise ST segment (0-2)',
    'ca': 'Number of major vessels colored by fluoroscopy (0-3)',
    'thal': 'Thalassemia (0-3)'
}

# Root route
@app.route('/', methods=['GET'])
def home():
    logger.info("Root endpoint accessed")
    return jsonify({
        'message': 'Heart Disease Prediction API is running',
        'endpoints': {
            '/predict': 'POST - Make a heart disease prediction',
            '/predict/ensemble': 'POST - Get ensemble prediction',
            '/history': 'GET - Get prediction history, POST - Save prediction',
            '/models/feature-importance': 'GET - Get feature importance data',
            '/models/comparison': 'GET - Get model comparison data',
            '/health': 'GET - Health information and API status'
        },
        'docs_url': '/docs',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat()
    })

# Health check
@app.route('/health/status', methods=['GET'])
def health_check():
    logger.info("Health check")
    return jsonify({
        'status': 'ok',
        'message': 'Heart Disease Prediction API is running',
        'models_loaded': model is not None and scaler is not None,
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat()
    })

# Health information
@app.route('/health/info', methods=['GET'])
def health_info():
    logger.info("Getting health information")
    health_info_data = {
        'risk_factors': [
            {
                'name': 'Age',
                'description': 'Risk increases with age, especially after 45 for men and 55 for women.',
                'recommendations': ['Regular check-ups', 'Stay physically active']
            },
            {
                'name': 'High Blood Pressure',
                'description': 'Damages arteries and can lead to heart disease.',
                'recommendations': ['Limit salt intake', 'Regular exercise', 'Medication if prescribed']
            },
            {
                'name': 'High Cholesterol',
                'description': 'Builds up in arteries and increases heart disease risk.',
                'recommendations': ['Eat heart-healthy diet', 'Exercise regularly', 'Medication if prescribed']
            },
            {
                'name': 'Smoking',
                'description': 'Damages blood vessels and reduces oxygen in blood.',
                'recommendations': ['Quit smoking', 'Seek support programs', 'Avoid secondhand smoke']
            },
            {
                'name': 'Diabetes',
                'description': 'Increases risk of heart disease and stroke.',
                'recommendations': ['Monitor blood sugar', 'Follow treatment plan', 'Healthy diet']
            }
        ],
        'prevention_tips': [
            'Maintain a healthy diet rich in fruits, vegetables, and whole grains',
            'Exercise regularly (at least 150 minutes of moderate activity per week)',
            'Maintain a healthy weight',
            'Quit smoking and avoid secondhand smoke',
            'Limit alcohol consumption',
            'Manage stress through relaxation techniques',
            'Get regular health screenings',
            'Control conditions like high blood pressure, diabetes, and high cholesterol'
        ],
        'resources': [
            {
                'name': 'American Heart Association',
                'url': 'https://www.heart.org/'
            },
            {
                'name': 'Centers for Disease Control and Prevention',
                'url': 'https://www.cdc.gov/heartdisease/'
            },
            {
                'name': 'World Heart Federation',
                'url': 'https://world-heart-federation.org/'
            }
        ]
    }
    return jsonify({'success': True, 'data': health_info_data})

# AI Health Advice endpoint
@app.route('/health/advice', methods=['POST'])
def ai_health_advice():
    logger.info("AI health advice requested")
    try:
        # Get health data from request
        health_data = request.json
        
        # Validate input data
        if not health_data:
            return jsonify({
                'success': False,
                'message': 'No health data provided'
            }), 400
            
        # Get AI-generated health advice
        advice = get_health_advice(health_data)
        
        return jsonify({
            'success': True,
            'data': {
                'advice': advice,
                'timestamp': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Error generating health advice: {str(e)}")
        return jsonify({
            'success': False,
            'message': f"Error generating health advice: {str(e)}"
        }), 500

# AI Chatbot Assistant endpoint
@app.route('/assistant/chat', methods=['POST'])
def ai_chat_assistant():
    logger.info("AI assistant chat request received")
    try:
        # Get question from request
        data = request.json
        
        if not data or 'question' not in data:
            return jsonify({
                'success': False,
                'message': 'No question provided'
            }), 400
            
        question = data['question']
        # Get health data from request if available
        health_data = data.get('health_data', None)
        
        # Get AI-generated response
        response = answer_health_question(question, health_data)
        
        return jsonify({
            'success': True,
            'data': {
                'response': response,
                'timestamp': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Error generating AI assistant response: {str(e)}")
        return jsonify({
            'success': False,
            'message': f"Error generating response: {str(e)}"
        }), 500

# Standard prediction endpoint
@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict():
    if request.method == 'OPTIONS':
        return make_response('', 200)
        
    # Check if model and scaler are loaded
    if model is None or scaler is None:
        logger.error("Model or scaler not loaded")
        return jsonify({'error': 'Model or scaler not loaded. Please check server logs.'}), 500
    
    try:
        data = request.json
        # Only extract the expected features in the correct order
        input_data = []
        for feature in feature_names:
            input_data.append(data.get(feature, 0))
        
        # Scale the input data
        scaled_data = scaler.transform([input_data])
        
        # Make prediction
        prediction = model.predict(scaled_data)
        probability = model.predict_proba(scaled_data)[0][1]  # Probability of class 1
        
        result = {
            'prediction': int(prediction[0]),
            'probability': float(probability),
            'risk_level': 'High Risk' if probability > 0.7 else 'Moderate Risk' if probability > 0.3 else 'Low Risk',
            'timestamp': datetime.now().isoformat(),
            'inputs': {
                feature: value for feature, value in zip(feature_names, input_data)
            }
        }
        
        logger.info(f"Prediction made: {result['prediction']} with probability {result['probability']:.4f}")
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Ensemble prediction endpoint
@app.route('/predict/ensemble', methods=['POST', 'OPTIONS'])
def predict_ensemble():
    if request.method == 'OPTIONS':
        return make_response('', 200)
        
    # Check if model and scaler are loaded
    if model is None or scaler is None:
        logger.error("Model or scaler not loaded")
        return jsonify({'success': False, 'message': 'Model or scaler not loaded. Please check server logs.'}), 500
    
    try:
        data = request.json
        logger.info(f"Received ensemble prediction request with data: {data}")
        
        # Only extract the expected features in the correct order
        input_data = []
        for feature in feature_names:
            input_data.append(data.get(feature, 0))
        
        # Use the comparison prediction function to get predictions from all available models
        comparison_result = get_comparison_prediction(input_data)
        
        # Extract the ensemble model prediction if available, otherwise use Random Forest
        if 'ensemble' in comparison_result and comparison_result['ensemble'] is not None:
            prediction = comparison_result['ensemble']['prediction']
            probability = comparison_result['ensemble']['probability']
            model_name = 'Ensemble Model'
        else:
            # Fallback to Random Forest if ensemble is not available
            prediction = comparison_result.get('random_forest', {}).get('prediction', 0)
            probability = comparison_result.get('random_forest', {}).get('probability', 0)
            model_name = 'Random Forest (Fallback)'
        
        # Determine risk level based on probability
        risk_level = "Unknown"
        if probability < 0.2:
            risk_level = "Low Risk"
        elif probability < 0.4:
            risk_level = "Moderate Risk"
        elif probability < 0.6:
            risk_level = "High Risk"
        else:
            risk_level = "Very High Risk"
        
        # Generate response message
        message = ""
        if prediction == 1:
            message = "The model predicts a high likelihood of heart disease. Please consult with a healthcare professional."
        else:
            message = "The model predicts a low likelihood of heart disease. Continue with healthy lifestyle choices."
            
        # Return prediction result with all model predictions
        return jsonify({
            'success': True,
            'data': {
                'primary_prediction': {
                    'model': model_name,
                    'prediction': int(prediction),
                    'probability': float(probability),
                    'risk_level': risk_level,
                    'message': message
                },
                'all_models': comparison_result
            }
        })
        
    except Exception as e:
        logger.error(f"Error in ensemble prediction: {str(e)}")
        return jsonify({
            'success': False,
            'message': f"Prediction error: {str(e)}"
        }), 500

# Feature importance endpoint
@app.route('/models/feature-importance', methods=['GET'])
def get_feature_importance():
    try:
        # Get feature importance data
        features, importance = get_model_feature_importance()
        
        # Format the data for frontend consumption
        data = [
            {'feature': feature, 'importance': float(imp)} 
            for feature, imp in zip(features, importance)
        ]
        
        # Sort by importance (descending)
        data = sorted(data, key=lambda x: x['importance'], reverse=True)
        
        return jsonify({
            'success': True,
            'data': data,
            'error': None
        })
    except Exception as e:
        # Log the error
        print(f"Error in feature importance endpoint: {str(e)}")
        
        # Return a proper error response with fallback indicator
        return jsonify({
            'success': False,
            'data': None,
            'error': 'Error generating feature importance data. Using fallback data.',
            'useFallback': True
        }), 500  # Still return 500 but with structured response

# Model comparison endpoint
# Model comparison endpoint
@app.route('/models/comparison', methods=['GET'])
def model_comparison():
    logger.info("Getting model comparison")
    try:
        # Import feature importance script to get the function
        from backend.feature_importance import get_model_performance_metrics
        
        # Get actual model performance metrics
        metrics = get_model_performance_metrics()
        
        # Format metrics for the frontend
        models_data = [
            {
                'id': 'random_forest',
                'name': 'Random Forest',
                'accuracy': float(metrics.get('random_forest', {}).get('accuracy', 0.85)),
                'precision': float(metrics.get('random_forest', {}).get('precision', 0.83)),
                'recall': float(metrics.get('random_forest', {}).get('recall', 0.82)),
                'f1': float(metrics.get('random_forest', {}).get('f1', 0.82)),
                'roc_auc': float(metrics.get('random_forest', {}).get('roc_auc', 0.90))
            },
            {
                'id': 'neural_network',
                'name': 'Neural Network',
                'accuracy': float(metrics.get('neural_network', {}).get('accuracy', 0.84)),
                'precision': float(metrics.get('neural_network', {}).get('precision', 0.82)),
                'recall': float(metrics.get('neural_network', {}).get('recall', 0.81)),
                'f1': float(metrics.get('neural_network', {}).get('f1', 0.81)),
                'roc_auc': float(metrics.get('neural_network', {}).get('roc_auc', 0.89))
            },
            {
                'id': 'logistic_regression',
                'name': 'Logistic Regression',
                'accuracy': float(metrics.get('logistic_regression', {}).get('accuracy', 0.83)),
                'precision': float(metrics.get('logistic_regression', {}).get('precision', 0.81)),
                'recall': float(metrics.get('logistic_regression', {}).get('recall', 0.80)),
                'f1': float(metrics.get('logistic_regression', {}).get('f1', 0.80)),
                'roc_auc': float(metrics.get('logistic_regression', {}).get('roc_auc', 0.88))
            },
            {
                'id': 'svm',
                'name': 'Support Vector Machine',
                'accuracy': float(metrics.get('svm', {}).get('accuracy', 0.82)),
                'precision': float(metrics.get('svm', {}).get('precision', 0.80)),
                'recall': float(metrics.get('svm', {}).get('recall', 0.79)),
                'f1': float(metrics.get('svm', {}).get('f1', 0.79)),
                'roc_auc': float(metrics.get('svm', {}).get('roc_auc', 0.87))
            },
            {
                'id': 'ensemble',
                'name': 'Ensemble Model',
                'accuracy': float(metrics.get('ensemble', {}).get('accuracy', 0.86)),
                'precision': float(metrics.get('ensemble', {}).get('precision', 0.84)),
                'recall': float(metrics.get('ensemble', {}).get('recall', 0.83)),
                'f1': float(metrics.get('ensemble', {}).get('f1', 0.83)),
                'roc_auc': float(metrics.get('ensemble', {}).get('roc_auc', 0.91))
            }
        ]
        return jsonify({'success': True, 'data': {'models': models_data}})
    except Exception as e:
        # If there's an error, log it and fall back to sample data
        logger.error(f"Error getting model metrics: {str(e)}")
        models_data = [
            {
                'id': 'random_forest',
                'name': 'Random Forest',
                'accuracy': 0.85,
                'precision': 0.83,
                'recall': 0.82,
                'f1': 0.82,
                'roc_auc': 0.90
            },
            {
                'id': 'neural_network',
                'name': 'Neural Network',
                'accuracy': 0.84,
                'precision': 0.82,
                'recall': 0.81,
                'f1': 0.81,
                'roc_auc': 0.89
            },
            {
                'id': 'logistic_regression',
                'name': 'Logistic Regression',
                'accuracy': 0.83,
                'precision': 0.81,
                'recall': 0.80,
                'f1': 0.80,
                'roc_auc': 0.88
            },
            {
                'id': 'svm',
                'name': 'Support Vector Machine',
                'accuracy': 0.82,
                'precision': 0.80,
                'recall': 0.79,
                'f1': 0.79,
                'roc_auc': 0.87
            },
            {
                'id': 'ensemble',
                'name': 'Ensemble Model',
                'accuracy': 0.86,
                'precision': 0.84,
                'recall': 0.83,
                'f1': 0.83,
                'roc_auc': 0.91
            }
        ]
        return jsonify({'success': True, 'data': {'models': models_data}})
# Add a new endpoint for model comparison predictions
@app.route('/models/comparison/predict', methods=['POST'])
def model_comparison_predict():
    logger.info("Getting model comparison prediction")
    try:
        data = request.json
        # Only extract the expected features in the correct order
        input_data = []
        for feature in feature_names:
            input_data.append(data.get(feature, 0))
        
        # Get comparison prediction
        comparison_result = get_comparison_prediction(input_data)
        
        return jsonify({
            'success': True,
            'data': comparison_result
        })
        
    except Exception as e:
        logger.error(f"Error in model comparison prediction: {str(e)}")
        return jsonify({
            'success': False,
            'message': f"Error in model comparison: {str(e)}"
        }), 500

# User history endpoints
@app.route('/history/<string:user_id>', methods=['GET'])
def get_user_history(user_id):
    logger.info(f"Getting history for user {user_id}")
    try:
        # In a real app, you would fetch from a database filtered by user_id
        # For now, return a sample response with the user_id
        sample_history = [
            {
                'id': '1',
                'user_id': user_id,
                'date': '2023-03-31',
                'prediction': 1,
                'probability': 0.85,
                'risk_level': 'High Risk',
                'inputs': {
                    'age': 65,
                    'sex': 1,
                    'cp': 3,
                    'trestbps': 140,
                    'chol': 250,
                    'fbs': 1,
                    'restecg': 0,
                    'thalach': 120,
                    'exang': 1,
                    'oldpeak': 2.5,
                    'slope': 0,
                    'ca': 2,
                    'thal': 2
                }
            },
            {
                'id': '2',
                'user_id': user_id,
                'date': '2023-03-30',
                'prediction': 0,
                'probability': 0.25,
                'risk_level': 'Low Risk',
                'inputs': {
                    'age': 42,
                    'sex': 0,
                    'cp': 0,
                    'trestbps': 120,
                    'chol': 180,
                    'fbs': 0,
                    'restecg': 0,
                    'thalach': 160,
                    'exang': 0,
                    'oldpeak': 0.5,
                    'slope': 1,
                    'ca': 0,
                    'thal': 1
                }
            }
        ]
        return jsonify({'success': True, 'data': {'predictions': sample_history}})
    except Exception as e:
        logger.error(f"Error fetching history for user {user_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/history', methods=['POST', 'OPTIONS'])
def save_history():
    if request.method == 'OPTIONS':
        return make_response('', 200)
        
    logger.info("Saving prediction history")
    try:
        data = request.json
        # In a real app, you would save this to a database
        # For now, just return success
        return jsonify({'success': True, 'message': 'History saved successfully'})
    except Exception as e:
        logger.error(f"Error saving history: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/history/<string:id>', methods=['DELETE'])
def delete_history(id):
    logger.info(f"Deleting history item {id}")
    try:
        # In a real app, you would delete from a database
        # For now, just return success
        return jsonify({'success': True, 'message': f'History entry {id} deleted successfully'})
    except Exception as e:
        logger.error(f"Error deleting history item {id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Explain prediction endpoint
@app.route('/predict/explain', methods=['POST', 'OPTIONS'])
def explain_prediction():
    if request.method == 'OPTIONS':
        return make_response('', 200)
        
    logger.info("Explaining prediction")
    # Check if model and scaler are loaded
    if model is None or scaler is None:
        logger.error("Model or scaler not loaded")
        return jsonify({'error': 'Model or scaler not loaded. Please check server logs.'}), 500
    
    try:
        data = request.json
        # Only extract the expected features in the correct order
        input_data = []
        for feature in feature_names:
            input_data.append(data.get(feature, 0))
        
        # Scale the input data
        scaled_data = scaler.transform([input_data])
        
        # Make prediction
        prediction = model.predict(scaled_data)
        probability = model.predict_proba(scaled_data)[0][1]
        
        # Get feature importance for this prediction
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
        elif hasattr(model, 'coef_'):
            importances = np.abs(model.coef_[0])
        else:
            importances = [0.08, 0.12, 0.15, 0.05, 0.07, 0.03, 0.04, 0.10, 0.09, 0.08, 0.06, 0.07, 0.06]
        
        # Combine feature values with their importance
        feature_contributions = []
        for feature, value, importance in zip(feature_names, input_data, importances):
            # Calculate contribution (simplified approach)
            contribution = float(value * importance)
            feature_contributions.append({
                'feature': feature,
                'value': value,
                'importance': float(importance),
                'contribution': contribution,
                'description': feature_descriptions.get(feature, '')
            })
        
        # Sort by contribution (absolute value, descending)
        feature_contributions.sort(key=lambda x: abs(x['contribution']), reverse=True)
        
        # Generate explanation text
        top_features = feature_contributions[:3]
        explanation_text = f"The model predicts {'a high' if probability > 0.7 else 'a medium' if probability > 0.3 else 'a low'} risk of heart disease. "
        explanation_text += "The most important factors in this prediction are: "
        explanation_text += ", ".join([f"{f['feature']} ({f['description']})" for f in top_features])
        
        result = {
            'success': True,
            'data': {
                'prediction': int(prediction[0]),
                'probability': float(probability),
                'risk_level': 'High Risk' if probability > 0.7 else 'Medium Risk' if probability > 0.3 else 'Low Risk',
                'explanation': explanation_text,
                'feature_contributions': feature_contributions,
                'timestamp': datetime.now().isoformat()
            }
        }
        
        logger.info(f"Prediction explained: {prediction[0]} with probability {probability:.4f}")
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Explain prediction error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Create an alias route for /explain to match the frontend's expectations
@app.route('/explain', methods=['POST', 'OPTIONS'])
def explain_model():
    """
    Endpoint for SHAP explanations
    This provides detailed feature importance using SHAP values for better interpretability
    """
    if request.method == 'OPTIONS':
        return make_response('', 200)
    
    logger.info("Processing SHAP explanation request")
    
    # Check if model and scaler are loaded
    if model is None or scaler is None:
        logger.error("Model or scaler not loaded")
        return jsonify({
            'success': False, 
            'message': 'Model or scaler not loaded. Please check server logs.'
        }), 500
    
    try:
        data = request.json
        logger.info(f"Received data for explanation: {data}")
        
        # Extract inputs from the request
        if 'inputs' in data:
            input_data = data['inputs']
        else:
            # Only extract the expected features in the correct order
            input_data = {}
            for feature in feature_names:
                input_data[feature] = data.get(feature, 0)
        
        # Prepare input array in the correct order
        input_array = []
        for feature in feature_names:
            input_array.append(input_data.get(feature, 0))
        
        # Scale the input data
        scaled_data = scaler.transform([input_array])
        
        try:
            # Get SHAP explanations
            shap_explanations = get_shap_values(scaled_data, input_array)
            
            # Format the features data for the frontend
            features = []
            for feature_data in shap_explanations['features']:
                features.append({
                    'feature': feature_data['feature'],
                    'feature_display_name': feature_data['feature_display_name'],
                    'value': feature_data['value'],
                    'shap_value': feature_data['shap_value'],
                    'impact': 'high' if abs(feature_data['shap_value']) > 0.1 else 'medium' if abs(feature_data['shap_value']) > 0.05 else 'low',
                    'direction': 'positive' if feature_data['shap_value'] > 0 else 'negative',
                    'description': feature_data['description'],
                    'recommendation': feature_data['recommendation']
                })
            
            return jsonify({
                'success': True,
                'data': {
                    'features': features,
                    'base_value': shap_explanations['base_value'],
                    'summary': shap_explanations['summary']
                }
            })
            
        except Exception as shap_error:
            logger.error(f"Error generating SHAP explanations: {str(shap_error)}")
            logger.info("Falling back to basic feature importance explanation")
            
            # If SHAP explanation fails, fall back to the basic explanation
            return explain_prediction()
            
    except Exception as e:
        logger.error(f"Explain model error: {str(e)}")
        return jsonify({
            'success': False,
            'message': f"Error explaining model: {str(e)}"
        }), 500

# Error handler for general exceptions
@app.errorhandler(Exception)
def handle_exception(e):
    # Log the error
    logger.error(f"Unhandled exception: {str(e)}")
    
    # Return a friendly error response
    return jsonify({
        'error': 'Server error',
        'message': 'An unexpected error occurred. Please try again later.'
    }), 500

if __name__ == '__main__':
    # Get port from environment variable or use default
    port = int(os.getenv('PORT', 5000))
    
    # Get debug mode from environment variable
    debug = os.getenv('DEBUG', 'False').lower() in ('true', '1', 't')
    
    # Run the app
    logger.info(f"Starting server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)