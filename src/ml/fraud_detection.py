import pandas as pd
import numpy as np
import xgboost as xgb
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import sys
import json
import os

def train_model(file_path):
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
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

    # Step 6: Train XGBoost Model
    model = xgb.XGBClassifier(
        n_estimators=200,
        learning_rate=0.1,
        max_depth=6,
        scale_pos_weight=len(y_train[y_train == 0]) / len(y_train[y_train == 1]),  # Handle class imbalance
        eval_metric="logloss",
        use_label_encoder=False
    )

    model.fit(X_train, y_train)

    # Step 7: Make Predictions
    y_pred = model.predict(X_test)

    # Step 8: Evaluate Model Performance
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, output_dict=True)
    
    # Step 9: Save Trained Model
    model_path = os.path.join(os.path.dirname(file_path), "fraud_detection_xgboost.pkl")
    joblib.dump(model, model_path)
    joblib.dump(scaler, os.path.join(os.path.dirname(file_path), "scaler.pkl"))
    
    # Return results
    results = {
        "accuracy": float(accuracy),
        "report": report,
        "model_path": model_path
    }
    
    return results

def analyze_transactions(file_path, model_path=None):
    # Load the model if provided, otherwise train a new one
    if model_path and os.path.exists(model_path):
        model = joblib.load(model_path)
        scaler = joblib.load(os.path.join(os.path.dirname(model_path), "scaler.pkl"))
    else:
        # Train model and get paths
        results = train_model(file_path)
        model_path = results["model_path"]
        model = joblib.load(model_path)
        scaler = joblib.load(os.path.join(os.path.dirname(model_path), "scaler.pkl"))
    
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
    predictions = model.predict(X_scaled)
    probabilities = model.predict_proba(X_scaled)[:, 1]  # Probability of fraud
    
    # Create results
    results = []
    for i, (pred, prob) in enumerate(zip(predictions, probabilities)):
        if pred == 1 or prob > 0.3:  # Include high probability cases
            tx = df.iloc[i]
            reason = "High transaction amount" if "amount" in tx and tx["amount"] > 1000 else "Unusual pattern detected"
            
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
