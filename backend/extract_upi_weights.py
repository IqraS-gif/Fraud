import os
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model, Model
from tensorflow.keras import layers, backend as K

# paths
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "backend", "upi_models", "sentinel_vae_v1.keras")
OUTPUT_PATH = os.path.join(BASE_DIR, "backend", "models", "upi_weights.json")

# Custom Layers (needed to load)
class Sampling(layers.Layer):
    def call(self, inputs):
        z_mean, z_log_var = inputs
        batch = tf.shape(z_mean)[0]
        dim = tf.shape(z_mean)[1]
        epsilon = K.random_normal(shape=(batch, dim))
        return z_mean + tf.exp(0.5 * z_log_var) * epsilon

class VAE_Wrapper(Model):
    def __init__(self, encoder, decoder, **kwargs):
        super(VAE_Wrapper, self).__init__(**kwargs)
        self.encoder = encoder
        self.decoder = decoder
    
    def call(self, inputs):
        z_mean, z_log_var, z = self.encoder(inputs)
        return self.decoder(z)

def extract_weights():
    print(f"Loading Keras model from {MODEL_PATH}...")
    try:
        model = load_model(MODEL_PATH, custom_objects={'Sampling': Sampling, 'VAE_Wrapper': VAE_Wrapper}, compile=False)
    except Exception as e:
        print(f"Failed to load model: {e}")
        return

    weights_dict = {}

    # Try to find Encoder/Decoder sub-models
    try:
        encoder = model.get_layer("encoder")
        decoder = model.get_layer("decoder")
        print("✅ Found 'encoder' and 'decoder' layers.")
        
        # Extract Encoder Weights
        # We assume simple Dense layers logic for now. 
        # We need to iterate layers and save weights W, b for each Dense layer.
        enc_layers = []
        for layer in encoder.layers:
            if isinstance(layer, layers.Dense):
                w, b = layer.get_weights()
                enc_layers.append({
                    "name": layer.name,
                    "activation": layer.activation.__name__,
                    "w": w.tolist(),
                    "b": b.tolist()
                })
            elif isinstance(layer, layers.InputLayer):
                continue
            elif "sampling" in layer.name.lower():
                print("Skipping sampling layer for inference extraction (we just need mean).")
                # For inference, we usually just take z_mean. 
                # Inspect encoder output: usually it outputs [z_mean, z_log_var, z]
                # The Dense layers BEFORE sampling produce z_mean and z_log_var.
                # Let's inspect the specific structure.
                pass
        
        weights_dict["encoder_layers"] = enc_layers

        # Extract Decoder Weights
        dec_layers = []
        for layer in decoder.layers:
            if isinstance(layer, layers.Dense):
                w, b = layer.get_weights()
                dec_layers.append({
                    "name": layer.name,
                    "activation": layer.activation.__name__,
                    "w": w.tolist(),
                    "b": b.tolist()
                })
        weights_dict["decoder_layers"] = dec_layers

    except ValueError:
        print("❌ Could not separate encoder/decoder. Extracting all dense layers sequentially.")
        # Fallback: Just get all weights if it's a Sequential-like blob
        all_layers = []
        for layer in model.layers:
             if isinstance(layer, layers.Dense):
                w, b = layer.get_weights()
                all_layers.append({
                    "name": layer.name,
                    "activation": layer.activation.__name__,
                    "w": w.tolist(),
                    "b": b.tolist()
                })
        weights_dict["all_layers"] = all_layers

    print(f"Saving weights to {OUTPUT_PATH}...")
    with open(OUTPUT_PATH, "w") as f:
        json.dump(weights_dict, f)
    print("✅ Done.")

if __name__ == "__main__":
    extract_weights()
