import pandas as pd
import numpy as np
import os
import joblib
import json
from groq import Groq
from dotenv import load_dotenv

# Load API Key
load_dotenv()
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Constants
FEATURES_LGB = ['amount', 'transaction_type', 'merchant_category', 'location',
               'device_used', 'time_since_last_transaction', 'spending_deviation_score',
               'velocity_score', 'geo_anomaly_score', 'payment_channel']
CAT_COLS = ['transaction_type', 'merchant_category', 'location', 'device_used', 'payment_channel']
AE_FEATURES = ['amount', 'lat', 'long']

class NumPyBehaviorAE:
    """Lightweight Autoencoder using pure NumPy for inference."""
    def __init__(self, weights):
        self.enc_w = np.array(weights['enc_w']).T  # Transpose for np.dot (Input x Hidden) vs torch (Hidden x Input)
        self.enc_b = np.array(weights['enc_b'])
        self.dec_w = np.array(weights['dec_w']).T
        self.dec_b = np.array(weights['dec_b'])
        self.scaler_mean = np.array(weights['scaler_mean'])
        self.scaler_scale = np.array(weights['scaler_scale'])

    def predict(self, x):
        # 1. Scale
        scaled_x = (x - self.scaler_mean) / self.scaler_scale
        
        # 2. Encoder (Linear -> ReLU)
        # PyTorch Linear(x) = x @ W.T + b. 
        # Our stored W is (Out, In). So W.T is (In, Out). 
        # But wait, torch linear stores weights as (OutFeatures, InFeatures).
        # x is (Batch, InFeatures).
        # x @ W.T = (Batch, In) @ (In, Out) = (Batch, Out).
        # I transposed it in __init__ assuming standard dot product.
        # Let's verify: 
        # stored 'enc_w' is from model.encoder[0].weight -> shape (2, 3).
        # x is (1, 3).
        # We want (1, 2).
        # x @ W.T = (1, 3) @ (3, 2) = (1, 2). Correct.
        
        z = np.dot(scaled_x, self.enc_w) + self.enc_b
        z = np.maximum(0, z) # ReLU
        
        # 3. Decoder (Linear)
        recon = np.dot(z, self.dec_w) + self.dec_b
        
        return recon, scaled_x

    def get_mse(self, x):
        recon, scaled_x = self.predict(x)
        return np.mean((scaled_x - recon)**2)

