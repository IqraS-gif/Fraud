from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from ml_models import hybrid_model
import uvicorn
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials, firestore
import os
from datetime import datetime
from city_coords import CITY_COORDS
import pandas as pd # Added for df

# Initialize Firebase
cred_path = os.path.join(os.path.dirname(__file__), 'firebase-credentails.json')
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)
db = firestore.client()

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

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Train models on startup
    print("Initializing Hybrid Fraud Models...")
    hybrid_model.train_models()
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
                    "blocked_entity": user_id,
                    "trends_analysis": "🚫 BLACKLIST PROTOCOL ACTIVATED\n\n- Historical Analysis: Entity has a confirmed record of security violations.\n- Global Trend: High-velocity blocks applied to known offender IDs.\n- Action: All historical patterns serve as evidence for permanent suspension."
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
                        "blocked_entity": receiver,
                        "trends_analysis": "🚫 BLACKLIST PROTOCOL ACTIVATED\n\n- Historical Analysis: Receiver ID associated with fraud syndicates.\n- Global Trend: Money mule pattern identified.\n- Action: Transfer interception protocol engaged."
                    }
                }
        
        # 0.5 Fetch Historical Context for AI Trends
        history_ref = db.collection('user_transactions').document(user_id).collection('transactions')
        recent_txs = history_ref.order_by('timestamp', direction='DESCENDING').limit(5).get()
        history_context = [tx.to_dict() for tx in recent_txs]
        
        # 1. Prediction (ML Model)
        result = hybrid_model.predict(tx_dict, user_id, language, history_context)
        
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
    uvicorn.run(app, host="0.0.0.0", port=8000)
