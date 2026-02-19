/**
 * Utility module to interact with Python Collaborative Filtering model
 * Uses child_process to execute Python scripts
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const Product = require('../models/product');

const AI_MODELS_DIR = path.join(__dirname, '..', 'ai_models');
const CF_INTEGRATION_SCRIPT = path.join(AI_MODELS_DIR, 'cf_integration.py');

// Use explicit Python path to avoid conflicts with MySQL Workbench's Python
const PYTHON_PATH = process.env.PYTHON_PATH || 'C:\\Users\\AH\\AppData\\Local\\Programs\\Python\\Python312\\python.exe';

class CFRecommender {
  constructor() {
    this.modelReady = false;
    this.initializationError = null;
    this.lastProductCount = 0;
  }

  /**
   * Get current product count from database
   */
  async getProductCount() {
    try {
      const count = await Product.countDocuments({ status: 'active' });
      return count > 0 ? count : 45; // Default to 45 if empty
    } catch (error) {
      return 45; // Fallback to default
    }
  }

  /**
   * Get current user count from database
   */
  async getUserCount() {
    try {
      const User = require('../models/user');
      const count = await User.countDocuments({});
      return count > 0 ? count : 5; // Default to 5 if empty
    } catch (error) {
      return 5; // Fallback to default
    }
  }

  /**
   * Initialize the model (call on server startup)
   */
  async initialize() {
    return new Promise((resolve) => {
      // Check if Python script exists
      if (!fs.existsSync(CF_INTEGRATION_SCRIPT)) {
        this.initializationError = 'CF integration script not found';
        console.warn('⚠️  Collaborative Filtering model not available:', this.initializationError);
        resolve(false);
        return;
      }

      console.log('🤖 Initializing Collaborative Filtering model...');

      // Get product and user counts from database
      Promise.all([this.getProductCount(), this.getUserCount()]).then(([productCount, userCount]) => {
        this.lastProductCount = productCount;

        // Delete any existing model file to force complete retraining with new counts
        const modelPath = path.join(AI_MODELS_DIR, 'cf_model.pkl');
        if (fs.existsSync(modelPath)) {
          try {
            fs.unlinkSync(modelPath);
            console.log(`  ℹ️  Deleted old model file to force retraining with updated counts (Users: ${userCount}, Products: ${productCount})`);
          } catch (e) {
            console.warn('  ⚠️  Could not delete old model file:', e.message);
          }
        }

        // Get model stats (initializes fresh model with new counts)
        this.getModelStats(productCount, userCount)
          .then((stats) => {
            console.log('✓ CF Model initialized successfully');
            console.log(`  Users: ${stats.n_users}, Products: ${stats.n_products}`);
            this.modelReady = true;
            resolve(true);
          })
          .catch((error) => {
            console.warn('⚠️  Could not initialize CF model:', error.message);
            this.modelReady = false;
            resolve(false);
          });
      });
    });
  }

  /**
   * Get personalized product recommendations for a user
   * 
   * Args:
   *   userId: User ID (e.g., "user_1" for synthetic data)
   *   numRecommendations: Number of products to recommend (default: 5)
   * 
   * Returns:
   *   Array of recommendations: [
   *     { product_id: "product_1", predicted_rating: 4.5 },
   *     { product_id: "product_2", predicted_rating: 4.3 },
   *     ...
   *   ]
   */
  async getRecommendations(userId, numRecommendations = 5) {
    return new Promise((resolve, reject) => {
      if (!this.modelReady) {
        return reject(new Error('CF model not initialized'));
      }

      const python = spawn(PYTHON_PATH, [
        CF_INTEGRATION_SCRIPT,
        'recommend',
        String(userId),
        String(numRecommendations)
      ]);

      let output = '';
      let error = '';

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.stderr.on('data', (data) => {
        error += data.toString();
      });

      python.on('close', (code) => {
        if (code !== 0) {
          return reject(new Error(`Python script failed with code ${code}: ${error}`));
        }

        try {
          const result = JSON.parse(output);

          if (result.error) {
            reject(new Error(result.error));
          } else if (result.success) {
            resolve(result.recommendations || []);
          } else {
            reject(new Error('Unknown error from Python model'));
          }
        } catch (parseError) {
          reject(new Error(`Failed to parse Python output: ${parseError.message}`));
        }
      });
    });
  }

  /**
   * Get model statistics (for debugging/reporting)
   * This also triggers retraining if counts don't match
   */
  async getModelStats(productCount = null, userCount = null) {
    return new Promise((resolve, reject) => {
      const args = [CF_INTEGRATION_SCRIPT, 'stats'];

      // Pass counts if provided (triggers retraining if model file doesn't match)
      if (productCount !== null) {
        args.push(`n_products=${productCount}`);
      }
      if (userCount !== null) {
        args.push(`n_users=${userCount}`);
      }

      const python = spawn(PYTHON_PATH, args);

      let output = '';
      let error = '';

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.stderr.on('data', (data) => {
        error += data.toString();
      });

      python.on('close', (code) => {
        if (code !== 0) {
          return reject(new Error(`Python script failed: ${error}`));
        }

        try {
          const result = JSON.parse(output);

          if (result.error) {
            reject(new Error(result.error));
          } else if (result.stats) {
            resolve(result.stats);
          } else {
            reject(new Error('Unknown error from Python model'));
          }
        } catch (parseError) {
          reject(new Error(`Failed to parse Python output: ${parseError.message}`));
        }
      });
    });
  }

  /**
   * Manually retrain the model with current database counts
   * Call this endpoint when new users/products are added
   * Perfect for FYP demo: POST /ai/retrain
   */
  async retrain() {
    return new Promise((resolve, reject) => {
      console.log('🔄 Starting model retraining...');

      // Delete old model file to force complete retrain
      const modelPath = path.join(AI_MODELS_DIR, 'cf_model.pkl');
      if (fs.existsSync(modelPath)) {
        fs.unlinkSync(modelPath);
        console.log('  ✓ Old model file deleted');
      }

      // Get current counts from database
      Promise.all([this.getProductCount(), this.getUserCount()])
        .then(([productCount, userCount]) => {
          console.log(`  ℹ️  Building new model with ${userCount} users, ${productCount} products`);

          // Call Python to build and save new model with current counts
          const python = spawn(PYTHON_PATH, [
            CF_INTEGRATION_SCRIPT,
            'stats',
            `n_products=${productCount}`,
            `n_users=${userCount}`
          ]);

          let output = '';
          let error = '';

          python.stdout.on('data', (data) => {
            output += data.toString();
          });

          python.stderr.on('data', (data) => {
            error += data.toString();
          });

          python.on('close', (code) => {
            if (code !== 0) {
              console.error('⚠️  Retraining failed:', error);
              return reject(new Error(`Retraining failed: ${error}`));
            }

            try {
              const result = JSON.parse(output);
              if (result.success && result.stats) {
                this.modelReady = true;
                console.log('✓ Model retrained successfully');
                console.log(`  Users: ${result.stats.n_users}, Products: ${result.stats.n_products}`);
                resolve({
                  success: true,
                  stats: result.stats,
                  message: 'Model retrained with current database counts'
                });
              } else {
                reject(new Error(result.error || 'Unknown error'));
              }
            } catch (parseError) {
              reject(new Error(`Failed to parse Python output: ${parseError.message}`));
            }
          });
        })
        .catch(err => reject(err));
    });
  }

  /**
   * Recommend products based on user interactions
   * This is the main function to call from API routes
   * 
   * Simulates user_1, user_2, etc. for synthetic data
   */
  async recommendForUser(userId, numRecommendations = 5) {
    try {
      // Map MongoDB user ID to synthetic user ID for CF model
      // In production, you'd aggregate real user interactions
      const syntheticUserId = `user_${(userId % 5) + 1}`;

      const recommendations = await this.getRecommendations(
        syntheticUserId,
        numRecommendations
      );

      // Convert product_id strings to actual product IDs if needed
      return recommendations.map(rec => ({
        productId: rec.product_id.replace('product_', ''),
        predictedRating: rec.predicted_rating,
        reason: 'Based on collaborative filtering analysis'
      }));
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }
}

module.exports = CFRecommender;