class HybridFraudModel:
    def __init__(self):
        self.lgb_model = None
        self.user_aes = {}
        self.label_encoders = {}
        self.data_dir = os.path.join(os.path.dirname(__file__), 'data')
        self.models_dir = os.path.join(os.path.dirname(__file__), 'models')

    def load_models(self):
        """Attempts to load pre-trained models from disk."""
        print(f"🔄 Loading existing models from: {self.models_dir}")
        try:
            # 1. Load LightGBM
            lgb_path = os.path.join(self.models_dir, 'lgb_model.txt')
            if os.path.exists(lgb_path):
                import lightgbm as lgb
                self.lgb_model = lgb.Booster(model_file=lgb_path)
                print("✅ LightGBM loaded.")
            else:
                print("⚠️ LightGBM model file not found.")
                return False

            # 2. Load Autoencoder Weights (JSON)
            ae_path = os.path.join(self.models_dir, 'ae_weights.json')
            if os.path.exists(ae_path):
                with open(ae_path, 'r') as f:
                    weights_data = json.load(f)
                
                self.user_aes = {}
                for user, weights in weights_data.items():
                    self.user_aes[user] = NumPyBehaviorAE(weights)
                print(f"✅ Loaded {len(self.user_aes)} Autoencoder profiles.")
            else:
                print("⚠️ Autoencoder weights not found.")
                return False

            # 3. Load Label Encoders
            le_path = os.path.join(self.models_dir, 'label_encoders.joblib')
            if os.path.exists(le_path):
                self.label_encoders = joblib.load(le_path)
                print("✅ Label Encoders loaded.")
            else:
                print("⚠️ Label Encoders not found.")
                return False
            
            return True

        except Exception as e:
            print(f"❌ Error loading models: {e}")
            return False

    def train_models(self):
        """Fallback to in-memory training (DEV ONLY)."""
        print("⚠️ Artifacts missing. Falling back to IN-MEMORY TRAINING (Slow!)...")
        # Lazy import heavies
        try:
            import lightgbm as lgb
            import torch
            import torch.nn as nn
            import torch.optim as optim
            from sklearn.model_selection import train_test_split
            from sklearn.preprocessing import LabelEncoder, StandardScaler
            from sklearn.metrics import accuracy_score
            
            # Re-define classes here roughly just to make it run if really needed
            # But actually, better to just raise error in production if this is called.
            # For now, let's just warn and skip or implement a basic fallback?
            # Creating the full training logic here again duplicates logic from train_and_save.
            # Let's import the script instead!
            
            from train_and_save import train_and_save
            train_and_save()
            
            # Now load them
            if not self.load_models():
                raise RuntimeError("Training failed to produce valid models.")

        except ImportError:
            print("❌ CRITICAL: Cannot train models because dev dependencies (torch, lightgbm) are missing.")
            print("👉 Please run 'python backend/train_and_save.py' locally and upload 'backend/models/' folder.")

    def generate_ai_reasoning(self, tx_dict, p_fraud, recon_error, risk_level, language='en'):
        """Uses Groq to generate a natural language explanation."""
        try:
            prompt = f"""
            As a Financial Fraud Expert, provide a human-understandable explanation for this transaction analysis:
            
            TRANSACTION DATA:
            - User: {tx_dict.get('user_id', 'Unknown')}
            - Amount: ₹{tx_dict.get('amount')}
            - Location: {tx_dict.get('location')}
            - Category: {tx_dict.get('merchant_category')}
            - Device: {tx_dict.get('device_used')}
            
            ANALYTICS:
            - Risk Level: {risk_level}
            - Fraud Probability (LightGBM): {p_fraud*100:.1f}%
            - Behavioral Anomaly Score (Autoencoder): {recon_error:.4f}
            
            INSTRUCTIONS:
            Provide exactly 2-3 bullet points explaining why this was flagged as {risk_level} risk. 
            - Mention specific behaviors (e.g., "The amount is significantly higher than the user's daily ₹400 average").
            - Mention location or device anomalies if the scores are high.
            - Keep it simple and direct. Use "-" for bullets.
            - IMPORTANT: Do NOT use any Markdown formatting like **bold** or __italic__. Use plain text only.
            """

            if language == 'hi':
                prompt += """
                CRITICAL INSTRUCTION:
                OUTPUT MUST BE IN HINDI (हिन्दी).
                Translate the reasoning to simple, easy-to-understand Hindi suitable for Indian banking users.
                Do NOT output English.
                """
            
            completion = groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=250
            )
            return completion.choices[0].message.content.strip()
        except Exception as e:
            print(f"Groq Error: {e}")
            return "Analysis based on hybrid matching of general fraud signatures and personal behavioral deviations."

    def predict(self, tx_dict, user_id, language='en'):
        if not self.lgb_model:
            return {"error": "Models not loaded. Server is starting up or in bad state."}

        test_df = pd.DataFrame([tx_dict])
        
        # 1. LightGBM Logic
        # We need to construct input array for LGBM Booster
        # If we use Booster, we prefer a Dataset or list of lists
        # But we need to handle categorical encoding first
        
        lgb_input = test_df[FEATURES_LGB].copy()
        
        # Transform categories manually using loaded SafeLabelEncoders
        # Note: In the training script, we wrote a helper class. 
        # joblib loaded object is a DICT of these SafeLabelEncoder objects.
        # But wait, SafeLabelEncoder class needs to be defined if we pickled the object itself!
        # Good point. Joblib persistence of custom classes requires the class to be available.
        # I defined SafeLabelEncoder in train_and_save.py.
        # To make it loadable here easily, I should define it here too? 
        # Actually, for robustness, I used joblib on the DICT. 
        # But the objects INSIDE the dict are instances of SafeLabelEncoder.
        # This might cause an ImportError during load if SafeLabelEncoder is not found validly.
        # Let's add a SafeLabelEncoder definition here matching the one in train_and_save.py.
        
        for col in CAT_COLS:
            if col in self.label_encoders:
                # We expect self.label_encoders[col] to have a .transform() method
                sle = self.label_encoders[col]
                # Re-implement safe transform if the object method fails or is weird,
                # but usually joblib works if class structure is same.
                lgb_input[col] = sle.transform(lgb_input[col])
        
        # Convert to numpy array for Booster
        # LightGBM booster.predict expects 2D array or file
        p_fraud = self.lgb_model.predict(lgb_input)[0]

        # 2. AE Logic (NumPy)
        if user_id in self.user_aes:
            ae = self.user_aes[user_id]
            # Select features
            ae_input = test_df[AE_FEATURES].values # Shape (1, 3)
            recon_error = ae.get_mse(ae_input)
        else:
            recon_error = 0.0

        # 3. Risk Level
        risk_level = "Low"
        if p_fraud > 0.7 or recon_error > 1.0:
            risk_level = "Critical"
        elif p_fraud > 0.3 or recon_error > 0.3:
            risk_level = "High"

        # 4. Groq Reasoning
        reasoning = self.generate_ai_reasoning(tx_dict, p_fraud, recon_error, risk_level, language)

        return {
            "fraud_probability": float(p_fraud),
            "anomaly_score": float(recon_error),
            "is_blocked": bool(p_fraud > 0.85 or recon_error > 2.0),
            "risk_level": risk_level,
            "reasoning": reasoning
        }

# Class definition for Pickling compatibility
class SafeLabelEncoder:
    def __init__(self):
        from sklearn.preprocessing import LabelEncoder
        self.le = LabelEncoder()
        self.classes_ = None

    def fit(self, series):
        self.le.fit(series.astype(str))
        self.classes_ = set(self.le.classes_)
        return self

    def transform(self, series):
        safe_series = series.astype(str).apply(lambda x: x if x in self.classes_ else list(self.classes_)[0])
        return self.le.transform(safe_series)

# Singleton instance
hybrid_model = HybridFraudModel()

