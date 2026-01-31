import numpy as np
from sklearn.preprocessing import LabelEncoder

# Constants
FEATURES_LGB = ['amount', 'transaction_type', 'merchant_category', 'location',
               'device_used', 'time_since_last_transaction', 'spending_deviation_score',
               'velocity_score', 'geo_anomaly_score', 'payment_channel']
CAT_COLS = ['transaction_type', 'merchant_category', 'location', 'device_used', 'payment_channel']
AE_FEATURES = ['amount', 'lat', 'long']

class SafeLabelEncoder:
    def __init__(self):
        self.le = LabelEncoder()
        self.classes_ = None

    def fit(self, series):
        self.le.fit(series.astype(str))
        # Store as list for serialization safety if needed, but set is fine
        self.classes_ = set(self.le.classes_)
        return self

    def transform(self, series):
        # Map unseen labels to the first class or a special index if exists
        # For simplicity, we'll map to the first class if unknown
        safe_series = series.astype(str).apply(lambda x: x if x in self.classes_ else list(self.classes_)[0])
        return self.le.transform(safe_series)
