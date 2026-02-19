"""
Collaborative Filtering AI Model using Matrix Factorization (SVD)
This model learns user preferences and product features to provide personalized recommendations.

Step 1: Synthetic Data Generation
- 5 users
- 45 products  
- 3000 interactions (user ratings)
- Ratings range: 1-5 stars

Step 2: User-Item Matrix
Creates a 5x45 matrix where rows=users, columns=products, values=ratings

Step 3: SVD Training
Matrix Factorization decomposes the matrix into latent features
- User latent features: hidden patterns in user preferences
- Product latent features: hidden patterns in products
- Model learns these during training

Step 4: Prediction
For any user-product pair, the model predicts the likely rating
"""

import numpy as np
import pandas as pd
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import os
import json
from datetime import datetime
import random

class CollaborativeFilteringModel:
    def __init__(self, n_factors=10):
        """
        Initialize the Collaborative Filtering Model
        
        Args:
            n_factors: Number of latent factors for SVD (default 10)
                      Higher = more complex features, more computation
        """
        self.n_factors = n_factors
        self.svd_model = None
        self.user_item_matrix = None
        self.product_ids = None
        self.user_ids = None
        self.is_trained = False
        self.training_date = None
        
    def generate_synthetic_data(self, n_users=5, n_products=45, n_interactions=3000, random_seed=42):
        """
        Generate synthetic user-product interaction data
        This simulates user behavior in early-stage system
        
        Args:
            n_users: Number of synthetic users
            n_products: Number of products
            n_interactions: Number of rating interactions
            random_seed: For reproducibility
        
        Returns:
            DataFrame with columns: user_id, product_id, rating
        """
        random.seed(random_seed)
        np.random.seed(random_seed)
        
        print(f" Generating Synthetic Data:")
        print(f"   • Users: {n_users}")
        print(f"   • Products: {n_products}")
        print(f"   • Interactions: {n_interactions}")
        
        # Generate interactions
        interactions = []
        for _ in range(n_interactions):
            user_id = f"user_{random.randint(1, n_users)}"
            product_id = f"product_{random.randint(1, n_products)}"
            
            # Realistic rating distribution (more 4-5 stars than 1-2)
            rating = np.random.choice(
                [1, 2, 3, 4, 5],
                p=[0.05, 0.10, 0.20, 0.35, 0.30]  # Probability distribution
            )
            
            interactions.append({
                'user_id': user_id,
                'product_id': product_id,
                'rating': rating
            })
        
        # Remove duplicates (keep latest interaction)
        df = pd.DataFrame(interactions)
        df = df.drop_duplicates(subset=['user_id', 'product_id'], keep='last')
        
        print(f" Generated {len(df)} unique interactions")
        return df
    
    def build_user_item_matrix(self, interactions_df):
        """
        Build user-item rating matrix
        
        Matrix structure:
        - Rows: Users
        - Columns: Products
        - Values: Ratings (1-5) or NaN if not rated
        
        This is the input to SVD
        """
        print("\n Building User-Item Matrix...")
        
        # Create pivot table
        matrix = interactions_df.pivot_table(
            index='user_id',
            columns='product_id',
            values='rating',
            fill_value=0  # 0 = not rated
        )
        
        self.user_item_matrix = matrix
        self.user_ids = matrix.index.tolist()
        self.product_ids = matrix.columns.tolist()
        
        sparsity = (matrix == 0).sum().sum() / (matrix.shape[0] * matrix.shape[1])
        print(f" Matrix shape: {matrix.shape} (Users × Products)")
        print(f" Sparsity: {sparsity*100:.1f}% (% of empty cells)")
        
        return matrix
    
    def train(self, interactions_df):
        """
        Train SVD model for collaborative filtering
        
        AI Learning Process:
        1. Takes user-item matrix
        2. Decomposes into U, Σ, V matrices
        3. U: User latent features (hidden patterns in preferences)
        4. V: Product latent features (hidden patterns in products)
        5. Σ: Importance of each latent factor
        
        The model learns what makes products similar and what users like
        """
        print("\n Training Collaborative Filtering Model (SVD)...")
        
        # Step 1: Build matrix
        self.build_user_item_matrix(interactions_df)
        
        # Step 2: Apply SVD (Matrix Factorization)
        print(f"   • Using {self.n_factors} latent factors")
        print("   • Factorizing user-item matrix...")
        
        self.svd_model = TruncatedSVD(n_components=self.n_factors, random_state=42)
        self.svd_model.fit(self.user_item_matrix.values)
        
        # Step 3: Calculate explained variance
        explained_var = self.svd_model.explained_variance_ratio_.sum()
        print(f"   • Explained variance: {explained_var*100:.1f}%")
        print(f"   • This means the model captures {explained_var*100:.1f}% of rating patterns")
        
        self.is_trained = True
        self.training_date = datetime.now().isoformat()
        
        print(" Model training complete!")
        print(f" Model learned:")
        print(f"   - User preference patterns (latent features)")
        print(f"   - Product characteristic patterns (latent features)")
        
        return self
    
    def predict_rating(self, user_id, product_id):
        """
        Predict rating for a user-product pair
        
        Process:
        1. Get user latent feature vector from U matrix
        2. Get product latent feature vector from V matrix
        3. Multiply them to get predicted rating
        
        Returns: Predicted rating (1-5 scale, clipped)
        """
        if not self.is_trained:
            raise ValueError("Model must be trained first!")
        
        # Handle users/products not in training data
        if user_id not in self.user_ids:
            return None
        if product_id not in self.product_ids:
            return None
        
        user_idx = self.user_ids.index(user_id)
        product_idx = self.product_ids.index(product_id)
        
        # Get latent factors
        user_factors = self.svd_model.components_[:, user_idx]
        product_factors = self.svd_model.components_[:, product_idx]
        
        # Predict rating (dot product of latent vectors)
        predicted = np.dot(user_factors, product_factors)
        
        # Clip to valid rating range [1, 5]
        predicted = np.clip(predicted, 1, 5)
        
        return round(predicted, 2)
    
    def recommend_products(self, user_id, n_recommendations=5, exclude_rated=True):
        """
        Recommend top N products for a user
        
        Algorithm:
        1. Get all products (rated or unrated) for user
        2. Predict ratings for all products
        3. If exclude_rated is True, remove already-rated products
        4. Sort by predicted rating
        5. Return top N
        
        Args:
            user_id: User to generate recommendations for
            n_recommendations: Number of products to recommend
            exclude_rated: If True, exclude products already rated by user
        
        Returns:
            List of (product_id, predicted_rating) tuples
        """
        if not self.is_trained:
            raise ValueError("Model must be trained first!")
        
        if user_id not in self.user_ids:
            return []
        
        user_idx = self.user_ids.index(user_id)
        user_ratings = self.user_item_matrix.iloc[user_idx]
        
        predictions = []
        
        for product_id in self.product_ids:
            # Skip if user already rated this product (if exclude_rated is True)
            if exclude_rated and user_ratings[product_id] > 0:
                continue
            
            # Predict rating
            predicted_rating = self.predict_rating(user_id, product_id)
            if predicted_rating is not None:
                predictions.append((product_id, predicted_rating))
        
        # If no unrated products, return top-rated products anyway
        if len(predictions) == 0 and exclude_rated:
            for product_id in self.product_ids:
                predicted_rating = self.predict_rating(user_id, product_id)
                if predicted_rating is not None:
                    predictions.append((product_id, predicted_rating))
        
        # Sort by predicted rating (descending)
        predictions.sort(key=lambda x: x[1], reverse=True)
        
        return predictions[:n_recommendations]
    
    def get_model_stats(self):
        """Return model statistics for reporting"""
        if not self.is_trained:
            return {"status": "not_trained"}
        
        return {
            "status": "trained",
            "training_date": self.training_date,
            "n_users": int(len(self.user_ids)),
            "n_products": int(len(self.product_ids)),
            "n_factors": int(self.n_factors),
            "total_interactions": int((self.user_item_matrix > 0).sum().sum()),
            "explained_variance": float(self.svd_model.explained_variance_ratio_.sum()),
            "description": "Collaborative Filtering using Matrix Factorization (SVD)"
        }
    
    def save_model(self, filepath):
        """Save trained model to disk"""
        if not self.is_trained:
            raise ValueError("Cannot save untrained model!")
        
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        model_data = {
            'svd_model': self.svd_model,
            'user_item_matrix': self.user_item_matrix,
            'user_ids': self.user_ids,
            'product_ids': self.product_ids,
            'n_factors': self.n_factors,
            'training_date': self.training_date
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
        
        print(f" Model saved to {filepath}")
    
    def load_model(self, filepath):
        """Load pre-trained model from disk"""
        with open(filepath, 'rb') as f:
            model_data = pickle.load(f)
        
        self.svd_model = model_data['svd_model']
        self.user_item_matrix = model_data['user_item_matrix']
        self.user_ids = model_data['user_ids']
        self.product_ids = model_data['product_ids']
        self.n_factors = model_data['n_factors']
        self.training_date = model_data['training_date']
        self.is_trained = True
        
        print(f" Model loaded from {filepath}")


# Main execution
if __name__ == "__main__":
    print("=" * 60)
    print(" COLLABORATIVE FILTERING - MATRIX FACTORIZATION (SVD)")
    print("=" * 60)
    
    # Initialize model
    model = CollaborativeFilteringModel(n_factors=10)
    
    # Step 1: Generate synthetic data
    interactions = model.generate_synthetic_data(n_users=5, n_products=45, n_interactions=3000)
    
    # Step 2: Build matrix
    matrix = model.build_user_item_matrix(interactions)
    
    # Step 3: Train model
    model.train(interactions)
    
    # Step 4: Make predictions
    print("\n Sample Predictions:")
    print("-" * 60)
    user = "user_1"
    recommendations = model.recommend_products(user, n_recommendations=5)
    
    print(f"Top 5 recommendations for {user}:")
    for i, (product_id, rating) in enumerate(recommendations, 1):
        print(f"  {i}. {product_id}: Predicted rating {rating}/5 ⭐")
    
    # Step 5: Save model
    print("\n💾 Saving model...")
    model_path = os.path.join(os.path.dirname(__file__), 'cf_model.pkl')
    model.save_model(model_path)
    
    # Print statistics
    print("\n Model Statistics:")
    print("-" * 60)
    stats = model.get_model_stats()
    for key, value in stats.items():
        if key == "explained_variance":
            print(f"{key}: {value*100:.1f}%")
        else:
            print(f"{key}: {value}")
    
    print("\n Collaborative Filtering model ready!")
    print(" Use model.recommend_products(user_id, n) to get recommendations")
