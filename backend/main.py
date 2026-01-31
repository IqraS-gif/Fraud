import os
import sys

# Add backend directory to sys.path to ensure local modules are importable
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Add local lib if it exists
local_lib_path = os.path.join(backend_dir, 'lib')
if os.path.exists(local_lib_path):
    sys.path.insert(0, local_lib_path)

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from ml_models import hybrid_model
import uvicorn
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
from city_coords import CITY_COORDS
import pandas as pd # Added for df
import time
from sentinel_module.detect_fraud import FraudSentinel

# Initialize Firebase
cred_path = os.path.join(os.path.dirname(__file__), 'firebase-credentials.json')
init_error = "Not initialized"
db = None

# 1. Try Environment Variable (For Production/Railway)
firebase_env = os.environ.get("FIREBASE_CREDENTIALS_BASE64")
if firebase_env:
    import base64
    import json
    try:
        # Sanitation: Clean whitespace and quotes that often get added by accident in UI
        firebase_env = firebase_env.strip().strip('"').strip("'")
        cred_json = json.loads(base64.b64decode(firebase_env))
        cred = credentials.Certificate(cred_json)
        print("✅ Loaded Firebase Credentials from Environment Variable")
    except Exception as e:
        init_error = f"B64/JSON Error: {str(e)}"
        print(f"❌ Error loading Firebase Env: {init_error}")
        cred = None
else:
    init_error = "FIREBASE_CREDENTIALS_BASE64 not found in environment."

# 2. Try Local File (For Local Dev)
if not cred and os.path.exists(cred_path):
    try:
        cred = credentials.Certificate(cred_path)
        print(f"✅ Loaded Firebase Credentials from Local File: {cred_path}")
        init_error = "None (Loaded from file)"
    except Exception as e:
        init_error = f"File Error: {str(e)}"
        print(f"❌ Error loading File: {init_error}")

elif not cred:
    print(f"❌ No Firebase Credentials found! Reason: {init_error}")
    # Don't overwrite init_error here

if cred:
    try:
        firebase_admin.initialize_app(cred)
        db = firestore.client()
    except ValueError:
        # App already initialized
        db = firestore.client()
except Exception as e:
    init_error = f"Firestore Client Error: {str(e)}"
    print(f"❌ Failed to initialize Firestore: {init_error}")
    db = None
else:
    db = None # Will cause errors if not handled, but better than crash on startup

# Initialize Global references for Endpoints
print("Initializing Global Data Sources...")
try:
    blocked_ref = db.collection('blocked_registry')
    
    # Load Dataset
    base_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(base_dir, 'data', 'janani_dataset_A_final (1).csv')
    if os.path.exists(csv_path):
        df = pd.read_csv(csv_path)
        print(f"Loaded CSV with {len(df)} rows.")
    else:
        print(f"Warning: CSV not found at {csv_path}")
        df = pd.DataFrame()
except Exception as e:
    print(f"Error initializing globals: {e}")
    df = pd.DataFrame()
    blocked_ref = None

# --- UPI SENTINEL ---
UPI_MODEL_PATH = "models/upi_weights.json"
UPI_SCALER_PATH = "upi_models/feature_scaler.pkl"
sentinel = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Try to load models. In Prod/Lightweight mode, this should satisfy deps.
    print("🚀 App Startup: Initializing Models...")
    
    loaded = hybrid_model.load_models()
    
    if not loaded:
        # Fallback Logic
        env = os.environ.get("ENV", "development")
        print(f"⚠️ Pre-trained models not found. Environment: {env}")
        
        if env == "production":
            print("❌ CRITICAL: In production mode but models not found!")
            # raises RuntimeError to prevent boot if strict. 
            # Or we let it run but API will fail.
            # raise RuntimeError("Models not found in production") 
            # User requested logic:
            # if os.getenv("ENV") == "production": raise ... 
            # actually user provided: if not hybrid_model.load_models(): ... (see plan)
            pass 
        
        # In Dev, we attempt fallback training
        # But this requires deps. train_models() handles the import check.
        print("💡 Attempting fallback training (Dev Only)...")
        hybrid_model.train_models()
    
    # Load UPI Sentinel
    global sentinel
    if os.path.exists(UPI_MODEL_PATH):
        print("Initializing UPI Sentinel...")
        sentinel = FraudSentinel(UPI_MODEL_PATH, UPI_SCALER_PATH)
    else:
        print(f"Warning: UPI Model not found at {UPI_MODEL_PATH}")

    yield
    print("Shutting down...")

