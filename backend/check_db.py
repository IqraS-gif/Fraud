import firebase_admin
from firebase_admin import credentials, firestore
import os

# Initialize Firebase
cred_path = os.path.join(os.path.dirname(__file__), 'firebase-credentails.json')
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)
db = firestore.client()

def check_tx():
    for user_id in ['ACC_1001', 'ACC_2002']:
        print(f"\n--- Transactions for {user_id} ---")
        docs = db.collection('user_transactions').document(user_id).collection('transactions').order_by('timestamp', direction=firestore.Query.DESCENDING).limit(5).stream()
        for doc in docs:
            d = doc.to_dict()
            print(f"ID: {d.get('transaction_id')} | User: {d.get('user_id')} | TS: {d.get('timestamp')} | Risk: {d.get('risk_level')}")

if __name__ == "__main__":
    check_tx()
