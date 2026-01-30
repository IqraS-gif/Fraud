import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import os

# Initialize Firebase
cred_path = os.path.join(os.path.dirname(__file__), 'firebase-credentails.json')
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()

def seed_blocked_registry():
    print("Seeding Blocked Registry...")
    
    blocked_entities = [
        {
            "entity_id": "amazon-refunds@okicici",
            "type": "Receiver",
            "reason": "Phishing - Fake Refund Scam",
            "source": "Cyber Cell",
            "location": "Jamtara, Jharkhand",
            "timestamp": datetime.now().isoformat(),
            "status": "Blocked"
        },
        {
            "entity_id": "flipkart-bigbillion-offer@ybl",
            "type": "Receiver",
            "reason": "Phishing - Fake Offer",
            "source": "User Report",
            "location": "Nuh, Haryana",
            "timestamp": datetime.now().isoformat(),
            "status": "Blocked"
        },
        {
            "entity_id": "sbi-kyc-update@axl",
            "type": "Receiver",
            "reason": "Phishing - Fake KYC",
            "source": "Bank Intelligence",
            "location": "Kolkata, West Bengal",
            "timestamp": datetime.now().isoformat(),
            "status": "Blocked"
        },
        {
            "entity_id": "netflix-renew-sub@paytm",
            "type": "Receiver",
            "reason": "Phishing - Fake Subscription Renewal",
            "source": "User Report",
            "location": "Mumbai, Maharashtra",
            "timestamp": datetime.now().isoformat(),
            "status": "Blocked"
        },
        {
            "entity_id": "google-pay-rewards@okhdfcbank",
            "type": "Receiver",
            "reason": "Scam - Fake Rewards Claim",
            "source": "AI Detection",
            "location": "Delhi NCR",
            "timestamp": datetime.now().isoformat(),
            "status": "Blocked"
        },
        {
            "entity_id": "phonepe-cashback-claim@ybl",
            "type": "Receiver",
            "reason": "Scam - Fake Cashback",
            "source": "User Report",
            "location": "Jaipur, Rajasthan",
            "timestamp": datetime.now().isoformat(),
            "status": "Blocked"
        },
        {
            "entity_id": "electricity-bill-alert@upl",
            "type": "Receiver",
            "reason": "Phishing - Fake Utility Bill",
            "source": "Cyber Cell",
            "location": "Bangalore, Karnataka",
            "timestamp": datetime.now().isoformat(),
            "status": "Blocked"
        },
        {
            "entity_id": "job-offer-processing-fee@icici",
            "type": "Receiver",
            "reason": "Scam - Fake Employment Fee",
            "source": "Bank Intelligence",
            "location": "Hyderabad, Telangana",
            "timestamp": datetime.now().isoformat(),
            "status": "Blocked"
        },
        {
            "entity_id": "income-tax-refund-gov@sbi",
            "type": "Receiver",
            "reason": "Phishing - Fake Govt Refund",
            "source": "Cyber Cell",
            "location": "Chennai, Tamil Nadu",
            "timestamp": datetime.now().isoformat(),
            "status": "Blocked"
        },
        {
            "entity_id": "lottery-winner-claim@axis",
            "type": "Receiver",
            "reason": "Scam - Fake Lottery",
            "source": "Global Blacklist",
            "location": "Surat, Gujarat",
            "timestamp": datetime.now().isoformat(),
            "status": "Blocked"
        },
        {
            "entity_id": "bad_actor_001",
            "type": "Sender",
            "reason": "Known Fraudster",
            "source": "Global Blacklist",
            "location": "Unknown (VPN)",
            "timestamp": datetime.now().isoformat(),
            "status": "Blocked"
        }
    ]
    
    for entity in blocked_entities:
        db.collection('blocked_registry').document(entity['entity_id']).set(entity)
        print(f"Added blocked entity: {entity['entity_id']}")

if __name__ == "__main__":
    seed_blocked_registry()
    print("Seeding Complete.")
