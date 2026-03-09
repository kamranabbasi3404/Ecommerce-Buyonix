import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { CartContext } from '../../context/CartContextType';
import type { CartContextType } from '../../context/CartContextType';
import Recommendations from '../../components/Recommendations';

// ─── Mock Data ──────────────────────────────────────────────────────────────
const mockRecommendations = [
  {
    _id: 'prod1',
    name: 'Wireless Bluetooth Headphones',
    price: 49.99,
    originalPrice: 79.99,
    discount: 38,
    images: ['https://example.com/headphones.jpg'],
    rating: 4.5,
    reviewCount: 120,
    predictedRating: 4.7,
    reason: 'Based on your browsing history',
    sellerId: { storeName: 'TechStore' },
  },
  {
    _id: 'prod2',
    name: 'Smart Watch Pro',
    price: 199.99,
    images: [{ url: 'https://example.com/watch.jpg' }],
    rating: 4.2,
    reviewCount: 85,
    sellerId: { storeName: 'GadgetHub' },
  },
  {
    _id: 'prod3',
    name: 'USB-C Charging Cable',
    price: 9.99,
    images: [],
    rating: 3.8,
    reviewCount: 245,
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
const mockAddToCart = vi.fn();

const createMockCartContext = (): CartContextType => ({
  isCartOpen: false,
  setIsCartOpen: vi.fn(),
  cartItems: [],
  addToCart: mockAddToCart,
  removeFromCart: vi.fn(),
  updateQuantity: vi.fn(),
  updatePrice: vi.fn(),
  clearCart: vi.fn(),
});

const renderWithProviders = (cartContext?: CartContextType) => {
  const ctx = cartContext || createMockCartContext();
  return render(
    <MemoryRouter>
      <CartContext.Provider value={ctx}>
        <Recommendations />
      </CartContext.Provider>
    </MemoryRouter>
  );
};

// ─── Tests ──────────────────────────────────────────────────────────────────
describe('Recommendations Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set a valid user in localStorage
    localStorage.setItem('user', JSON.stringify({ _id: '65d8c12e9f1a2b3c4d5e6f78' }));
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 1: Loading State
  // ──────────────────────────────────────────────────────────────────────────
  it('should show loading skeleton placeholders initially', () => {
    // Make fetch hang so we stay in loading state
    vi.spyOn(global, 'fetch').mockImplementation(
      () => new Promise(() => { }) // never resolves
    );

    renderWithProviders();

    // The heading should be visible during loading
    expect(screen.getByText('Recommended For You')).toBeInTheDocument();
    expect(screen.getByText('AI-powered personalized product suggestions')).toBeInTheDocument();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 2: Successful Data Fetch & Render
  // ──────────────────────────────────────────────────────────────────────────
  it('should display recommendation cards after successful fetch', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, recommendations: mockRecommendations }),
    } as Response);

    renderWithProviders();

    // Wait for data to render
    await waitFor(() => {
      expect(screen.getByText('Wireless Bluetooth Headphones')).toBeInTheDocument();
    });

    expect(screen.getByText('Smart Watch Pro')).toBeInTheDocument();
    expect(screen.getByText('USB-C Charging Cable')).toBeInTheDocument();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 3: Renders prices correctly
  // ──────────────────────────────────────────────────────────────────────────
  it('should display product prices correctly', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, recommendations: mockRecommendations }),
    } as Response);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('$49.99')).toBeInTheDocument();
    });

    expect(screen.getByText('$199.99')).toBeInTheDocument();
    expect(screen.getByText('$9.99')).toBeInTheDocument();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 4: Discount Badge
  // ──────────────────────────────────────────────────────────────────────────
  it('should display discount badge when product has a discount', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, recommendations: mockRecommendations }),
    } as Response);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('-38%')).toBeInTheDocument();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 5: Original Price (strikethrough)
  // ──────────────────────────────────────────────────────────────────────────
  it('should show original price with strikethrough when available', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, recommendations: mockRecommendations }),
    } as Response);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('$79.99')).toBeInTheDocument();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 6: Seller Store Name
  // ──────────────────────────────────────────────────────────────────────────
  it('should display seller store name when available', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, recommendations: mockRecommendations }),
    } as Response);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('by TechStore')).toBeInTheDocument();
    });

    expect(screen.getByText('by GadgetHub')).toBeInTheDocument();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 7: Rating & Reviews
  // ──────────────────────────────────────────────────────────────────────────
  it('should display rating and review count', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, recommendations: mockRecommendations }),
    } as Response);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('4.5 (120 reviews)')).toBeInTheDocument();
    });

    expect(screen.getByText('4.2 (85 reviews)')).toBeInTheDocument();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 8: Add to Cart Functionality
  // ──────────────────────────────────────────────────────────────────────────
  it('should call addToCart when "Add to cart" button is clicked', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, recommendations: mockRecommendations }),
    } as Response);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Wireless Bluetooth Headphones')).toBeInTheDocument();
    });

    const addButtons = screen.getAllByText('Add to cart');
    fireEvent.click(addButtons[0]);

    expect(mockAddToCart).toHaveBeenCalledTimes(1);
    expect(mockAddToCart).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: 'prod1',
        name: 'Wireless Bluetooth Headphones',
        price: 49.99,
        quantity: 1,
      })
    );
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 9: API Error Handling
  // ──────────────────────────────────────────────────────────────────────────
  it('should render nothing when API returns error', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      text: async () => 'Internal Server Error',
    } as Response);

    const { container } = renderWithProviders();

    await waitFor(() => {
      // Component returns null on error
      expect(container.firstChild).toBeNull();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 10: Empty Recommendations
  // ──────────────────────────────────────────────────────────────────────────
  it('should render nothing when recommendations array is empty', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, recommendations: [] }),
    } as Response);

    const { container } = renderWithProviders();

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 11: Network Failure
  // ──────────────────────────────────────────────────────────────────────────
  it('should handle network failure gracefully', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network Error'));

    const { container } = renderWithProviders();

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 12: Fallback User ID when localStorage is empty
  // ──────────────────────────────────────────────────────────────────────────
  it('should use fallback userId when localStorage has no user', async () => {
    localStorage.clear();

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, recommendations: mockRecommendations }),
    } as Response);

    renderWithProviders();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('65d8c12e9f1a2b3c4d5e6f78')
      );
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 13: Correct API URL
  // ──────────────────────────────────────────────────────────────────────────
  it('should fetch from the correct API endpoint', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, recommendations: mockRecommendations }),
    } as Response);

    renderWithProviders();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/http:\/\/localhost:5000\/product\/recommendations\/.*\?num=5/)
      );
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 14: "Personalized for you" heading after load
  // ──────────────────────────────────────────────────────────────────────────
  it('should show "Personalized for you" heading after successful load', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, recommendations: mockRecommendations }),
    } as Response);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Personalized for you')).toBeInTheDocument();
    });

    expect(screen.getByText('Based on your interests and preferences')).toBeInTheDocument();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 15: All "Add to cart" buttons rendered
  // ──────────────────────────────────────────────────────────────────────────
  it('should render an "Add to cart" button for each product', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, recommendations: mockRecommendations }),
    } as Response);

    renderWithProviders();

    await waitFor(() => {
      const addButtons = screen.getAllByText('Add to cart');
      expect(addButtons).toHaveLength(mockRecommendations.length);
    });
  });
});
