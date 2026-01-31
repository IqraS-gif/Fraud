import os
import pandas as pd
import numpy as np
import lightgbm as lgb
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score
import joblib
import json

# --- CONFIG ---
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(MODELS_DIR, exist_ok=True)

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
        safe_series = series.astype(str).apply(lambda x: x if x in self.classes_ else list(self.classes_)[0])
        return self.le.transform(safe_series)

def train_and_save():
    print("🚀 Starting Local Training...")
    
    # --- 1. Train LightGBM ---
    print("Training LightGBM...")
    df_a_path = os.path.join(DATA_DIR, 'janani_dataset_A_final (1).csv')
    if not os.path.exists(df_a_path):
        raise FileNotFoundError(f"Dataset not found: {df_a_path}")
        
    df_a = pd.read_csv(df_a_path)
    X = df_a[FEATURES_LGB].copy()
    y = df_a['is_fraud']

    label_encoders = {}
    for col in CAT_COLS:
        sle = SafeLabelEncoder()
        sle.fit(X[col])
        X[col] = sle.transform(X[col])
        label_encoders[col] = sle

    # Save Encoders
    joblib.dump(label_encoders, os.path.join(MODELS_DIR, 'label_encoders.joblib'))
    print("✅ Label Encoders saved.")

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    train_ds = lgb.Dataset(X_train, label=y_train, categorical_feature=CAT_COLS)
    params = {'objective': 'binary', 'metric': 'auc', 'verbose': -1, 'learning_rate': 0.05}
    lgb_model = lgb.train(params, train_ds, num_boost_round=100)
    
    # Save LightGBM
    lgb_model.save_model(os.path.join(MODELS_DIR, 'lgb_model.txt'))
    print("✅ LightGBM model saved.")

    # --- 2. Train Autoencoders ---
    print("Training Autoencoders...")
    df_b_path = os.path.join(DATA_DIR, 'transactions_700.csv')
    df_b = pd.read_csv(df_b_path)

    ae_weights = {}

    for user in df_b['sender_account'].unique():
        user_data = df_b[df_b['sender_account'] == user][AE_FEATURES].values
        if len(user_data) < 5: continue 
        
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

        # Extract Weights for NumPy Inference
        # Structure: Encoder [W1, b1], Decoder [W2, b2]
        # model.encoder[0] is Linear(3, 2) -> W (2x3), b (2)
        # model.decoder[0] is Linear(2, 3) -> W (3x2), b (3)
        
        user_weights = {
            "enc_w": model.encoder[0].weight.detach().numpy().tolist(),
            "enc_b": model.encoder[0].bias.detach().numpy().tolist(),
            "dec_w": model.decoder[0].weight.detach().numpy().tolist(),
            "dec_b": model.decoder[0].bias.detach().numpy().tolist(),
            "scaler_mean": scaler.mean_.tolist(),
            "scaler_scale": scaler.scale_.tolist()
        }
        ae_weights[str(user)] = user_weights
    
    # Save AE Weights
    with open(os.path.join(MODELS_DIR, 'ae_weights.json'), 'w') as f:
        json.dump(ae_weights, f)
    print(f"✅ Autoencoder weights saved for {len(ae_weights)} users.")

    print("\n🎉 Training Complete! Artifacts are in backend/models/")

if __name__ == "__main__":
    train_and_save()
