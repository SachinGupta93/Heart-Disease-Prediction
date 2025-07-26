<img width="1156" height="644" alt="image" src="https://github.com/user-attachments/assets/39a7b690-eff3-41a5-93c5-911385c01614" />


## Overview

This project is a comprehensive web application for heart disease risk prediction using machine learning. It provides users with tools to assess their risk of heart disease, understand the factors contributing to their risk, simulate how lifestyle changes might affect their risk, and track their risk over time. The application leverages advanced AI techniques to deliver personalized health insights and recommendations.

## Features

- **Heart Disease Risk Prediction**: Get personalized risk assessment based on clinical factors
- **Risk Simulation**: Visualize how changes to health metrics could affect heart disease risk
- **Explainable AI**: Understand how the model makes predictions and which factors influence them
- **Feature Importance Visualization**: See which health factors have the greatest impact on heart disease risk
- **Risk History Tracking**: Save and monitor risk assessments over time
- **Model Comparison**: Compare the performance of different machine learning models
- **Health Information**: Access educational resources about heart disease risk factors and prevention
- **AI Assistant**: Get personalized health recommendations and answers to your questions
- **User Authentication**: Secure login and personalized dashboard
- **Data Visualization**: Interactive charts and graphs for better understanding of health data

## Technology Stack

### Frontend
- **React.js**: JavaScript library for building the user interface
- **Chakra UI**: Component library for building accessible and responsive UI
- **Recharts**: Charting library for data visualization
- **Framer Motion**: Animation library for enhanced user experience
- **Axios**: HTTP client for making API requests
- **Firebase**: Authentication and data storage
- **Vite**: Fast, modern frontend build tool

### Backend
- **Flask**: Python web framework for building the API
- **Flask-CORS**: Extension for handling Cross-Origin Resource Sharing
- **Flask-RESTx**: Extension for building RESTful APIs with Swagger documentation
- **Scikit-learn**: Machine learning library for predictive models
- **Pandas**: Data manipulation and analysis
- **NumPy**: Numerical computing
- **Joblib**: Model serialization and persistence
- **SQLite**: Lightweight database for storing user data and predictions
- **Gemini API**: Google's generative AI for the AI assistant feature
- **SHAP**: SHapley Additive exPlanations for model interpretability

## Project Structure

### Frontend

```
heart-disease-frontend/
├── public/                         # Static assets
├── src/
│   ├── components/                 # UI components
│   │   ├── PredictionForm.jsx      # Form for inputting health data
│   │   ├── RiskSimulator.jsx       # Interactive risk simulation tool
│   │   ├── ExplainableAi.jsx       # Model explanation visualization
│   │   ├── FeatureImportance.jsx   # Feature importance visualization
│   │   ├── PredictionHistory.jsx   # Risk history tracking
│   │   ├── ModelComparison.jsx     # Model comparison tool
│   │   ├── HealthInformation.jsx   # Health education resources
│   │   ├── AIAssistant.jsx         # AI-powered health assistant
│   │   ├── Dashboard.jsx           # User dashboard
│   │   └── Header.jsx              # Application header with navigation
│   ├── contexts/                   # React context providers
│   │   └── AuthContext.jsx         # Authentication context
│   ├── pages/                      # Application pages
│   ├── services/                   # API services
│   │   └── api.js                  # Centralized API service
│   ├── utils/                      # Utility functions
│   ├── App.jsx                     # Main application component
│   ├── main.jsx                    # Application entry point
│   └── theme.js                    # Chakra UI theme customization
```

### Backend

```
backend/
├── model/                          # Machine learning models
│   ├── heart_model.pkl             # Random Forest model (primary)
│   ├── ensemble_model.pkl          # Ensemble model combining multiple algorithms
│   ├── lr_model.pkl                # Logistic Regression model
│   ├── neural_network_model.pkl    # Neural network model architecture
│   ├── nn_model.pkl                # Scikit-learn neural network implementation
│   ├── svm_model.pkl               # Support Vector Machine model
│   ├── scaler.pkl                  # Feature scaler for data normalization
│   ├── scaler_nn.pkl               # Specific scaler for neural network
│   └── shap_explainer.pkl          # SHAP explainer for model interpretability
├── dataset/                        # Dataset files
│   └── heart.csv                   # UCI Heart Disease dataset
├── logs/                          # Application logs
├── tests/                         # Test files
├── utils/                         # Utility modules
│   ├── data_processing.py         # Data preprocessing functions
│   ├── gemini_utils.py            # Gemini API integration
│   ├── logger.py                  # Logging configuration
│   └── validation.py              # Input validation
├── app.py                         # Main Flask application
├── ensemble_model.py              # Ensemble model implementation
├── feature_importance.py          # Feature importance calculation
├── model_comparison.py            # Model comparison functionality
├── model_explainer.py             # SHAP-based model explainer
├── neural_network_model_sklearn.py # Neural network implementation with scikit-learn
├── neural_network_model.py        # Neural network implementation with TensorFlow/Keras
├── train_models.py                # Model training script
└── requirements.txt               # Python dependencies
```

