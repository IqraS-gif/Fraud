import json
from ml_models import hybrid_model

print("Training models...")
hybrid_model.train_models()

def test_scenario(path):
    with open(path) as f:
        data = json.load(f)
        tx = data['test_case'].copy()
        uid = tx.pop('user_id')
        res = hybrid_model.predict(tx, uid)
        print(f"\n--- SCENARIO: {data['description']} ---")
        print(f"Risk Level: {res['risk_level']}")
        print(f"Reasoning: {res['reasoning']}")
        print(f"Decision: {'❌ BLOCKED' if res['is_blocked'] else '✅ APPROVED'}")

# Test for User 1 (Normal)
test_scenario('test_scenarios/safe_acc1001.json')
test_scenario('test_scenarios/fraud_acc1001.json')

# Test for User 2 (Business)
test_scenario('test_scenarios/safe_acc2002.json')
test_scenario('test_scenarios/fraud_acc2002.json')
