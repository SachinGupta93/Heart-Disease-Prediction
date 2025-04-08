from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Prediction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    prediction = db.Column(db.Integer, nullable=False)  # 0 or 1
    probability = db.Column(db.Float, nullable=False)
    risk_level = db.Column(db.String(20), nullable=False)
    
    # Input features
    age = db.Column(db.Float)
    sex = db.Column(db.Integer)
    cp = db.Column(db.Integer)
    trestbps = db.Column(db.Float)
    chol = db.Column(db.Float)
    fbs = db.Column(db.Integer)
    restecg = db.Column(db.Integer)
    thalach = db.Column(db.Float)
    exang = db.Column(db.Integer)
    oldpeak = db.Column(db.Float)
    slope = db.Column(db.Integer)
    ca = db.Column(db.Integer)
    thal = db.Column(db.Integer)
    
    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.isoformat(),
            'prediction': self.prediction,
            'probability': self.probability,
            'risk_level': self.risk_level,
            'inputs': {
                'age': self.age,
                'sex': self.sex,
                'cp': self.cp,
                'trestbps': self.trestbps,
                'chol': self.chol,
                'fbs': self.fbs,
                'restecg': self.restecg,
                'thalach': self.thalach,
                'exang': self.exang,
                'oldpeak': self.oldpeak,
                'slope': self.slope,
                'ca': self.ca,
                'thal': self.thal
            }
        }
