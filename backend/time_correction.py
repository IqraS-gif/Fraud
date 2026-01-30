import firebase_admin
from firebase_admin import credentials, firestore
import os
from datetime import datetime, timedelta

# Initialize Firebase
cred_path = os.path.join(os.path.dirname(__file__), 'firebase-credentails.json')
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)
db = firestore.client()

def fix_times():
    target_users = ['ACC_1001', 'ACC_2002']
    past_date = datetime(2026, 1, 1) # Move all demo data to Jan 1st
    
    for account_id in target_users:
        print(f"Correcting times for {account_id}...")
        docs = db.collection('user_transactions').document(account_id).collection('transactions').stream()
        
        count = 0
        batch = db.batch()
        for doc in docs:
            # Only update demo data (starts with T_)
            if doc.id.startswith('T_'):
                new_ts = past_date + timedelta(minutes=count * 30) # Space them out
                batch.update(doc.reference, {
                    'timestamp': new_ts.isoformat(),
                    'user_id': account_id, # Also fix the empty User ID column
                    'status': 'completed',
                    'risk_level': 'Low'
                })
                count += 1
                if count % 400 == 0:
                    batch.commit()
                    batch = db.batch()
        
        batch.commit()
        print(f"Moved {count} records to the past for {account_id}")

if __name__ == "__main__":
    fix_times()
