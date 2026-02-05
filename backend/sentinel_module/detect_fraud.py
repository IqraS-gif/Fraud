import pandas as pd
import numpy as np
import joblib
from scipy import stats
import os

import json
# Removed TensorFlow imports to make it lightweight
TF_AVAILABLE = False

class NumPyVAE:
    """Lightweight VAE Inference using pure NumPy."""
    def __init__(self, weights_path):
        with open(weights_path, 'r') as f:
            weights_data = json.load(f)
        self.layers = weights_data.get("all_layers", [])
        if not self.layers:
            # Handle split mode if it was preserved that way
            enc = weights_data.get("encoder_layers", [])
            dec = weights_data.get("decoder_layers", [])
            self.layers = enc + dec

    def predict(self, x):
        out = x
        for layer in self.layers:
            w = np.array(layer["w"])
            b = np.array(layer["b"])
            out = np.dot(out, w) + b
            if layer["activation"] == "relu":
                out = np.maximum(0, out)
            elif layer["activation"] == "sigmoid":
                out = 1 / (1 + np.exp(-out))
        return out

# --- 2. THE ROBUST SENTINEL CLASS ---
class FraudSentinel:
    def __init__(self, weights_path, scaler_path):
        """Initializes the Hybrid Fraud Engine with NumPy."""
        print(f"Loading Sentinel Weights from {weights_path}...")
        self.disabled = False
        
        try:
            # 1. Load the Model via NumPy
            if not os.path.exists(weights_path):
                 # Try fallback to backend/models/ if path is relative or from different CWD
                 base = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
                 weights_path = os.path.join(base, "upi_weights.json")

            self.model = NumPyVAE(weights_path)
            print("✅ Sentinel VAE (NumPy) loaded.")
        except Exception as e:
            print(f"❌ Error loading VAE weights: {e}")
            self.disabled = True
            return

        # 2. Load the Scaler
        try:
            self.scaler = joblib.load(scaler_path)
        except Exception as e:
            print(f"❌ Error loading Sentinel Scaler: {e}")
            self.disabled = True
            return
        
        # Calibration Stats (Hardcoded from Phase 20)
        self.ERROR_MEAN = 0.002153
        self.ERROR_STD = 0.007513
        
        print("✅ Sentinel System Online.")

    def predict(self, user_id, amount, time_gap, daily_total, user_limit=50000):
        """
        Analyze transaction with user context.
        user_limit: The user's daily limit (50000 for personal, 1000000 for business)
        """
        if getattr(self, 'disabled', False):
            # Fallback if TF is missing
            return "APPROVED", "Sentinel Offline (Lightweight Mode)", 0.0

        # Determine if this is a business user (higher limit = business)
        is_business = user_limit >= 500000
        
        # Check if this is likely a first transaction (time_gap >= 3600 means no recent history)
        is_first_transaction = time_gap >= 3600

        # --- LAYER 1: VELOCITY TRAP ---
        # Only apply velocity check if user has recent transaction history
        # Skip for first transactions (no history = can't judge velocity)
        if not is_first_transaction and 2 < time_gap < 15:
            return "BLOCKED", f"VELOCITY_VIOLATION: Speed limit breached ({time_gap}s gap)", 100.0

        # --- LAYER 2: VAE BRAIN (Context-Aware) ---
        # Normalize amount and daily_total relative to user's limit
        # This makes ₹400k normal for a business user (40% of limit)
        # but anomalous for a personal user (800% of limit)
        normalized_amount = (amount / user_limit) * 50000  # Scale to base limit
        normalized_daily = (daily_total / user_limit) * 50000
        
        # Feature Engineering with normalized values
        log_vel = np.log1p(normalized_amount / (time_gap + 1))
        features = pd.DataFrame([[normalized_amount, time_gap, log_vel, normalized_amount, normalized_daily]], 
                                columns=['amount_inr', 'time_since_last_txn', 'log_velocity', 'amt_1h', 'amt_24h'])
        
        # Inference
        scaled_input = self.scaler.transform(features)
        
        # RECONSTRUCTION LOGIC (NumPy)
        reconstruction = self.model.predict(scaled_input[0])
        # Reshape to match scaled_input for MSE calc
        reconstruction = reconstruction.reshape(1, -1)
        
        # Calculate Error
        mse = np.mean(np.power(scaled_input - reconstruction, 2))
        
        # Calculate Risk Probability with adjusted thresholds
        # Use more relaxed thresholds for business users
        error_mean = self.ERROR_MEAN
        error_std = self.ERROR_STD * (2.0 if is_business else 1.0)  # Business gets 2x tolerance
        
        z_score = (mse - error_mean) / error_std
        # Cap z-score to prevent extreme confidence values
        z_score = min(z_score, 4.0)  # Cap at 4 standard deviations
        
        confidence = stats.norm.cdf(z_score) * 100
        confidence = min(99.99, max(0.01, confidence))

        # Final Decision with user-type aware thresholds
        # Business users have higher thresholds before blocking
        block_threshold = 99.95 if is_business else 99.9
        flag_threshold = 98 if is_business else 95
        
        if confidence > block_threshold:
            return "BLOCKED", "AI_ANOMALY_DETECTED: Pattern is statistically impossible", confidence
        elif confidence > flag_threshold:
            return "FLAGGED", "SUSPICIOUS_ACTIVITY: Step-Up Auth Required", confidence
        else:
            return "APPROVED", "NORMAL_BEHAVIOR", confidence