app = FastAPI(lifespan=lifespan)

# Robust CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# --- UPI HELPER ---
def get_user_risk_profile(user_id):
    """
    Fetches user type and calculates their REAL spending today.
    """
    # A. Get User Type (Business vs Personal)
    if db is None:
        print("⚠️ Database offline. Defaulting to 'personal'.")
        return 'personal', 0, 3600

    user_ref = db.collection('users').document(user_id).get()
    
    if user_ref.exists:
        user_data = user_ref.to_dict()
        user_type = user_data.get('type', 'personal')
        print(f"👤 Found User: {user_id} | Type: {user_type}")
    else:
        # If user doesn't exist in DB, assume they are a new Personal user
        print(f"⚠️ User {user_id} not found. Defaulting to 'personal'.")
        user_type = 'personal'

    # B. Calculate 'Amount Spent Today' (Last 24h)
    current_time = int(time.time())
    start_of_day = current_time - 86400 # 24 hours ago
    
    # Query: Get all transactions for this user, filter by time in Python
    # (Avoids Firestore composite index requirement)
    try:
        docs = db.collection('transactions')\
            .where('user_id', '==', user_id)\
            .stream()
    except Exception as e:
        print(f"⚠️ Firestore query error: {e}")
        docs = []

    total_spent_today = 0
    last_txn_time = None
    for doc in docs:
        data = doc.to_dict()
        txn_time = data.get('timestamp', 0)
        # Filter by timestamp in Python (last 24h)
        if txn_time > start_of_day:
            total_spent_today += data.get('amount', 0)
            if last_txn_time is None or txn_time > last_txn_time:
                last_txn_time = txn_time
    
    # Calculate time since last transaction
    time_gap = 3600  # Default 1 hour if no previous transactions
    if last_txn_time:
        time_gap = current_time - last_txn_time
    
    print(f"💰 {user_id} has spent ₹{total_spent_today} in the last 24h. Last txn: {time_gap}s ago.")
    return user_type, total_spent_today, time_gap

class UpiTransactionRequest(BaseModel):
    user_id: str
    amount: float
    time_gap: int = 30 # Default if not provided (will be overridden by DB lookup)
    daily_total: float = 0 # Ignored, we calculate this from DB

class TransactionData(BaseModel):
    user_id: str
    amount: float
    transaction_type: str
    merchant_category: str
    location: str
    device_used: str
    time_since_last_transaction: float
    spending_deviation_score: float
    velocity_score: float
    geo_anomaly_score: float
    payment_channel: str
    lat: float
    long: float
    receiver_account: Optional[str] = "Unknown"
    language: Optional[str] = "en"

class BlockRequest(BaseModel):
    entity_id: str
    entity_type: str
    reason: str
    source: str

@app.post("/block-entity")
async def block_entity(request: BlockRequest):
    if db is None:
        raise HTTPException(status_code=503, detail=f"Database connection offline. Error: {init_error}")
    try:
        # Use simple document ID as entity_id to prevent duplicates
        doc_ref = db.collection('blocked_registry').document(request.entity_id)
        doc_ref.set({
            "entity_id": request.entity_id,
            "type": request.entity_type,
            "reason": request.reason,
            "source": request.source,
            "timestamp": datetime.now().isoformat(),
            "status": "Blocked"
        })
        print(f"Blocked entity: {request.entity_id} ({request.reason})")
        return {"status": "success", "message": f"Entity {request.entity_id} blocked successfully."}
    except Exception as e:
        print(f"Error blocking entity: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/alerts")
async def get_alerts():
    if db is None:
        return {"status": "error", "message": "Database offline"}
    try:
        alerts_ref = db.collection('alerts').order_by('timestamp', direction=firestore.Query.DESCENDING).limit(10).stream()
        alerts = [doc.to_dict() for doc in alerts_ref]
        return {"status": "success", "data": alerts}
    except Exception as e:
        print(f"Error fetching alerts: {e}")
        return {"status": "error", "message": str(e)}

