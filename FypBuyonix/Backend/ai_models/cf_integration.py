"""
Integration module for Collaborative Filtering AI Model
This provides an interface for Node.js/Express backend to call the AI model

Supports 3 commands:
  train    - Train model with interaction data from stdin (JSON)
  recommend - Load model and get recommendations for a user
  stats    - Load model and return statistics
"""

import sys
import json
import os
import pandas as pd
from collaborative_filtering import CollaborativeFilteringModel

# Suppress print statements globally
class SuppressPrint:
    def write(self, x): 
        pass
    def flush(self): 
        pass


class CFIntegration:
    def __init__(self, model_path=None):
        """Initialize the CF model integration"""
        self.model = CollaborativeFilteringModel(n_factors=10)
        self.model_path = model_path or os.path.join(os.path.dirname(__file__), 'cf_model.pkl')
        self.is_initialized = False
    
    def train_from_interactions(self, interactions_list):
        """
        Train model from a list of interaction dicts.
        Each dict has: userId, productId, rating
        
        Args:
            interactions_list: List of {userId, productId, rating} dicts
        
        Returns:
            True if training succeeded
        """
        if len(interactions_list) == 0:
            raise ValueError("No interactions provided for training")
        
        # Convert to DataFrame with expected column names
        df = pd.DataFrame(interactions_list)
        df = df.rename(columns={
            'userId': 'user_id',
            'productId': 'product_id',
            'rating': 'rating'
        })
        
        # Keep only needed columns
        df = df[['user_id', 'product_id', 'rating']]
        
        # Remove duplicates (keep last interaction for each user-product pair)
        df = df.drop_duplicates(subset=['user_id', 'product_id'], keep='last')
        
        # Train model (this internally builds the user-item matrix)
        self.model.train(df)
        self.model.save_model(self.model_path)
        self.is_initialized = True
        
        return True
    
    def load_existing_model(self):
        """Load pre-trained model from disk"""
        if not os.path.exists(self.model_path):
            raise FileNotFoundError("Model file not found. Train the model first.")
        
        self.model.load_model(self.model_path)
        self.is_initialized = True
    
    def get_recommendations(self, user_id, num_recommendations=5):
        """Get personalized recommendations for a user"""
        if not self.is_initialized:
            raise ValueError("Model not initialized. Call train or load first.")
        
        recommendations = self.model.recommend_products(
            user_id, 
            n_recommendations=num_recommendations,
            exclude_rated=True
        )
        
        return recommendations
    
    def get_model_stats(self):
        """Get model statistics"""
        return self.model.get_model_stats()


if __name__ == "__main__":
    cf = CFIntegration()
    
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No command specified. Use: train, recommend, or stats"}))
        sys.exit(1)
    
    command = sys.argv[1]
    
    # Save original stdout/stderr for final output
    old_stdout = sys.stdout
    old_stderr = sys.stderr
    
    try:
        if command == "train":
            # Read interaction data from stdin
            input_raw = sys.stdin.read()
            input_data = json.loads(input_raw)
            interactions = input_data.get('interactions', [])
            
            if len(interactions) == 0:
                print(json.dumps({"error": "No interactions provided"}))
                sys.exit(1)
            
            # Suppress output during training
            sys.stdout = SuppressPrint()
            sys.stderr = SuppressPrint()
            
            cf.train_from_interactions(interactions)
            
            # Restore output for final result
            sys.stdout = old_stdout
            sys.stderr = old_stderr
            
            stats = cf.get_model_stats()
            print(json.dumps({"success": True, "stats": stats}))
        
        elif command == "recommend":
            user_id = sys.argv[2] if len(sys.argv) > 2 else None
            num_recs = int(sys.argv[3]) if len(sys.argv) > 3 else 5
            
            if not user_id:
                print(json.dumps({"error": "No user_id specified"}))
                sys.exit(1)
            
            # Suppress output during model loading
            sys.stdout = SuppressPrint()
            sys.stderr = SuppressPrint()
            
            cf.load_existing_model()
            recommendations = cf.get_recommendations(user_id, num_recs)
            
            sys.stdout = old_stdout
            sys.stderr = old_stderr
            
            result = {
                "success": True,
                "user_id": user_id,
                "recommendations": [
                    {"product_id": pid, "predicted_rating": float(rating)}
                    for pid, rating in recommendations
                ]
            }
            print(json.dumps(result))
        
        elif command == "stats":
            sys.stdout = SuppressPrint()
            sys.stderr = SuppressPrint()
            
            cf.load_existing_model()
            
            sys.stdout = old_stdout
            sys.stderr = old_stderr
            
            stats = cf.get_model_stats()
            print(json.dumps({"success": True, "stats": stats}))
        
        else:
            print(json.dumps({"error": f"Unknown command: {command}"}))
            sys.exit(1)
    
    except json.JSONDecodeError as e:
        sys.stdout = old_stdout
        sys.stderr = old_stderr
        print(json.dumps({"error": f"Invalid JSON input: {str(e)}"}))
        sys.exit(1)
    except FileNotFoundError as e:
        sys.stdout = old_stdout
        sys.stderr = old_stderr
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
    except Exception as e:
        sys.stdout = old_stdout
        sys.stderr = old_stderr
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
