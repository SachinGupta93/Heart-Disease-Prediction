from app import app, db
from models import Prediction
from datetime import datetime, timedelta
import random

# Sample data for initial predictions
sample_predictions = [
    {
        'prediction': 1,
        'probability': 0.85,
        'risk_level': 'High Risk',
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
    },
    {
        'prediction': 0,
        'probability': 0.25,
        'risk_level': 'Low Risk',
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
    },
    {
        'prediction': 1,
        'probability': 0.72,
        'risk_level': 'High Risk',
        'age': 58,
        'sex': 1,
        'cp': 2,
        'trestbps': 150,
        'chol': 270,
        'fbs': 1,
        'restecg': 1,
        'thalach': 130,
        'exang': 1,
        'oldpeak': 1.8,
        'slope': 1,
        'ca': 1,
        'thal': 2
    },
    {
        'prediction': 0,
        'probability': 0.15,
        'risk_level': 'Low Risk',
        'age': 35,
        'sex': 0,
        'cp': 0,
        'trestbps': 110,
        'chol': 160,
        'fbs': 0,
        'restecg': 0,
        'thalach': 175,
        'exang': 0,
        'oldpeak': 0.2,
        'slope': 2,
        'ca': 0,
        'thal': 0
    },
    {
        'prediction': 0,
        'probability': 0.38,
        'risk_level': 'Moderate Risk',
        'age': 50,
        'sex': 1,
        'cp': 1,
        'trestbps': 130,
        'chol': 210,
        'fbs': 0,
        'restecg': 0,
        'thalach': 145,
        'exang': 0,
        'oldpeak': 1.0,
        'slope': 1,
        'ca': 0,
        'thal': 1
    }
]

def init_db():
    with app.app_context():
        # Clear existing data
        db.drop_all()
        db.create_all()
        
        print("Database tables created.")
        
        # Add sample predictions with different dates
        now = datetime.now()
        
        for i, pred_data in enumerate(sample_predictions):
            # Create dates going back in time (newest to oldest)
            days_ago = i * 7  # One week apart
            pred_date = now - timedelta(days=days_ago)
            
            prediction = Prediction(
                date=pred_date,
                prediction=pred_data['prediction'],
                probability=pred_data['probability'],
                risk_level=pred_data['risk_level'],
                age=pred_data['age'],
                sex=pred_data['sex'],
                cp=pred_data['cp'],
                trestbps=pred_data['trestbps'],
                chol=pred_data['chol'],
                fbs=pred_data['fbs'],
                restecg=pred_data['restecg'],
                thalach=pred_data['thalach'],
                exang=pred_data['exang'],
                oldpeak=pred_data['oldpeak'],
                slope=pred_data['slope'],
                ca=pred_data['ca'],
                thal=pred_data['thal']
            )
            
            db.session.add(prediction)
        
        db.session.commit()
        print(f"Added {len(sample_predictions)} sample predictions to the database.")

if __name__ == '__main__':
    init_db()