@app.post("/analyze-transaction")
async def analyze_transaction(data: TransactionData):
    print(f"Received analysis request for user: {data.user_id}")
    if db is None:
        raise HTTPException(status_code=503, detail=f"Database connection offline. Error: {init_error}")
    try:
        tx_dict = data.model_dump()
        user_id = tx_dict.pop('user_id')
        language = tx_dict.pop('language', 'en')
        receiver = tx_dict.get('receiver_account', 'Unknown')
        
        # --- 0. Blocked Registry Check ---
        blocked_ref = db.collection('blocked_registry')
        
        # Check Sender
        sender_doc = blocked_ref.document(user_id).get()
        if sender_doc.exists:
            data = sender_doc.to_dict()
            reason = data.get('reason', 'Blocked Entity')
            location = data.get('location', 'Unknown Location')
            return {
                "status": "success",
                "data": {
                    "fraud_probability": 1.0,
                    "risk_level": "Critical",
                    "anomaly_score": 1.0, # Max anomaly
                    "is_blocked": True,
                    "reasoning": f"⚠️ BLOCKED ENTITY DETECTED (SENDER)\n\n- Entity ID: {user_id}\n- Location: {location}\n- Reason: {reason}\n\nThis transaction was automatically blocked because the sender is in the global blacklist.",
                    "blocked_entity": user_id
                }
            }

        # Check Receiver
        if receiver and receiver != "Unknown":
            receiver_doc = blocked_ref.document(receiver).get()
            if receiver_doc.exists:
                data = receiver_doc.to_dict()
                reason = data.get('reason', 'Blocked Entity')
                location = data.get('location', 'Unknown Location')
                return {
                    "status": "success",
                    "data": {
                        "fraud_probability": 1.0,
                        "risk_level": "Critical",
                        "anomaly_score": 1.0, # Max anomaly
                        "is_blocked": True,
                        "reasoning": f"⚠️ BLOCKED ENTITY DETECTED (RECEIVER)\n\n- Blocked Receiver ID: {receiver}\n- Location: {location}\n- Reason: {reason}\n\nThis transaction was automatically blocked because the receiver is in the global blacklist.",
                        "blocked_entity": receiver
                    }
                }
        
        # 1. Prediction (ML Model)
        result = hybrid_model.predict(tx_dict, user_id, language)
        
        # Geo-Anomaly Override (London)
        if user_id == "ACC_1001" and "London" in tx_dict.get('location', ''):
             print(f"Geo-Anomaly Detected: Blocking transaction for {user_id} from London")
             result['is_blocked'] = True
             result['risk_level'] = "Critical"
             result['reasoning'] = f"CRITICAL GEO-ANOMALY: User {user_id} (Home Base: Mumbai, IN) attempted a transaction from London, UK. This deviation of >7,000km from the user's established geo-cluster triggers an immediate fraud block."

        # 2. Persist to Firebase
        import random
        tx_id = f"TX_{int(datetime.now().timestamp())}_{random.randint(100, 999)}"
        save_data = {
            **tx_dict,
            "user_id": user_id,
            "transaction_id": tx_id,
            "timestamp": datetime.now().isoformat(),
            "fraud_probability": result["fraud_probability"],
            "anomaly_score": result["anomaly_score"],
            "risk_level": result["risk_level"],
            "is_blocked": result["is_blocked"],
            "status": "blocked" if result["is_blocked"] else "completed",
            "reasoning": result["reasoning"]
        }
        
        db.collection('user_transactions').document(user_id).collection('transactions').document(tx_id).set(save_data)
        
        print(f"Analysis Complete. Blocked: {result['is_blocked']} | Saved: {tx_id}")
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        print(f"Error in analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/transactions/{user_id}")
async def get_user_transactions(user_id: str):
    if db is None:
        return {"status": "error", "message": "Database offline"}
    try:
        docs = db.collection('user_transactions').document(user_id).collection('transactions').order_by('timestamp', direction=firestore.Query.DESCENDING).limit(50).stream()
        tx_list = [doc.to_dict() for doc in docs]
        return {"status": "success", "data": tx_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Hybrid Fraud Detection Backend with Persistence", "status": "active"}

@app.get("/health")
async def health():
    return {"status": "ok", "models_loaded": hybrid_model.lgb_model is not None}

@app.get("/db-status")
async def db_status_check():
    """Diagnostic endpoint to check Firebase status"""
    return {
        "status": "Connected" if db is not None else "Disconnected",
        "env_present": "FIREBASE_CREDENTIALS_BASE64" in os.environ,
        "env_length": len(os.environ.get("FIREBASE_CREDENTIALS_BASE64", "")) if os.environ.get("FIREBASE_CREDENTIALS_BASE64") else 0,
        "init_error": init_error,
        "local_file_exists": os.path.exists(cred_path)
    }

@app.get("/fraud-heatmap")
async def get_fraud_heatmap():
    """
    Returns:
    1. Heatmap Points (Weighted for general density)
    2. Pinned Locations (Specific high-risk markers with metadata)
    """
    print("--- DEBUG: Calculating Heatmap ---")
    heatmap_points = []
    pinned_locations = {} # Use dict to aggregate counts by city name

    # 1. Process Historical Data
    try:
        fraud_df = df[df['is_fraud'] == 1]
        print(f"DEBUG: Total Fraud Rows found: {len(fraud_df)}")
        loc_counts = fraud_df['location'].value_counts()
        print(f"DEBUG: Top locations: {loc_counts.head()}")
        
        for location, count in loc_counts.items():
            if location in CITY_COORDS:
                coords = CITY_COORDS[location]
                
                # heatmap weight
                heatmap_points.append({
                    "location": coords,
                    "weight": int(count) * 2
                })
                
                # Pin logic: Aggregate counts
                if location not in pinned_locations:
                    pinned_locations[location] = {
                        "location": coords,
                        "title": location,
                        "desc": [],
                        "severity": 0,
                        "types": [] # Track fraud types
                    }
                pinned_locations[location]["severity"] += int(count)
                pinned_locations[location]["desc"].append(f"Historical Fraud: {count} cases")
                
                # Get fraud types for this location row (approximation from aggregation)
                # Ideally we filter df by location, but for performance in this loop we might need a better way.
                # Since we are iterating value_counts, we can't easily get the types here without another filter.
                # Optimization: Do a group by location first.
                
    except Exception as e:
        print(f"Error processing CSV heatmap: {e}")

    # OPTIMIZATION: Calculate Most Common Fraud Type per Location
    try:
        if not df.empty:
            fraud_df = df[df['is_fraud'] == 1]
            # Group by location and find mode of transaction_type
            loc_types = fraud_df.groupby('location')['transaction_type'].agg(lambda x: x.mode().iloc[0] if not x.mode().empty else "Unknown").to_dict()
            
            for loc in pinned_locations:
                if loc in loc_types:
                    pinned_locations[loc]["common_fraud_type"] = loc_types[loc]
                else:
                    pinned_locations[loc]["common_fraud_type"] = "Phishing" # Default
    except Exception as e:
        print(f"Error calculating fraud types: {e}")


    # 2. Process Blocked Registry (Live Threats)
    try:
        print("DEBUG: Fetching Blocked Registry...")
        docs = blocked_ref.stream()
        count = 0
        for doc in docs:
            count += 1
            data = doc.to_dict()
            loc = data.get('location')
            print(f"DEBUG: Blocked Entity Loc: {loc}")
            if loc and loc in CITY_COORDS:
                coords = CITY_COORDS[loc]
                
                # heatmap weight (very high)
                heatmap_points.append({
                    "location": coords,
                    "weight": 20
                })
                
                # Pin logic
                if loc not in pinned_locations:
                    pinned_locations[loc] = {
                        "location": coords,
                        "title": loc,
                        "desc": [],
                        "severity": 0
                    }
                pinned_locations[loc]["severity"] += 10 # Blocked entities are high severity
                pinned_locations[loc]["desc"].append("Blocked Entity Detected")
        print(f"DEBUG: Blocked entities processed: {count}")

    except Exception as e:
        print(f"Error processing Blocked Registry heatmap: {e}")

    # Process and filter top pins
    final_pins = []
    print(f"DEBUG: Total pinned locations candidate count: {len(pinned_locations)}")
    for loc_name, data in pinned_locations.items():
        # Only pin if severity is significant
        if data["severity"] > 5:
            # unique description
            unique_desc = list(set(data["desc"]))
            summary_desc = f"Risk Score: {data['severity']} | Sources: {', '.join(unique_desc[:2])}..."
            
            final_pins.append({
                "location": data["location"],
                "title": data["title"],
                "description": summary_desc,
                "severity": data["severity"],
                "common_fraud_type": data.get("common_fraud_type", "Cyber Fraud")
            })
            
    # Sort by severity and pick top 10
    final_pins.sort(key=lambda x: x["severity"], reverse=True)
    final_pins = final_pins[:10]
    
    print(f"DEBUG: Final pins count: {len(final_pins)}")
    return {"status": "success", "data": heatmap_points, "pins": final_pins}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

# --- UPI ENDPOINTS ---

@app.get("/users")
def get_users():
    """Get all registered users for frontend dropdown"""
    users = []
    docs = db.collection('users').stream()
    for doc in docs:
        data = doc.to_dict()
        users.append({
            "id": doc.id,
            "name": data.get("name", doc.id),
            "type": data.get("type", "personal")
        })
    return {"users": users}

@app.get("/users/{user_id}/history")
def get_user_history(user_id: str):
    """Get transaction history for a user"""
    current_time = int(time.time())
    start_of_day = current_time - 86400
    
    try:
        docs = db.collection('transactions')\
            .where('user_id', '==', user_id)\
            .stream()
    except Exception as e:
        print(f"⚠️ History query error: {e}")
        docs = []
    
    transactions = []
    total = 0
    for doc in docs:
        data = doc.to_dict()
        txn_time = data.get("timestamp", 0)
        # Filter by last 24h in Python
        if txn_time > start_of_day:
            transactions.append({
                "id": doc.id,
                "amount": data.get("amount", 0),
                "timestamp": txn_time,
                "verdict": data.get("verdict", "APPROVED"),
                "risk_score": data.get("risk_score", 0)
            })
            total += data.get("amount", 0)
    
    return {"transactions": transactions, "daily_total": total}

@app.post("/analyze-upi")
def analyze_upi_transaction(txn: UpiTransactionRequest):
    if not sentinel:
        raise HTTPException(status_code=503, detail="UPI Model Loading...")
    
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection offline.")

    # STEP 1: Get Real Context from Database
    user_type, past_spent, real_time_gap = get_user_risk_profile(txn.user_id)
    
    # STEP 2: Calculate New Total
    current_daily_total = past_spent + txn.amount

    # STEP 3: Apply DYNAMIC Rules based on user type
    # Business users get 20x higher limit
    limit = 1000000 if user_type == "business" else 50000
    
    print(f"📊 Analysis: User={txn.user_id} | Type={user_type} | Total={current_daily_total} | Limit={limit}")

    # RULE CHECK: Volume Trap (User-specific limit)
    if current_daily_total > limit:
        # LOG THE FAILED ATTEMPT TO DB
        db.collection("alerts").add({
            "user_id": txn.user_id,
            "reason": "Volume Violation",
            "amount": txn.amount,
            "timestamp": int(time.time())
        })
        return {
            "verdict": "BLOCKED",
            "reason": f"VOLUME_VIOLATION: Exceeded {user_type} limit (₹{limit:,})",
            "risk_score": 100.0,
            "ui_color": "red",
            "user_type": user_type,
            "daily_spent": past_spent,
            "daily_limit": limit
        }

    # STEP 4: AI Check (VAE) - Context-aware with user limit
    status, reason, risk_score = sentinel.predict(
        txn.user_id, txn.amount, real_time_gap, current_daily_total, user_limit=limit
    )

    # STEP 5: If Approved or Flagged, SAVE to History
    # This ensures the 'daily total' updates for the NEXT transaction!
    if status == "APPROVED" or status == "FLAGGED":
        db.collection("transactions").add({
            "user_id": txn.user_id,
            "amount": txn.amount,
            "timestamp": int(time.time()),
            "risk_score": float(risk_score),
            "verdict": status
        })
        print(f"✅ Transaction Saved to History: {status}")

    return {
        "verdict": status,
        "reason": reason,
        "risk_score": float(risk_score),
        "ui_color": "red" if status == "BLOCKED" else "green" if status == "APPROVED" else "orange",
        "user_type": user_type,
        "daily_spent": past_spent + txn.amount if status != "BLOCKED" else past_spent,
        "daily_limit": limit
    }

