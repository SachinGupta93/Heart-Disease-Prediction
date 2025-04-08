import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# -----------------------------
# 1. Load and Inspect the Data
# -----------------------------
df = pd.read_csv("C:\\Users\\DELL\\OneDrive\\Desktop\\Mini Project\\dataset\\heart.csv")  # Adjust the path as needed

print("First 5 rows:")
print(df.head())
print("\nDataset Info:")
print(df.info())

# Check for missing values
print("\nMissing Values:")
print(df.isnull().sum())

# -----------------------------
# 2. Data Cleaning & Outlier Handling
# -----------------------------
# For demonstration, let's assume numerical columns might have outliers.
# We'll use the IQR method to cap outliers for all numeric columns except the target.
numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
numeric_cols.remove("target")  # Remove target column from cleaning

def cap_outliers(col):
    Q1 = col.quantile(0.25)
    Q3 = col.quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    return col.clip(lower=lower_bound, upper=upper_bound)

for col in numeric_cols:
    df[col] = cap_outliers(df[col])

# -----------------------------
# 3. Preprocessing
# -----------------------------
# Separate features and target
X = df.drop(columns=["target"])
y = df["target"]

# Feature Scaling
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# -----------------------------
# 4. Model Training
# -----------------------------
# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# Train a Random Forest Classifier
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate the model
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print("\nModel Accuracy: {:.2f}%".format(accuracy * 100))
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# -----------------------------
# 5. Save the Model & Scaler
# -----------------------------
os.makedirs("model", exist_ok=True)
joblib.dump(model, "model/heart_model.pkl")
joblib.dump(scaler, "model/scaler.pkl")

print("\nModel and scaler saved successfully!")
# Add this code at the end of your model.py file, after saving the model and scaler

# Verify that the files can be loaded correctly
print("\nVerifying saved files...")
try:
    loaded_model = joblib.load("model/heart_model.pkl")
    loaded_scaler = joblib.load("model/scaler.pkl")
    print("Model type:", type(loaded_model))
    print("Scaler type:", type(loaded_scaler))
    print("Verification successful! Files were saved and can be loaded correctly.")
except Exception as e:
    print(f"Error during verification: {e}")


# After loading the model and scaler
print("\nModel details:")
print("Number of estimators:", loaded_model.n_estimators)
print("Feature importances:", loaded_model.feature_importances_)

print("\nScaler details:")
print("Scale:", loaded_scaler.scale_)
print("Mean:", loaded_scaler.mean_)
