import firebase_admin
from firebase_admin import credentials, firestore
import time
from datetime import datetime
import os

# Initialize Firebase (Same credentials as main.py)
cred_path = os.path.join(os.path.dirname(__file__), 'firebase-credentials.json')
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()

def check_for_salami_attacks():
    print(f"[{datetime.now()}] Scanning for Salami Attacks...")
    
    # In a real scenario, we would query for transactions in the last X minutes.
    # For this demo, we'll scan recent transactions in the 'user_transactions' collection.
    
    # We need to iterate over all users or a subset. 
    # For efficiency in this demo, let's look at the 'transactions' subcollection of 'ACC_1001' 
    # and maybe 'ACC_2002' or just scan the global if structured that way.
    # Based on main.py, it seems transactions are stored under: db.collection('user_transactions').document(user_id).collection('transactions')
    
    # Let's monitor ACC_1001 specifically for the demo as requested by user constraints often focused on specific IDs.
    target_users = ["ACC_1001", "ACC_2002"]
    
    for user_id in target_users:
        docs = db.collection('user_transactions').document(user_id).collection('transactions')\
                 .order_by('timestamp', direction=firestore.Query.DESCENDING).limit(50).stream()
        
        recent_txs = [d.to_dict() for d in docs]
        
        # Group by receiver
        receiver_counts = {}
        small_tx_threshold = 500.0
        
        for tx in recent_txs:
            # We only care about COMPLETED transactions for the pattern
            if tx.get('status') != 'completed':
                continue
                
            amount = tx.get('amount', 0)
            receiver = tx.get('receiver_account')
            
            if amount < small_tx_threshold and receiver:
                if receiver not in receiver_counts:
                    receiver_counts[receiver] = 0
                receiver_counts[receiver] += 1
        
        # Check thresholds
        for receiver, count in receiver_counts.items():
            if count >= 5: # Threshold of 5 small transactions
                print(f"!!! SALAMI ATTACK DETECTED !!! User: {user_id} -> Receiver: {receiver} (Count: {count})")
                
                # Write Alert to Firestore
                alert_id = f"ALERT_{user_id}_{int(time.time())}"
                alert_data = {
                    "type": "Salami Attack",
                    "severity": "High",
                    "message": f"High frequency small transactions detected from {user_id} to {receiver}. Potential Salami Attack.",
                    "timestamp": datetime.now().isoformat(),
                    "source_user": user_id,
                    "target_receiver": receiver,
                    "count": count,
                    "status": "Active"
                }
                
                db.collection('alerts').document(alert_id).set(alert_data)
                print("Alert written to DB.")

                # AUTO-BLOCK ENTITIES
                print(f"Auto-Blocking Entities: {user_id} and {receiver}")
                
                # Block Sender
                db.collection('blocked_registry').document(user_id).set({
                    "entity_id": user_id,
                    "type": "Sender",
                    "reason": "Salami Attack Source",
                    "source": "Salami Agent",
                    "timestamp": datetime.now().isoformat(),
                    "status": "Blocked"
                })

                # Block Receiver
                db.collection('blocked_registry').document(receiver).set({
                    "entity_id": receiver,
                    "type": "Receiver",
                    "reason": "Salami Attack Destination",
                    "source": "Salami Agent",
                    "timestamp": datetime.now().isoformat(),
                    "status": "Blocked"
                })
                print("Entities added to Blocked Registry.")

if __name__ == "__main__":
    print("Salami Monitoring Agent Started...")
    print("Polling every 15 seconds for demo purposes (Production: 15 mins)")
    
    while True:
        try:
            check_for_salami_attacks()
        except Exception as e:
            print(f"Error in monitoring loop: {e}")
        
        time.sleep(15) # 15 seconds for demo responsiveness
