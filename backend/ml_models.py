import pandas as pd
import numpy as np
import os
import joblib
import json
from groq import Groq
from dotenv import load_dotenv

# Import shared utils
try:
    from ml_utils import SafeLabelEncoder, FEATURES_LGB, CAT_COLS, AE_FEATURES
except ImportError:
    from backend.ml_utils import SafeLabelEncoder, FEATURES_LGB, CAT_COLS, AE_FEATURES

# Load API Key
load_dotenv()
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

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
                try:
                    import lightgbm as lgb
                    self.lgb_model = lgb.Booster(model_file=lgb_path)
                    print("✅ LightGBM loaded.")
                except  (ImportError, OSError) as ie:
                    print(f"❌ LightGBM library missing or broken (libgomp?): {ie}")
                    print("⚠️ proceeding with LightGBM DISABLED.")
                    self.lgb_model = None
                except Exception as e:
                    print(f"❌ Error loading LightGBM model file: {e}")
                    self.lgb_model = None
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
                try:
                    self.label_encoders = joblib.load(le_path)
                    print("✅ Label Encoders loaded.")
                except Exception as e:
                    print(f"❌ Error loading Label Encoders (Class mismatch?): {e}")
                    return False
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
        try:
            from train_and_save import train_and_save
            train_and_save()
            if not self.load_models():
                raise RuntimeError("Training failed to produce valid models.")
        except ImportError:
            print("❌ CRITICAL: Cannot train models because dev dependencies are missing.")
            print("👉 Please run 'python backend/train_and_save.py' locally.")

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
            # Fallback for LGBM disabled
            p_fraud = 0.0 # Default if model broken
        else:
            test_df = pd.DataFrame([tx_dict])
            lgb_input = test_df[FEATURES_LGB].copy()
            for col in CAT_COLS:
                if col in self.label_encoders:
                    sle = self.label_encoders[col]
                    lgb_input[col] = sle.transform(lgb_input[col])
            
            try:
                p_fraud = self.lgb_model.predict(lgb_input)[0]
            except Exception as e:
                print(f"LGBM Prediction Error: {e}")
                p_fraud = 0.0

        # AE Logic (NumPy)
        test_df = pd.DataFrame([tx_dict])
        if user_id in self.user_aes:
            ae = self.user_aes[user_id]
            ae_input = test_df[AE_FEATURES].values
            recon_error = ae.get_mse(ae_input)
        else:
            recon_error = 0.0

        # Risk Level
        risk_level = "Low"
        if p_fraud > 0.7 or recon_error > 1.0:
            risk_level = "Critical"
        elif p_fraud > 0.3 or recon_error > 0.3:
            risk_level = "High"

        reasoning = self.generate_ai_reasoning(tx_dict, p_fraud, recon_error, risk_level, language)

        return {
            "fraud_probability": float(p_fraud),
            "anomaly_score": float(recon_error),
            "is_blocked": bool(p_fraud > 0.85 or recon_error > 2.0),
            "risk_level": risk_level,
            "reasoning": reasoning
        }

# Singleton instance
hybrid_model = HybridFraudModel()

