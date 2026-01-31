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

# Import shared utils to ensure consistent class paths for pickling
try:
    from ml_utils import SafeLabelEncoder, FEATURES_LGB, CAT_COLS, AE_FEATURES
except ImportError:
    # Handle running as script from root
    from backend.ml_utils import SafeLabelEncoder, FEATURES_LGB, CAT_COLS, AE_FEATURES

# --- CONFIG ---
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(MODELS_DIR, exist_ok=True)

class BehaviorAE(nn.Module):
    def __init__(self, input_dim):
        super(BehaviorAE, self).__init__()
        self.encoder = nn.Sequential(nn.Linear(input_dim, 2), nn.ReLU())
        self.decoder = nn.Sequential(nn.Linear(2, input_dim))
    def forward(self, x):
        return self.decoder(self.encoder(x))

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
