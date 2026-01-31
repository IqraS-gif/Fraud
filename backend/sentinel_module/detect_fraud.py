import pandas as pd
import numpy as np
import joblib
from scipy import stats
import os

# Optional TensorFlow Import
try:
    import tensorflow as tf
    from tensorflow.keras.models import load_model
    from tensorflow.keras import layers, Model, backend as K
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False
    print("⚠️ TensorFlow not found. UPI Sentinel will be disabled.")

# --- 1. DEFINE CUSTOM LAYERS (Keep this just in case) ---
if TF_AVAILABLE:
    class Sampling(layers.Layer):
        def call(self, inputs):
            z_mean, z_log_var = inputs
            batch = tf.shape(z_mean)[0]
            dim = tf.shape(z_mean)[1]
            epsilon = K.random_normal(shape=(batch, dim))
            return z_mean + tf.exp(0.5 * z_log_var) * epsilon

    class VAE_Wrapper(Model):
        def __init__(self, encoder, decoder, **kwargs):
            super(VAE_Wrapper, self).__init__(**kwargs)
            self.encoder = encoder
            self.decoder = decoder
        
        def call(self, inputs):
            z_mean, z_log_var, z = self.encoder(inputs)
            return self.decoder(z)

# --- 2. THE ROBUST SENTINEL CLASS ---
class FraudSentinel:
    def __init__(self, model_path, scaler_path):
        """Initializes the Hybrid Fraud Engine."""
        if not TF_AVAILABLE:
            print("❌ Sentinel Disabled: TensorFlow missing.")
            self.disabled = True
            return

        print(f"Loading Sentinel VAE from {model_path}...")
        self.disabled = False
        
        # 1. Load the Model
        # We use compile=False because we don't need the optimizer/loss for inference
        try:
            self.model = load_model(
                model_path, 
                custom_objects={'Sampling': Sampling, 'VAE_Wrapper': VAE_Wrapper},
                compile=False 
            )
        except Exception as e:
            print(f"❌ Error loading Keras model: {e}")
            self.disabled = True # Disable if load fails
            return

        # 2. Load the Scaler
        self.scaler = joblib.load(scaler_path)
        
        # 3. Determine Model Structure (The Fix for your Error)
        self.mode = "end_to_end" # Default assumption
        
        try:
            # Try to find specific layers if they exist
            self.encoder = self.model.get_layer("encoder")
            self.decoder = self.model.get_layer("decoder")
            self.mode = "split"
            print("✅ Model loaded in SPLIT mode (Encoder/Decoder found).")
        except ValueError:
            # If "encoder" layer is missing, we treat the whole model as Input -> Output
            print("⚠️ Layer 'encoder' not found. Switching to END-TO-END mode (Input -> Reconstruction).")
            self.mode = "end_to_end"

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

        # --- LAYER 1: VELOCITY TRAP ---
        if 2 < time_gap < 30:
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
        
        # RECONSTRUCTION LOGIC (Handles both model types)
        if self.mode == "split":
            enc_out = self.encoder.predict(scaled_input, verbose=0)
            z = enc_out[0] if isinstance(enc_out, list) else enc_out
            reconstruction = self.decoder.predict(z, verbose=0)
        else:
            reconstruction = self.model.predict(scaled_input, verbose=0)
        
        # Calculate Error
        mse = np.mean(np.power(scaled_input - reconstruction, 2))
        
        # Calculate Risk Probability
        z_score = (mse - self.ERROR_MEAN) / self.ERROR_STD
        confidence = stats.norm.cdf(z_score) * 100
        confidence = min(99.99, max(0.01, confidence))

        # Final Decision
        if confidence > 99.9:
            return "BLOCKED", "AI_ANOMALY_DETECTED: Pattern is statistically impossible", confidence
        elif confidence > 95:
            return "FLAGGED", "SUSPICIOUS_ACTIVITY: Step-Up Auth Required", confidence
        else:
            return "APPROVED", "NORMAL_BEHAVIOR", confidence