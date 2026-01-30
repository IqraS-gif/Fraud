import pandas as pd
import numpy as np
import lightgbm as lgb
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score
import os
import joblib
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

class BehaviorAE(nn.Module):
    def __init__(self, input_dim):
        super(BehaviorAE, self).__init__()
        self.encoder = nn.Sequential(nn.Linear(input_dim, 2), nn.ReLU())
        self.decoder = nn.Sequential(nn.Linear(2, input_dim))
    def forward(self, x):
        return self.decoder(self.encoder(x))

class SafeLabelEncoder:
    def __init__(self):
        self.le = LabelEncoder()
        self.classes_ = None

    def fit(self, series):
        self.le.fit(series.astype(str))
        self.classes_ = set(self.le.classes_)
        return self

    def transform(self, series):
        # Map unseen labels to the first class or a special index if exists
        # For simplicity, we'll map to the first class if unknown
        safe_series = series.astype(str).apply(lambda x: x if x in self.classes_ else list(self.classes_)[0])
        return self.le.transform(safe_series)

class HybridFraudModel:
    def __init__(self):
        self.lgb_model = None
        self.user_models = {}
        self.label_encoders = {}
        self.df_a = None
        self.data_dir = os.path.join(os.path.dirname(__file__), 'data')

    def train_models(self):
        print("Training LightGBM (General Brain)...")
        df_a_path = os.path.join(self.data_dir, 'janani_dataset_A_final (1).csv')
        self.df_a = pd.read_csv(df_a_path)
        
        X = self.df_a[FEATURES_LGB].copy()
        y = self.df_a['is_fraud']

        for col in CAT_COLS:
            sle = SafeLabelEncoder()
            sle.fit(X[col])
            X[col] = sle.transform(X[col])
            self.label_encoders[col] = sle

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        train_ds = lgb.Dataset(X_train, label=y_train, categorical_feature=CAT_COLS)
        params = {'objective': 'binary', 'metric': 'auc', 'verbose': -1, 'learning_rate': 0.05}
        self.lgb_model = lgb.train(params, train_ds, num_boost_round=100)
        
        acc = accuracy_score(y_test, (self.lgb_model.predict(X_test) > 0.5))
        print(f"LightGBM Training Complete. Test Accuracy: {acc:.2%}")

        print("Training Autoencoders (Personal Lens)...")
        df_b_path = os.path.join(self.data_dir, 'transactions_700.csv')
        df_b = pd.read_csv(df_b_path)

        for user in df_b['sender_account'].unique():
            user_data = df_b[df_b['sender_account'] == user][AE_FEATURES].values
            if len(user_data) < 5: continue # Skip if too little data
            
            scaler = StandardScaler()
            scaled_data = torch.FloatTensor(scaler.fit_transform(user_data))

            model = BehaviorAE(input_dim=len(AE_FEATURES))
            optimizer = optim.Adam(model.parameters(), lr=0.01)
            criterion = nn.MSELoss()

            for epoch in range(100):
                output = model(scaled_data)
                loss = criterion(output, scaled_data)
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()

            self.user_models[user] = {'model': model, 'scaler': scaler}
            print(f"Autoencoder trained for {user} (Baseline MSE: {loss.item():.6f})")

    def generate_ai_reasoning(self, tx_dict, p_fraud, recon_error, risk_level, language='en'):
        """Uses Groq to generate a natural language explanation with bullet points."""
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
        test_df = pd.DataFrame([tx_dict])
        
        # 1. LightGBM Logic
        lgb_input = test_df[FEATURES_LGB].copy()
        for col in CAT_COLS:
            if col in self.label_encoders:
                le = self.label_encoders[col]
                lgb_input[col] = le.transform(lgb_input[col].astype(str))
        
        p_fraud = self.lgb_model.predict(lgb_input)[0]

        # 2. AE Logic
        user_info = self.user_models.get(user_id)
        if user_info:
            scaled_val = torch.FloatTensor(user_info['scaler'].transform(test_df[AE_FEATURES]))
            recon = user_info['model'](scaled_val)
            recon_error = torch.mean((scaled_val - recon)**2).item()
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

# Singleton instance
hybrid_model = HybridFraudModel()
