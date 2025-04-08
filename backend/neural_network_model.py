import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping
from config import Config

# Load configuration
config = Config()

# Create model directory if it doesn't exist
os.makedirs(config.MODEL_DIR, exist_ok=True)

# Load dataset
print("Loading dataset from:", config.DATASET_PATH)
df = pd.read_csv(config.DATASET_PATH)

# Preprocess data: separate features and target
X = df.drop(columns=["target"])
y = df["target"]

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Split data
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# Build the neural network model
model_nn = Sequential([
    Dense(64, activation='relu', input_dim=X_train.shape[1]),
    Dropout(0.3),
    Dense(32, activation='relu'),
    Dense(1, activation='sigmoid')  # Sigmoid for binary classification
])

model_nn.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# Use early stopping to avoid overfitting
early_stop = EarlyStopping(monitor='val_loss', patience=5)

# Train the model
print("Training neural network model...")
model_nn.fit(X_train, y_train, validation_split=0.2, epochs=50, batch_size=16, callbacks=[early_stop], verbose=1)

# Evaluate model
loss, accuracy = model_nn.evaluate(X_test, y_test)
print(f"Neural Network Model Accuracy: {accuracy*100:.2f}%")

# Save the model and scaler
print(f"Saving neural network model to {config.NN_MODEL_PATH}")
model_nn.save(config.NN_MODEL_PATH)

print(f"Saving scaler to {config.NN_SCALER_PATH}")
joblib.dump(scaler, config.NN_SCALER_PATH)

print("Neural Network Model and Scaler saved successfully!")
