import firebase_admin
from firebase_admin import credentials, firestore
import os

# Initialize Firebase
cred_path = os.path.join(os.path.dirname(__file__), 'firebase-credentials.json')
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()

def reset_registry():
    print("🗑️ Clearing Manual Blocks from Registry...")
    
    # We only want to keep the truly malicious ones from the seed, or just wipe it for a fresh start.
    # The user wants it "back to normal", so let's remove the test accounts.
    
    test_accounts = ["ACC_1001", "ACC_2002", "ACC_9999"]
    
    for acc in test_accounts:
        doc_ref = db.collection('blocked_registry').document(acc)
        if doc_ref.get().exists:
            doc_ref.delete()
            print(f"✅ Unblocked: {acc}")
        else:
            print(f"ℹ️ {acc} was not blocked.")

    print("\n✨ System Restored. Test accounts are now clean.")

if __name__ == "__main__":
    reset_registry()
