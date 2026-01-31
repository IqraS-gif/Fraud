from sentinel_module.detect_fraud import FraudSentinel
import os

# paths
base_dir = os.path.dirname(os.path.abspath(__file__))
UPI_MODEL_PATH = os.path.join(base_dir, "models", "upi_weights.json")
UPI_SCALER_PATH = os.path.join(base_dir, "upi_models", "feature_scaler.pkl")

def test_sentinel():
    print("Initializing Sentinel...")
    sentinel = FraudSentinel(UPI_MODEL_PATH, UPI_SCALER_PATH)
    
    if sentinel.disabled:
        print("❌ Sentinel is disabled!")
        return

    # Normal Transaction
    print("\nTesting Normal Transaction...")
    status, msg, conf = sentinel.predict("ACC_1001", 500, 3600, 2000)
    print(f"Status: {status}, Msg: {msg}, Confidence: {conf:.2f}%")

    # Velocity Violation
    print("\nTesting Velocity Violation...")
    status, msg, conf = sentinel.predict("ACC_1001", 500, 10, 2000)
    print(f"Status: {status}, Msg: {msg}, Confidence: {conf:.2f}%")

    # High amount anomaly
    print("\nTesting High Amount Anomaly...")
    # User limit 50,000. Amount 45,000 is high.
    status, msg, conf = sentinel.predict("ACC_1001", 45000, 3600, 45000)
    print(f"Status: {status}, Msg: {msg}, Confidence: {conf:.2f}%")

if __name__ == "__main__":
    test_sentinel()
