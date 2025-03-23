import pandas as pd
import numpy as np
import joblib
import sys
import json
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import tensorflow as tf
from tensorflow.keras.models import Sequential, load_model, save_model
from tensorflow.keras.layers import Dense, Dropout, BatchNormalization
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint

def create_neural_network(input_dim):
    """Create a neural network model for fraud detection"""
    model = Sequential([
        Dense(64, activation='relu', input_dim=input_dim),
        BatchNormalization(),
        Dropout(0.3),
        Dense(32, activation='relu'),
        BatchNormalization(),
        Dropout(0.3),
        Dense(16, activation='relu'),
        BatchNormalization(),
        Dense(1, activation='sigmoid')
    ])
    
    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy', tf.keras.metrics.AUC(), tf.keras.metrics.Precision(), tf.keras.metrics.Recall()]
    )
    
    return model

def train_model(file_path):
    """Train a neural network model on the provided dataset"""
    # Step 1: Load Dataset in Chunks
    chunksize = 100000  # Adjust based on RAM availability
    df_list = []  # Temporary storage for chunks

    for chunk in pd.read_csv(file_path, chunksize=chunksize):
        df_list.append(chunk)

    df = pd.concat(df_list, ignore_index=True)  # Merge all chunks

    # Step 2: Check Missing Values & Fill Them
    df.fillna(df.median(), inplace=True)

    # Step 3: Feature Selection (Exclude 'Class' column for X, keep it for y)
    X = df.drop(columns=["Class"])  
    y = df["Class"]

    # Step 4: Normalize Data (Scaling for better accuracy)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Step 5: Train-Test Split (80% Train, 20% Test)
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42, stratify=y)

    # Step 6: Create and Train Neural Network Model
    input_dim = X_train.shape[1]
    model = create_neural_network(input_dim)
    
    # Define callbacks for training
    early_stopping = EarlyStopping(
        monitor='val_loss',
        patience=5,
        restore_best_weights=True
    )
    
    model_dir = os.path.dirname(file_path)
    model_path = os.path.join(model_dir, "fraud_detection_nn")
    
    # Class weights to handle imbalanced data
    class_weight = {0: 1, 1: len(y_train[y_train == 0]) / len(y_train[y_train == 1])}
    
    # Train the model
    history = model.fit(
        X_train, y_train,
        epochs=50,
        batch_size=256,
        validation_split=0.2,
        callbacks=[early_stopping],
        class_weight=class_weight,
        verbose=1
    )

    # Step 7: Make Predictions
    y_pred_proba = model.predict(X_test)
    y_pred = (y_pred_proba > 0.5).astype(int).flatten()

    # Step 8: Evaluate Model Performance
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, output_dict=True)
    
    # Step 9: Save Trained Model
    model.save(model_path)
    joblib.dump(scaler, os.path.join(model_dir, "scaler.pkl"))
    
    # Return results
    results = {
        "accuracy": float(accuracy),
        "report": report,
        "model_path": model_path
    }
    
    return results

def analyze_transactions(file_path, model_path=None):
    """Analyze transactions using the neural network model"""
    # Load the model if provided, otherwise train a new one
    model_dir = os.path.dirname(file_path)
    
    if model_path and os.path.exists(model_path):
        model = load_model(model_path)
        scaler = joblib.load(os.path.join(model_dir, "scaler.pkl"))
    else:
        # Train model and get paths
        results = train_model(file_path)
        model_path = results["model_path"]
        model = load_model(model_path)
        scaler = joblib.load(os.path.join(model_dir, "scaler.pkl"))
    
    # Load and process the transactions to analyze
    chunksize = 100000
    df_list = []

    for chunk in pd.read_csv(file_path, chunksize=chunksize):
        df_list.append(chunk)

    df = pd.concat(df_list, ignore_index=True)
    
    # Ensure we have transaction IDs
    if "id" not in df.columns:
        df["id"] = [f"TX-{i}" for i in range(len(df))]
    
    # Fill missing values
    df.fillna(df.median(), inplace=True)
    
    # Extract features (assuming same structure as training data)
    X = df.drop(columns=["id", "Class"] if "Class" in df.columns else ["id"])
    
    # Scale features
    X_scaled = scaler.transform(X)
    
    # Make predictions
    probabilities = model.predict(X_scaled).flatten()
    predictions = (probabilities > 0.5).astype(int)
    
    # Create results
    results = []
    for i, (pred, prob) in enumerate(zip(predictions, probabilities)):
        if pred == 1 or prob > 0.3:  # Include high probability cases
            tx = df.iloc[i]
            
            # Determine reason based on neural network confidence
            if prob > 0.8:
                reason = "High confidence fraud detection"
            elif prob > 0.6:
                reason = "Medium confidence fraud detection"
            else:
                reason = "Low confidence fraud detection"
                
            # Add additional context if available
            if "amount" in tx and tx["amount"] > 1000:
                reason += " - High transaction amount"
            
            results.append({
                "id": tx["id"] if "id" in tx else f"TX-{i}",
                "amount": float(tx["amount"]) if "amount" in tx else 0.0,
                "merchant": tx["merchant"] if "merchant" in tx else "Unknown",
                "date": tx["date"] if "date" in tx else "Unknown",
                "probability": float(prob),
                "reason": reason
            })
    
    # Calculate summary statistics
    total = len(df)
    fraudulent = len(results)
    safe = total - fraudulent
    fraud_percentage = (fraudulent / total) * 100 if total > 0 else 0
    
    analysis_results = {
        "totalTransactions": total,
        "fraudulentTransactions": fraudulent,
        "safeTransactions": safe,
        "fraudPercentage": fraud_percentage,
        "detectedFrauds": results
    }
    
    return analysis_results

# Command line interface
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)
    
    file_path = sys.argv[1]
    model_path = sys.argv[2] if len(sys.argv) > 2 else None
    
    try:
        results = analyze_transactions(file_path, model_path)
        print(json.dumps(results))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
