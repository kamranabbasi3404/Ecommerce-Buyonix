const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  /**
   * Type of interaction:
   * - "view": User viewed the product page
   * - "cart": User added product to cart
   * - "save": User saved/liked the product
   * - "purchase": User purchased the product
   */
  action: {
    type: String,
    enum: ['view', 'cart', 'save', 'purchase'],
    required: true
  },
  /**
   * User rating for the product (only set if action is "purchase")
   * Range: 1-5 stars
   */
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  /**
   * Weight for collaborative filtering
   * - view: 1 point
   * - cart: 2 points
   * - save: 3 points
   * - purchase: 5 points + rating*2
   */
  weight: {
    type: Number,
    default: 1
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for faster queries
interactionSchema.index({ userId: 1, productId: 1 });
interactionSchema.index({ userId: 1, action: 1 });
interactionSchema.index({ productId: 1, action: 1 });
interactionSchema.index({ timestamp: -1 });

/**
 * Calculate weight based on interaction type and rating
 * This is used in collaborative filtering algorithm
 */
interactionSchema.methods.calculateWeight = function () {
  const weights = {
    'view': 1,
    'cart': 2,
    'save': 3,
    'purchase': 5
  };

  let weight = weights[this.action] || 1;

  // If it's a purchase with rating, add rating bonus
  if (this.action === 'purchase' && this.rating) {
    weight += this.rating * 2; // Rating 5 = +10 bonus
  }

  this.weight = weight;
  return weight;
};

module.exports = mongoose.models.Interaction || mongoose.model('Interaction', interactionSchema);
