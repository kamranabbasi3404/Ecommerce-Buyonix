#!/usr/bin/env python3
"""
Visual Search Server - Persistent HTTP server that keeps model in memory
Uses Flask for simple HTTP API, model stays loaded = instant responses
"""

import os
import sys
import json
import base64
import io

# Fix Windows console encoding for emojis
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

# Suppress TensorFlow warnings BEFORE importing
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from PIL import Image

print("🔄 Loading TensorFlow and MobileNetV2 model...", flush=True)

import tensorflow as tf
tf.get_logger().setLevel('ERROR')
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.preprocessing import image as keras_image

# Load model ONCE at startup - stays in memory forever
print("📥 Downloading and initializing MobileNetV2...", flush=True)
MODEL = MobileNetV2(weights='imagenet', include_top=False, pooling='avg')
print("✅ Model loaded and ready!", flush=True)

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

def load_image_from_base64(base64_string):
    """Load image from base64 string."""
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    
    image_data = base64.b64decode(base64_string)
    img = Image.open(io.BytesIO(image_data))
    
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    return img

def load_image_from_url(url):
    """Load image from URL."""
    import urllib.request
    
    with urllib.request.urlopen(url, timeout=5) as response:
        image_data = response.read()
    img = Image.open(io.BytesIO(image_data))
    
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    return img

def extract_features(img):
    """Extract feature vector from image using MobileNetV2."""
    # Resize to 224x224
    img = img.resize((224, 224), Image.Resampling.LANCZOS)
    
    # Convert to array
    img_array = keras_image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    
    # Extract features (model is already loaded!)
    features = MODEL.predict(img_array, verbose=0)
    return features.flatten().tolist()

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        'success': True,
        'message': 'Visual search server is running',
        'model': 'MobileNetV2',
        'tensorflow_version': tf.__version__
    })

@app.route('/extract', methods=['POST'])
def extract():
    """Extract features from an image."""
    try:
        data = request.get_json()
        image_data = data.get('image') or data.get('imageUrl')
        
        if not image_data:
            return jsonify({'success': False, 'error': 'No image provided'}), 400
        
        # Load image
        if image_data.startswith('data:') or len(image_data) > 500:
            img = load_image_from_base64(image_data)
        else:
            img = load_image_from_url(image_data)
        
        # Extract features (instant since model is loaded!)
        features = extract_features(img)
        
        return jsonify({
            'success': True,
            'features': features
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('VISUAL_SEARCH_PORT', 5001))
    print(f"🚀 Visual Search Server running on http://localhost:{port}", flush=True)
    app.run(host='0.0.0.0', port=port, threaded=True)