## Installation and Setup

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- pip (Python package manager)
- Git

### Frontend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/heart-disease-prediction.git
   cd heart-disease-prediction
   ```

2. Navigate to the frontend directory:
   ```bash
   cd heart-disease-frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   Create a `.env` file with the following variables:
   ```
   VITE_API_URL=http://localhost:5000
   VITE_FIREBASE_API_KEY=your-firebase-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
   VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. The application will be available at http://localhost:3000

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv tf_env
   source tf_env/bin/activate  # On Windows: tf_env\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   Create a `.env` file with the following variables:
   ```
   FLASK_APP=app.py
   FLASK_ENV=development
   DATABASE_URI=sqlite:///instance/heart_disease.db
   GEMINI_API_KEY=your-gemini-api-key
   ```

5. Initialize the database:
   ```bash
   python init_db.py
   ```

6. Start the Flask server:
   ```bash
   python app.py
   ```

7. The API will be available at http://localhost:5000

## API Endpoints

- `GET /`: API information and available endpoints
- `POST /predict`: Make a heart disease prediction
- `POST /predict/ensemble`: Get ensemble prediction from multiple models
- `POST /predict/explain`: Get explanation for a prediction
- `GET /explain`: Get SHAP-based detailed explanation
- `GET /history/<user_id>`: Get prediction history for a user
- `POST /history`: Save prediction to history
- `DELETE /history/<id>`: Delete a prediction from history
- `GET /models/feature-importance`: Get feature importance data
- `GET /models/comparison`: Get model comparison data
- `GET /models/comparison/predict`: Get predictions from multiple models
- `GET /health/status`: Check API health status
- `GET /health/info`: Get general health information and resources
- `POST /health/advice`: Get personalized health advice
- `POST /assistant/chat`: Interact with the AI health assistant

## Machine Learning Models

The application uses multiple machine learning models for heart disease prediction, each with specific strengths:

### 1. Random Forest (heart_model.pkl)
- **Primary prediction model**
- **Advantages**: High accuracy, robust to overfitting, provides feature importance
- **Implementation**: Ensemble of decision trees trained with bagging
- **Use case**: Primary model for general predictions with high reliability and interpretability
- **Performance**: Excels at handling non-linear relationships and interactions between features

### 2. Neural Network (neural_network_model.pkl & nn_model.pkl)
- **Implemented in two variations**:
  - Scikit-learn MLPClassifier (nn_model.pkl): A feedforward neural network implementation
  - TensorFlow/Keras implementation (neural_network_model.pkl): A deeper architecture with more flexibility
- **Advantages**: Captures complex patterns and hidden relationships in medical data
- **Use case**: Secondary model that excels with pattern recognition in complex health data
- **Architecture**: Multi-layer perceptron with ReLU activation and adaptive learning rates

### 3. Logistic Regression (lr_model.pkl)
- **Baseline model for comparison**
- **Advantages**: Highly interpretable, provides feature coefficients, fast training and prediction
- **Implementation**: Linear model with logistic function
- **Use case**: Provides baseline predictions and clear feature importance coefficients 
- **Performance**: Works well with linearly separable data and gives probability estimates

### 4. Support Vector Machine (svm_model.pkl)
- **Supplementary model**
- **Advantages**: Effective in high-dimensional spaces, robust against overfitting
- **Implementation**: Radial Basis Function (RBF) kernel for non-linear classification
- **Use case**: Provides alternative perspective especially useful for boundary cases
- **Performance**: Strong generalization capability with proper parameter tuning

### 5. Ensemble Model (ensemble_model.pkl)
- **Meta-model that combines predictions from all other models**
- **Implementation**: Weighted voting ensemble combining RandomForest, Neural Network, Logistic Regression and SVM
- **Advantages**: Higher accuracy than individual models, more robust predictions
- **Use case**: Final prediction model that leverages strengths of all individual models
- **Performance**: Achieves the highest overall accuracy (90%) and AUC (0.94)

### Model Processing
- **Feature Scaling**: All models use standardized features (scaler.pkl and scaler_nn.pkl)
- **Interpretability**: SHAP values provide individual prediction explanations (shap_explainer.pkl)
- **Visualization**: Feature importance charts show global and local model interpretations

### Model Performance Metrics

| Model | Accuracy | Precision | Recall | F1 Score | AUC |
|-------|----------|-----------|--------|----------|-----|
| Random Forest | 0.88 | 0.89 | 0.86 | 0.87 | 0.92 |
| Neural Network | 0.85 | 0.84 | 0.85 | 0.84 | 0.90 |
| Logistic Regression | 0.83 | 0.82 | 0.84 | 0.83 | 0.89 |
| SVM | 0.82 | 0.81 | 0.83 | 0.82 | 0.88 |
| Ensemble | 0.90 | 0.91 | 0.89 | 0.90 | 0.94 |

## Dataset

The model is trained on the UCI Heart Disease dataset, which includes the following features:

- **age**: Age in years
- **sex**: Sex (1 = male, 0 = female)
- **cp**: Chest pain type (0-3)
  - 0: Typical angina
  - 1: Atypical angina
  - 2: Non-anginal pain
  - 3: Asymptomatic
- **trestbps**: Resting blood pressure in mm Hg
- **chol**: Serum cholesterol in mg/dl
- **fbs**: Fasting blood sugar > 120 mg/dl (1 = true, 0 = false)
- **restecg**: Resting electrocardiographic results (0-2)
  - 0: Normal
  - 1: ST-T wave abnormality
  - 2: Left ventricular hypertrophy
- **thalach**: Maximum heart rate achieved
- **exang**: Exercise induced angina (1 = yes, 0 = no)
- **oldpeak**: ST depression induced by exercise relative to rest
- **slope**: Slope of the peak exercise ST segment (0-2)
  - 0: Upsloping
  - 1: Flat
  - 2: Downsloping
- **ca**: Number of major vessels colored by fluoroscopy (0-3)
- **thal**: Thalassemia (1-3)
  - 1: Normal
  - 2: Fixed defect
  - 3: Reversible defect

## Explainable AI Implementation

Our application features a robust explainable AI component that helps users understand their heart disease risk predictions:

1. **SHAP (SHapley Additive exPlanations) Values**: 
   - Calculates the contribution of each feature to the prediction
   - Shows both positive and negative influences on the risk score
   - Visually represents feature importance for individual predictions

2. **Feature Importance Visualization**:
   - Global importance: Shows which features matter most across all predictions
   - Local importance: Shows which features influenced a specific user's prediction
   - Interactive charts allow users to explore different scenarios

3. **Risk Simulation**:
   - Users can adjust health parameters to see how changes might affect their risk
   - Real-time prediction updates as parameters change
   - Clear visualization of modifiable vs. non-modifiable risk factors

4. **AI Health Assistant**:
   - Leverages Google's Gemini API for natural language understanding
   - Provides personalized explanations of prediction results
   - Offers health recommendations based on specific risk factors

## How to Use the Application

1. **Sign Up/Login**: Create an account or log in to access your personalized dashboard.
2. **Prediction Form**: Enter your health information to get a personalized heart disease risk assessment.
3. **Risk Simulator**: Adjust sliders to see how changes in health metrics affect your risk.
4. **Explainable AI**: View detailed explanations of how the model arrived at its prediction.
5. **Feature Importance**: Discover which health factors have the greatest impact on heart disease risk.
6. **Prediction History**: Track how your heart disease risk changes over time.
7. **Model Comparison**: Compare predictions from different machine learning models.
8. **Health Information**: Learn about heart disease risk factors, prevention strategies, and treatment options.
9. **AI Assistant**: Ask questions and get personalized health recommendations from the AI assistant.

## Future Enhancements

- Enhanced user authentication and personalized dashboards
- Integration with wearable device data
- More detailed health recommendations based on risk factors
- Mobile application version
- Integration with electronic health records
- Multi-language support
- Additional machine learning models for improved predictions
- Social sharing features for health progress
- Advanced time-series analysis for tracking health trends

## Acknowledgments

- UCI Machine Learning Repository for the Heart Disease dataset
- American Heart Association for health information resources
- Centers for Disease Control and Prevention for risk factor data
- Google for Gemini API access
- Open-source community for libraries and tools

## Citations

1. Detrano, R., et al. (1989). International application of a new probability algorithm for the diagnosis of coronary artery disease. American Journal of Cardiology, 64(5), 304-310.
2. Lundberg, S.M., & Lee, S.I. (2017). A unified approach to interpreting model predictions. Advances in Neural Information Processing Systems, 30, 4765-4774.
3. World Health Organization. (2023). Cardiovascular diseases (CVDs). https://www.who.int/news-room/fact-sheets/detail/cardiovascular-diseases-(cvds)


