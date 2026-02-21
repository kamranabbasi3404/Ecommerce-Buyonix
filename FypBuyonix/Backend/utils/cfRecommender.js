/**
 * Utility module to interact with Python Collaborative Filtering model
 * Uses real MongoDB ObjectIds for personalized recommendations
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const Product = require('../models/product');
const User = require('../models/user');
const Interaction = require('../models/interaction');

const AI_MODELS_DIR = path.join(__dirname, '..', 'ai_models');
const CF_INTEGRATION_SCRIPT = path.join(AI_MODELS_DIR, 'cf_integration.py');
const PYTHON_PATH = process.env.PYTHON_PATH || 'python';

class CFRecommender {
  constructor() {
    this.modelReady = false;
    this.initializationError = null;
  }

  /**
   * Fetch real user-product interactions from MongoDB
   */
  async getRealInteractions() {
    try {
      const interactions = await Interaction.find({})
        .select('userId productId weight rating action')
        .lean();

      return interactions.map(i => ({
        userId: i.userId.toString(),
        productId: i.productId.toString(),
        rating: i.rating || Math.min((i.weight || 1) / 2, 5)
      }));
    } catch (error) {
      console.warn('  ⚠️  Could not fetch interactions:', error.message);
      return [];
    }
  }

  /**
   * Generate synthetic interactions using REAL MongoDB IDs
   * Ensures even synthetic recommendations point to real products
   */
  async generateSyntheticInteractions() {
    try {
      const products = await Product.find({ status: 'active' }).select('_id').lean();
      const users = await User.find({}).select('_id').lean();
      const productIds = products.map(p => p._id.toString());
      const userIds = users.map(u => u._id.toString());

      if (productIds.length === 0 || userIds.length === 0) return [];

      const interactions = [];
      const ratingProbs = [0.05, 0.10, 0.20, 0.35, 0.30];

      for (let i = 0; i < 3000; i++) {
        const userId = userIds[Math.floor(Math.random() * userIds.length)];
        const productId = productIds[Math.floor(Math.random() * productIds.length)];

        const rand = Math.random();
        let cumProb = 0;
        let rating = 3;
        for (let j = 0; j < ratingProbs.length; j++) {
          cumProb += ratingProbs[j];
          if (rand <= cumProb) { rating = j + 1; break; }
        }
        interactions.push({ userId, productId, rating });
      }
      return interactions;
    } catch (error) {
      console.warn('  ⚠️  Could not generate synthetic data:', error.message);
      return [];
    }
  }

  /**
   * Train CF model by passing interactions to Python via stdin
   */
  trainModel(interactions) {
    return new Promise((resolve, reject) => {
      const python = spawn(PYTHON_PATH, [CF_INTEGRATION_SCRIPT, 'train']);

      let output = '';
      let errorOutput = '';

      python.stdout.on('data', (data) => { output += data.toString(); });
      python.stderr.on('data', (data) => { errorOutput += data.toString(); });
      python.on('error', (err) => {
        reject(new Error(`Failed to start Python: ${err.message}`));
      });

      python.on('close', (code) => {
        if (code !== 0) return reject(new Error(`Python train failed (code ${code}): ${errorOutput}`));
        try {
          const result = JSON.parse(output);
          if (result.error) reject(new Error(result.error));
          else if (result.stats) resolve(result.stats);
          else reject(new Error('Unknown error from Python model'));
        } catch (e) {
          reject(new Error(`Failed to parse Python output: ${e.message}`));
        }
      });

      // Send interactions via stdin
      python.stdin.write(JSON.stringify({ interactions }));
      python.stdin.end();
    });
  }

  /**
   * Initialize the model on server startup
   */
  async initialize() {
    return new Promise(async (resolve) => {
      if (!fs.existsSync(CF_INTEGRATION_SCRIPT)) {
        this.initializationError = 'CF integration script not found';
        console.warn('⚠️  CF model not available:', this.initializationError);
        resolve(false);
        return;
      }

      console.log('🤖 Initializing Collaborative Filtering model...');

      try {
        // Fetch real interactions from MongoDB
        let interactions = await this.getRealInteractions();
        let source = 'real_interactions';

        if (interactions.length < 10) {
          console.log(`  ℹ️  Only ${interactions.length} real interactions, using synthetic data with real IDs...`);
          interactions = await this.generateSyntheticInteractions();
          source = 'synthetic_with_real_ids';
        }

        if (interactions.length === 0) {
          console.warn('⚠️  No data available for model training');
          resolve(false);
          return;
        }

        // Delete old model to force retraining
        const modelPath = path.join(AI_MODELS_DIR, 'cf_model.pkl');
        if (fs.existsSync(modelPath)) {
          try { fs.unlinkSync(modelPath); } catch (e) { /* ignore */ }
        }

        console.log(`  ℹ️  Training with ${interactions.length} interactions (${source})`);

        this.trainModel(interactions)
          .then((stats) => {
            console.log('✓ CF Model initialized successfully');
            console.log(`  Users: ${stats.n_users}, Products: ${stats.n_products} (${source})`);
            this.modelReady = true;
            resolve(true);
          })
          .catch((error) => {
            console.warn('⚠️  Could not initialize CF model:', error.message);
            this.modelReady = false;
            resolve(false);
          });
      } catch (error) {
        console.warn('⚠️  Initialization error:', error.message);
        resolve(false);
      }
    });
  }

  /**
   * Get recommendations from Python model
   */
  async getRecommendations(userId, numRecommendations = 5) {
    return new Promise((resolve, reject) => {
      if (!this.modelReady) return reject(new Error('CF model not initialized'));

      const python = spawn(PYTHON_PATH, [
        CF_INTEGRATION_SCRIPT, 'recommend', String(userId), String(numRecommendations)
      ]);

      let output = '';
      let errorOutput = '';

      python.stdout.on('data', (data) => { output += data.toString(); });
      python.stderr.on('data', (data) => { errorOutput += data.toString(); });
      python.on('error', (err) => {
        reject(new Error(`Failed to start Python: ${err.message}`));
      });

      python.on('close', (code) => {
        if (code !== 0) return reject(new Error(`Python failed (code ${code}): ${errorOutput}`));
        try {
          const result = JSON.parse(output);
          if (result.error) reject(new Error(result.error));
          else if (result.success) resolve(result.recommendations || []);
          else reject(new Error('Unknown error'));
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });
  }

  /**
   * Get model statistics
   */
  async getModelStats() {
    return new Promise((resolve, reject) => {
      const python = spawn(PYTHON_PATH, [CF_INTEGRATION_SCRIPT, 'stats']);

      let output = '';
      let errorOutput = '';

      python.stdout.on('data', (data) => { output += data.toString(); });
      python.stderr.on('data', (data) => { errorOutput += data.toString(); });
      python.on('error', (err) => {
        reject(new Error(`Failed to start Python: ${err.message}`));
      });

      python.on('close', (code) => {
        if (code !== 0) return reject(new Error(`Python failed: ${errorOutput}`));
        try {
          const result = JSON.parse(output);
          if (result.error) reject(new Error(result.error));
          else if (result.stats) resolve(result.stats);
          else reject(new Error('Unknown error'));
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });
  }

  /**
   * Retrain model with fresh data from MongoDB
   */
  async retrain() {
    console.log('🔄 Starting model retraining...');

    const modelPath = path.join(AI_MODELS_DIR, 'cf_model.pkl');
    if (fs.existsSync(modelPath)) {
      fs.unlinkSync(modelPath);
      console.log('  ✓ Old model file deleted');
    }

    let interactions = await this.getRealInteractions();
    let source = 'real_interactions';

    if (interactions.length < 10) {
      interactions = await this.generateSyntheticInteractions();
      source = 'synthetic_with_real_ids';
    }

    console.log(`  ℹ️  Retraining with ${interactions.length} interactions (${source})`);

    const stats = await this.trainModel(interactions);
    this.modelReady = true;
    console.log('✓ Model retrained successfully');
    console.log(`  Users: ${stats.n_users}, Products: ${stats.n_products}`);

    return { success: true, stats, source };
  }

  /**
   * Main API function - recommend products for a user
   * Now uses REAL MongoDB userId directly (no synthetic mapping)
   */
  async recommendForUser(userId, numRecommendations = 5) {
    try {
      const recommendations = await this.getRecommendations(
        String(userId),
        numRecommendations
      );

      // product_id values are now real MongoDB ObjectIds
      return recommendations.map(rec => ({
        productId: rec.product_id,
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
