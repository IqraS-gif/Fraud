import base64
import os
import json

# Define the file path (relative to where script is run, usually in backend folder logic)
# We assume this script is run from the project root or we look for the file in backend
possible_paths = [
    "backend/firebase-credentails.json",
    "Finance_Fraud/backend/firebase-credentails.json",
    "firebase-credentails.json"
]

found_path = None
for path in possible_paths:
    if os.path.exists(path):
        found_path = path
        break

if not found_path:
    # Try absolute path based on known location from recent context
    known_abs_path = r"C:\Users\ZAHID\Downloads\FraudDetectionFinal (3)\FraudDetectionFinal\Finance_Fraud\backend\firebase-credentails.json"
    if os.path.exists(known_abs_path):
        found_path = known_abs_path

if found_path:
    try:
        with open(found_path, "rb") as f:
            encoded_string = base64.b64encode(f.read()).decode("utf-8")
            print("\n✅ SUCCESS! Here is your Base64 Encoded Credentials String for Render:\n")
            print("="*20 + " START COPY " + "="*20)
            print(encoded_string)
            print("="*20 + "  END COPY  " + "="*20)
            print("\nINSTRUCTIONS:")
            print("1. Go to Render Dashboard -> Environment Variables")
            print("2. Add Key: FIREBASE_CREDENTIALS_BASE64")
            print("3. Add Value: [Paste the long string above]")
    except Exception as e:
        print(f"❌ Error reading file: {e}")
else:
    print("❌ Could not find 'firebase-credentails.json'. Make sure it exists in the backend folder.")
