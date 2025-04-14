from setuptools import setup, find_packages

setup(
    name="heart-disease-prediction",
    version="1.0.0",
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        "flask",
        "flask-cors",
        "joblib",
        "numpy",
        "pandas",
        "python-dotenv",
        "scikit-learn",
        "shap"
    ],
)