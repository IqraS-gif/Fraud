import firebase_admin
from firebase_admin import credentials, firestore
import math
from datetime import datetime, timedelta
import hashlib
import os
import random

# Initialize Firebase Admin SDK
cred_path = os.path.join(os.path.dirname(__file__), 'firebase-credentials.json')
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)
db = firestore.client()

def haversine(lat1, lon1, lat2, lon2):
    # Radius of the Earth in km
    R = 6371.0
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distance = R * c
    return distance

def get_device_hash(device_id):
    return hashlib.sha256(str(device_id).encode()).hexdigest()

def generate_mock_data():
    target_users = ['ACC_1001', 'ACC_2002']
    limit = 200
    
    categories = ['Entertainment', 'Food', 'Groceries', 'Utilities', 'Shopping', 'Travel']
    payment_channels = ['Mobile', 'Online', 'In-store']
    
    locations_list = [
        "Kolkata, WB", "Visakhapatnam, AP", "Nagpur, MH", "Kolkata, WB", "Kanpur, UP",
        "Surat, GJ", "Patna, BR", "Surat, GJ", "Mumbai, MH", "Pune, MH", "Kanpur, UP",
        "Bhopal, MP", "Hyderabad, TS", "Lucknow, UP", "Vadodara, GJ", "Chennai, TN",
        "Delhi, DL", "Vadodara, GJ", "Kanpur, UP", "Pune, MH", "Thane, MH", "Kanpur, UP",
        "Ahmedabad, GJ", "Mumbai, MH", "Thane, MH", "Vadodara, GJ", "Bhopal, MP",
        "Thane, MH", "Bhopal, MP", "Kanpur, UP", "Kolkata, WB", "Vadodara, GJ",
        "Mumbai, MH", "Mumbai, MH", "Kanpur, UP", "Vadodara, GJ", "Bhopal, MP",
        "Delhi, DL", "Nagpur, MH", "Jaipur, RJ", "Chennai, TN", "Vadodara, GJ",
        "Patna, BR", "Surat, GJ", "Jaipur, RJ", "Bangalore, KA", "Chennai, TN",
        "Vadodara, GJ", "Pimpri-Chinchwad, MH", "Vadodara, GJ", "Chennai, TN",
        "Kolkata, WB", "Kanpur, UP", "Surat, GJ", "Pimpri-Chinchwad, MH", "Surat, GJ",
        "Lucknow, UP", "Hyderabad, TS", "Patna, BR", "Chennai, TN", "Kanpur, UP",
        "Chennai, TN", "Bhopal, MP", "Delhi, DL", "Mumbai, MH", "Thane, MH",
        "Mumbai, MH", "Jaipur, RJ", "Kanpur, UP", "Pimpri-Chinchwad, MH",
        "Visakhapatnam, AP", "Visakhapatnam, AP", "Kolkata, WB", "Delhi, DL",
        "Jaipur, RJ", "Surat, GJ", "Kanpur, UP", "Pimpri-Chinchwad, MH", "Mumbai, MH",
        "Delhi, DL", "Hyderabad, TS", "Vadodara, GJ", "Mumbai, MH", "Bhopal, MP",
        "Delhi, DL", "Chennai, TN", "Surat, GJ", "Vadodara, GJ", "Thane, MH",
        "Nagpur, MH", "Kanpur, UP", "Ahmedabad, GJ", "Hyderabad, TS", "Ahmedabad, GJ",
        "Nagpur, MH", "Kanpur, UP", "Surat, GJ", "Bangalore, KA", "Hyderabad, TS",
        "Nagpur, MH", "Delhi, DL", "Bangalore, KA", "Surat, GJ", "Pimpri-Chinchwad, MH",
        "Jaipur, RJ", "Nagpur, MH", "Thane, MH", "Bangalore, KA", "Kolkata, WB",
        "Surat, GJ", "Kanpur, UP", "Vadodara, GJ", "Thane, MH", "Kanpur, UP",
        "Nagpur, MH", "Ahmedabad, GJ", "Lucknow, UP", "Bangalore, KA", "Nagpur, MH",
        "Pune, MH", "Thane, MH", "Jaipur, RJ", "Patna, BR", "Surat, GJ", "Patna, BR",
        "Nagpur, MH", "Visakhapatnam, AP", "Pune, MH", "Ahmedabad, GJ", "Bangalore, KA",
        "Patna, BR", "Indore, MP", "Kanpur, UP", "Pune, MH",
        "Ahmedabad, GJ", "Kanpur, UP", "Jaipur, RJ", "Indore, MP", "Chennai, TN",
        "Kanpur, UP", "Delhi, DL", "Thane, MH", "Pune, MH", "Nagpur, MH", "Bhopal, MP",
        "Kanpur, UP", "Pune, MH", "Patna, BR", "Vadodara, GJ", "Patna, BR",
        "Vadodara, GJ", "Delhi, DL", "Kolkata, WB", "Kanpur, UP", "Nagpur, MH",
        "Lucknow, UP", "Jaipur, RJ", "Thane, MH", "Thane, MH", "Bhopal, MP",
        "Bhopal, MP", "Pimpri-Chinchwad, MH", "Ahmedabad, GJ", "Visakhapatnam, AP",
        "Kolkata, WB", "Pune, MH", "Pimpri-Chinchwad, MH", "Ahmedabad, GJ", "Pune, MH",
        "Vadodara, GJ", "Delhi, DL", "Thane, MH", "Kolkata, WB", "Kolkata, WB",
        "Surat, GJ", "Pune, MH"
    ]
    
    print(f"Clearing old transactions and generating 200 mock transactions for each: {target_users}")

    for account_id in target_users:
        # 0. Clear existing transactions to avoid confusion
        print(f"Cleaning sub-collection for {account_id}...")
        docs = db.collection('user_transactions').document(account_id).collection('transactions').stream()
        batch = db.batch()
        count = 0
        for doc in docs:
            batch.delete(doc.reference)
            count += 1
            if count % 400 == 0:
                batch.commit()
                batch = db.batch()
        batch.commit()
        print(f"Deleted {count} old documents for {account_id}")

        state = {
            'total_amount': 0.0,
            'count': 0,
            'last_timestamp': datetime.now() - timedelta(days=60), # Start 60 days ago
            'last_lat': 19.0760, # Mumbai
            'last_long': 72.8777,
            'recent_timestamps': []
        }
        
        for i in range(limit):
            # Constant spacing to ensure we don't exceed 'now'
            # 60 days / 200 tx = roughly 7 hours per tx
            current_ts = state['last_timestamp'] + timedelta(minutes=random.randint(300, 600))
            if current_ts > datetime.now(): current_ts = datetime.now()

            amount = round(random.uniform(10.0, 500.0), 2)
            lat = state['last_lat'] + random.uniform(-0.1, 0.1)
            long = state['last_long'] + random.uniform(-0.1, 0.1)
            device_id = f"device_{account_id[-4:]}_{random.randint(10,99)}"
            
            # 2. Score calculations
            time_delta = (current_ts - state['last_timestamp']).total_seconds() / 60.0
            avg_amount = state['total_amount'] / state['count'] if state['count'] > 0 else amount
            spending_deviation = (amount - avg_amount) / avg_amount if avg_amount > 0 else 0.0
            
            window_start = current_ts - timedelta(hours=24)
            state['recent_timestamps'] = [ts for ts in state['recent_timestamps'] if ts > window_start]
            state['recent_timestamps'].append(current_ts)
            velocity = len(state['recent_timestamps'])
            
            geo_distance = haversine(state['last_lat'], state['last_long'], lat, long)
            current_location = random.choice(locations_list)

            # Construct fields to match live main.py format exactly
            tx_data = {
                'transaction_id': tx_id,
                'timestamp': current_ts.isoformat(),
                'user_id': account_id, # Match frontend expectation
                'receiver_account': f"ACC_{random.randint(3000, 9999)}",
                'is_fraud': False,
                'amount': amount,
                'transaction_type': 'Transfer',
                'merchant_category': random.choice(categories),
                'location': current_location,
                'device_used': device_id,
                'time_since_last_transaction': round(time_delta, 2),
                'spending_deviation_score': round(spending_deviation, 4),
                'velocity_score': velocity,
                'geo_anomaly_score': round(geo_distance, 4),
                'payment_channel': random.choice(payment_channels),
                'risk_level': 'Low',
                'status': 'completed',
                'fraud_probability': 0.01,
                'anomaly_score': 0.05,
                'reasoning': "Historical baseline transaction."
            }

            # Push to Firestore
            db.collection('user_transactions').document(account_id).collection('transactions').document(tx_id).set(tx_data)
            
            # Update state
            state['total_amount'] += amount
            state['count'] += 1
            state['last_timestamp'] = current_ts
            state['last_lat'] = lat
            state['last_long'] = long
            state['last_city'] = current_location
            
            if (i + 1) % 50 == 0:
                print(f"Pushed {i+1} core transactions for {account_id}")
                # Update root stats
                db.collection('user_transactions').document(account_id).set({
                    'stats': {
                        'avg_amount': state['total_amount'] / state['count'],
                        'total_count': state['count'],
                        'last_timestamp': current_ts.isoformat(),
                        'last_location': state['last_city']
                    }
                }, merge=True)

    print("Mock ingestion complete.")

if __name__ == "__main__":
    generate_mock_data()
