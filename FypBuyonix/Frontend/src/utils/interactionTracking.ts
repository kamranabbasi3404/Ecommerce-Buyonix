/**
 * Interaction Tracking Utility
 * Tracks user interactions with products for collaborative filtering
 */

const API_URL = 'http://localhost:5000';

export interface TrackingResponse {
  success: boolean;
  message: string;
  interaction?: {
    action: string;
    weight: number;
  };
}

/**
 * Get current user ID from localStorage/auth
 * Returns null if user not logged in
 */
function getCurrentUserId(): string | null {
  try {
    // Try to get from localStorage (set during login)
    const userDataStr = localStorage.getItem('user');
    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      return userData?._id || userData?.id || null;
    }
    
    // Try another common key
    const userId = localStorage.getItem('userId');
    if (userId) return userId;
    
    return null;
  } catch (error) {
    console.warn('Could not get user ID:', error);
    return null;
  }
}

/**
 * Track product view
 * Call when user views/clicks on a product
 * 
 * @param productId - Product ID to track
 * @returns Promise with tracking result
 */
export async function trackProductView(productId: string): Promise<TrackingResponse | null> {
  const userId = getCurrentUserId();
  
  if (!userId) {
    console.warn('User not logged in - skipping view tracking');
    return null;
  }
  
  try {
    const response = await fetch(`${API_URL}/product/${productId}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✓ Product view tracked:', productId);
    return data;
  } catch (error) {
    console.error('Error tracking product view:', error);
    return null;
  }
}

/**
 * Track cart addition
 * Call when user adds product to cart
 * Weight: 2 points (stronger signal than view)
 * 
 * @param productId - Product ID to track
 * @returns Promise with tracking result
 */
export async function trackCartAdd(productId: string): Promise<TrackingResponse | null> {
  const userId = getCurrentUserId();
  
  if (!userId) {
    console.warn('User not logged in - skipping cart tracking');
    return null;
  }
  
  try {
    const response = await fetch(`${API_URL}/product/${productId}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✓ Cart addition tracked:', productId);
    return data;
  } catch (error) {
    console.error('Error tracking cart addition:', error);
    return null;
  }
}

/**
 * Track product save/like
 * Call when user saves/likes a product
 * Weight: 3 points (strong interest signal)
 * 
 * @param productId - Product ID to track
 * @returns Promise with tracking result
 */
export async function trackProductSave(productId: string): Promise<TrackingResponse | null> {
  const userId = getCurrentUserId();
  
  if (!userId) {
    console.warn('User not logged in - skipping save tracking');
    return null;
  }
  
  try {
    const response = await fetch(`${API_URL}/product/${productId}/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✓ Product save tracked:', productId);
    return data;
  } catch (error) {
    console.error('Error tracking product save:', error);
    return null;
  }
}

/**
 * Track purchase
 * Call when user successfully purchases a product
 * Weight: 5 + rating*2 (strongest signal)
 * 
 * @param productId - Product ID to track
 * @param rating - Optional: User rating (1-5 stars)
 * @returns Promise with tracking result
 */
export async function trackPurchase(
  productId: string,
  rating?: number
): Promise<TrackingResponse | null> {
  const userId = getCurrentUserId();
  
  if (!userId) {
    console.warn('User not logged in - skipping purchase tracking');
    return null;
  }
  
  try {
    const response = await fetch(`${API_URL}/product/${productId}/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        userId,
        rating: rating || null
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✓ Purchase tracked:', productId, 'Rating:', rating || 'None');
    return data;
  } catch (error) {
    console.error('Error tracking purchase:', error);
    return null;
  }
}

/**
 * Get interaction summary
 * For admin/debugging - shows total interactions by type
 */
export async function getInteractionSummary() {
  try {
    const response = await fetch(`${API_URL}/product/interactions/summary`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error('Error getting interaction summary:', error);
    return null;
  }
}
