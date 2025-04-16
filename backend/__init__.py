"""
Heart Disease Prediction API - Backend Package
"""

__version__ = '1.0.0'

# Import important modules and components for easier access
from . import model_comparison
from . import model_explainer
from . import feature_importance
from . import utils

# Define namespace exports
__all__ = ['app', 'model_comparison', 'model_explainer', 'feature_importance', 'utils']