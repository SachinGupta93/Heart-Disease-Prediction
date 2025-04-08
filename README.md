# Heart Disease Prediction Project

## Overview

This project is a comprehensive web application for heart disease risk prediction using machine learning. It provides users with tools to assess their risk of heart disease, understand the factors contributing to their risk, simulate how lifestyle changes might affect their risk, and track their risk over time.

## Features

- **Heart Disease Risk Prediction**: Get personalized risk assessment based on clinical factors
- **Risk Simulation**: Visualize how changes to health metrics could affect heart disease risk
- **Explainable AI**: Understand how the model makes predictions and which factors influence them
- **Feature Importance Visualization**: See which health factors have the greatest impact on heart disease risk
- **Risk History Tracking**: Save and monitor risk assessments over time
- **Model Comparison**: Compare the performance of different machine learning models
- **Health Information**: Access educational resources about heart disease risk factors and prevention

## Technology Stack

### Frontend
- **React.js**: JavaScript library for building the user interface
- **Chakra UI**: Component library for building accessible and responsive UI
- **Recharts**: Charting library for data visualization
- **Framer Motion**: Animation library for enhanced user experience
- **Axios**: HTTP client for making API requests

### Backend
- **Flask**: Python web framework for building the API
- **Flask-CORS**: Extension for handling Cross-Origin Resource Sharing
- **Flask-RESTx**: Extension for building RESTful APIs with Swagger documentation
- **Scikit-learn**: Machine learning library for predictive models
- **Pandas**: Data manipulation and analysis
- **NumPy**: Numerical computing
- **Joblib**: Model serialization and persistence

## Project Structure

### Frontend

```
heart-disease-frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── PredictionForm.jsx       # Form for inputting health data
│   │   ├── RiskSimulator.jsx        # Interactive risk simulation tool
│   │   ├── ExplainableAi.jsx        # Model explanation visualization
│   │   ├── FeatureImportance.jsx    # Feature importance visualization
│   │   ├── RiskHistory.jsx          # Risk history tracking
│   │   ├── ModelComparison.jsx      # Model comparison tool
│   │   └── HealthInformation.jsx    # Health education resources
│   ├── services/
│   │   └── api.js                   # Centralized API service
│   ├── App.jsx                      # Main application component
│   ├── index.js                     # Application entry point
│   └── theme.js                     # Chakra UI theme customization
```

### Backend

```
backend/
├── model/
│   ├── heart_model.pkl              # Trained machine learning model
│   └── scaler.pkl                   # Feature scaler
├── app.py                           # Main Flask application
├── neural_network_model_sklearn.py  # Neural network model training script
└── requirements.txt                 # Python dependencies
```

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- Python (v3.7 or higher)
- pip (Python package manager)

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd heart-disease-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. The application will be available at http://localhost:3000

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the Flask server:
   ```bash
   python app.py
   ```

5. The API will be available at http://localhost:5000

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

## Machine Learning Models

The application uses an ensemble of machine learning models for heart disease prediction:

1. **Random Forest**: Primary model with high accuracy and feature importance capabilities
2. **Neural Network**: Secondary model for ensemble predictions
3. **Logistic Regression**: Used for comparison purposes
4. **Support Vector Machine**: Used for comparison purposes

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

1. **Prediction Form**: Enter your health information to get a personalized heart disease risk assessment.
2. **Risk Simulator**: Adjust sliders to see how changes in health metrics affect your risk.
3. **Explainable AI**: View detailed explanations of how the model arrived at its prediction.
4. **Feature Importance**: Discover which health factors have the greatest impact on heart disease risk.
5. **Risk History**: Track how your heart disease risk changes over time.
6. **Model Comparison**: Compare predictions from different machine learning models.
7. **Health Information**: Learn about heart disease risk factors, prevention strategies, and treatment options.

## Future Enhancements

- User authentication and personalized dashboards
- Integration with wearable device data
- More detailed health recommendations based on risk factors
- Mobile application version
- Integration with electronic health records

## Contributors

- Sachin Gupta

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- UCI Machine Learning Repository for the Heart Disease dataset
- American Heart Association for health information resources
- Centers for Disease Control and Prevention for risk factor data
