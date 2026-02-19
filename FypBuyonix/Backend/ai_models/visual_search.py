#!/usr/bin/env python3
"""
Visual Search Module for Buyonix E-commerce Platform
Uses MobileNetV2 (optimized for speed) for visual feature extraction.
Compares images using cosine similarity to find visually similar products.
"""

import sys
import json
import base64
import io
import os
import numpy as np
from PIL import Image

# Suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

try:
    import tensorflow as tf
    tf.get_logger().setLevel('ERROR')
    # Use MobileNetV2 - much faster than ResNet50
    from tensorflow.keras.applications import MobileNetV2
    from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
    from tensorflow.keras.preprocessing import image as keras_image
except ImportError:
    print(json.dumps({
        "success": False,
        "error": "TensorFlow not installed. Run: pip install tensorflow pillow numpy"
    }))
    sys.exit(1)

# Global model instance (loaded once)
_model = None

def get_model():
    """Load MobileNetV2 model (much faster than ResNet50) for feature extraction."""
    global _model
    if _model is None:
        # MobileNetV2 is ~10x faster than ResNet50
        _model = MobileNetV2(weights='imagenet', include_top=False, pooling='avg')
    return _model

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
    
    try:
        with urllib.request.urlopen(url, timeout=5) as response:
            image_data = response.read()
        img = Image.open(io.BytesIO(image_data))
        
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        return img
    except Exception as e:
        raise ValueError(f"Failed to load image from URL: {str(e)}")

def preprocess_image(img):
    """Preprocess image for MobileNetV2."""
    # Resize to 224x224 (input size)
    img = img.resize((224, 224), Image.Resampling.LANCZOS)
    
    # Convert to numpy array
    img_array = keras_image.img_to_array(img)
    
    # Expand dimensions for batch
    img_array = np.expand_dims(img_array, axis=0)
    
    # Apply preprocessing
    img_array = preprocess_input(img_array)
    
    return img_array

def extract_features(img):
    """Extract feature vector from image using MobileNetV2."""
    model = get_model()
    preprocessed = preprocess_image(img)
    features = model.predict(preprocessed, verbose=0)
    return features.flatten()

def cosine_similarity(a, b):
    """Calculate cosine similarity between two vectors."""
    dot_product = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    
    if norm_a == 0 or norm_b == 0:
        return 0.0
    
    return dot_product / (norm_a * norm_b)

def find_similar_products(query_image, product_images, top_n=10):
    """
    Find products most similar to the query image.
    
    Args:
        query_image: PIL Image object of the query
        product_images: List of dicts with {productId, imageUrl}
        top_n: Number of top results to return
    
    Returns:
        List of {productId, similarity} sorted by similarity (descending)
    """
    # Extract features from query image
    query_features = extract_features(query_image)
    
    results = []
    
    for product in product_images:
        try:
            product_id = product.get('productId')
            image_source = product.get('imageUrl') or product.get('imageBase64')
            
            if not image_source or not product_id:
                continue
            
            # Load product image
            if image_source.startswith('data:') or len(image_source) > 500:
                product_img = load_image_from_base64(image_source)
            else:
                product_img = load_image_from_url(image_source)
            
            # Extract features and compute similarity
            product_features = extract_features(product_img)
            similarity = cosine_similarity(query_features, product_features)
            
            results.append({
                'productId': product_id,
                'similarity': float(similarity)
            })
            
        except Exception as e:
            continue
    
    # Sort by similarity (descending)
    results.sort(key=lambda x: x['similarity'], reverse=True)
    
    # Return top N results
    return results[:top_n]

def main():
    """Main entry point for CLI usage."""
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        data = json.loads(input_data)
        
        action = data.get('action', 'search')
        
        if action == 'search':
            query_base64 = data.get('queryImage')
            query_url = data.get('queryUrl')
            product_images = data.get('products', [])
            top_n = data.get('topN', 10)
            
            if query_base64:
                query_img = load_image_from_base64(query_base64)
            elif query_url:
                query_img = load_image_from_url(query_url)
            else:
                print(json.dumps({
                    "success": False,
                    "error": "No query image provided"
                }))
                sys.exit(1)
            
            # Find similar products
            results = find_similar_products(query_img, product_images, top_n)
            
            print(json.dumps({
                "success": True,
                "results": results,
                "count": len(results)
            }))
            
        elif action == 'extract':
            image_base64 = data.get('image')
            
            if not image_base64:
                print(json.dumps({
                    "success": False,
                    "error": "No image provided"
                }))
                sys.exit(1)
            
            img = load_image_from_base64(image_base64)
            features = extract_features(img)
            
            print(json.dumps({
                "success": True,
                "features": features.tolist()
            }))
            
        elif action == 'health':
            _ = get_model()
            print(json.dumps({
                "success": True,
                "message": "Visual search model is ready",
                "tensorflow_version": tf.__version__,
                "model": "MobileNetV2"
            }))
            
        else:
            print(json.dumps({
                "success": False,
                "error": f"Unknown action: {action}"
            }))
            
    except json.JSONDecodeError as e:
        print(json.dumps({
            "success": False,
            "error": f"Invalid JSON input: {str(e)}"
        }))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))
        sys.exit(1)

if __name__ == '__main__':
    main()
