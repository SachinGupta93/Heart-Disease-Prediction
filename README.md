# Heart Disease Prediction Project

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
│   │   ├── RiskHistory.jsx         # Risk history tracking
│   │   ├── ModelComparison.jsx     # Model comparison tool
│   │   ├── HealthInformation.jsx   # Health education resources
│   │   ├── AIAssistant.jsx         # AI-powered health assistant
│   │   ├── Dashboard.jsx           # User dashboard
│   │   └── Header.jsx              # Application header with navigation
│   ├── contexts/                   # React context providers
│   ├── pages/                      # Application pages
│   ├── services/                   # API services
│   │   └── api.js                  # Centralized API service
│   ├── utils/                      # Utility functions
│   ├── App.jsx                     # Main application component
│   ├── index.js                    # Application entry point
│   └── theme.js                    # Chakra UI theme customization
```

### Backend

```
backend/
├── model/                          # Machine learning models
│   ├── heart_model.pkl             # Trained machine learning model
│   ├── neural_network_model.pkl    # Neural network model
│   ├── scaler.pkl                  # Feature scaler
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
├── neural_network_model_sklearn.py # Neural network implementation
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
- `POST /predict/explain`: Get explanation for a prediction
- `POST /predict/ensemble`: Get ensemble prediction from multiple models
- `GET /history`: Get prediction history
- `POST /history`: Save prediction to history
- `DELETE /history/{id}`: Delete a prediction from history
- `GET /models/feature-importance`: Get feature importance data
- `GET /models/comparison`: Get model comparison data
- `GET /health-info`: Get health information and resources
- `POST /ai-assistant`: Get personalized health recommendations from the AI assistant

## Machine Learning Models

The application uses an ensemble of machine learning models for heart disease prediction:

1. **Random Forest**: Primary model with high accuracy and feature importance capabilities
2. **Neural Network**: Secondary model for ensemble predictions
3. **Logistic Regression**: Used for comparison purposes
4. **Support Vector Machine**: Used for comparison purposes

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
- **trestbps**: Resting blood pressure (mm Hg)
- **chol**: Serum cholesterol (mg/dl)
- **fbs**: Fasting blood sugar > 120 mg/dl (1 = true, 0 = false)
- **restecg**: Resting electrocardiographic results (0-2)
- **thalach**: Maximum heart rate achieved
- **exang**: Exercise induced angina (1 = yes, 0 = no)
- **oldpeak**: ST depression induced by exercise relative to rest
- **slope**: Slope of the peak exercise ST segment (0-2)
- **ca**: Number of major vessels colored by fluoroscopy (0-3)
- **thal**: Thalassemia (0-3)

## How to Use the Application

1. **Sign Up/Login**: Create an account or log in to access your personalized dashboard.
2. **Prediction Form**: Enter your health information to get a personalized heart disease risk assessment.
3. **Risk Simulator**: Adjust sliders to see how changes in health metrics affect your risk.
4. **Explainable AI**: View detailed explanations of how the model arrived at its prediction.
5. **Feature Importance**: Discover which health factors have the greatest impact on heart disease risk.
6. **Risk History**: Track how your heart disease risk changes over time.
7. **Model Comparison**: Compare predictions from different machine learning models.
8. **Health Information**: Learn about heart disease risk factors, prevention strategies, and treatment options.
9. **AI Assistant**: Ask questions and get personalized health recommendations from the AI assistant.

## Demo

Check out the live demo of the application: [Heart Disease Prediction App](https://your-app-url.com)

## Future Enhancements

- Enhanced user authentication and personalized dashboards
- Integration with wearable device data
- More detailed health recommendations based on risk factors
- Mobile application version
- Integration with electronic health records
- Multi-language support
- Additional machine learning models for improved predictions
- Social sharing features for health progress

## Contributors

- Sachin Gupta

## License

This project is licensed under the MIT License - see the LICENSE file for details.

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

## Contact

For questions or feedback, please reach out to guptasach8247@gmail.com
