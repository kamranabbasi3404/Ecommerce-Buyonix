import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { CartContext } from '../../context/CartContextType';
import type { CartContextType } from '../../context/CartContextType';
import Navbar from '../../components/Navbar';

// Mock auth utility
vi.mock('../utils/auth', () => ({
  GoogleAuth: vi.fn(),
  checkAuthStatus: vi.fn().mockResolvedValue(null),
}));

// Mock logo import
vi.mock('../assets/logo.png', () => ({ default: 'mock-logo.png' }));

// ─── Helpers ────────────────────────────────────────────────────────────────
const createMockCartContext = (overrides: Partial<CartContextType> = {}): CartContextType => ({
  isCartOpen: false,
  setIsCartOpen: vi.fn(),
  cartItems: [],
  addToCart: vi.fn(),
  removeFromCart: vi.fn(),
  updateQuantity: vi.fn(),
  updatePrice: vi.fn(),
  clearCart: vi.fn(),
  ...overrides,
});

const renderNavbar = (ctx?: CartContextType, initialRoute = '/') =>
  render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <CartContext.Provider value={ctx || createMockCartContext()}>
        <Navbar />
      </CartContext.Provider>
    </MemoryRouter>
  );

describe('Navigation Functional Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ─── Link rendering ──────────────────────────────────────────────────────
  it('should render BUYONIX brand name', () => {
    renderNavbar();
    expect(screen.getByText('BUYONIX')).toBeInTheDocument();
  });

  it('should render Home link', () => {
    renderNavbar();
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('should render Shop link', () => {
    renderNavbar();
    expect(screen.getByText('Shop')).toBeInTheDocument();
  });

  it('should render Categories link', () => {
    renderNavbar();
    expect(screen.getByText('Categories')).toBeInTheDocument();
  });

  it('should render Deals link', () => {
    renderNavbar();
    expect(screen.getByText('Deals')).toBeInTheDocument();
  });

  it('should render About link', () => {
    renderNavbar();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('should render "Become a Seller" button', () => {
    renderNavbar();
    expect(screen.getByText('Become a Seller')).toBeInTheDocument();
  });

  // ─── Search bar ──────────────────────────────────────────────────────────
  it('should render the search input', () => {
    renderNavbar();
    expect(screen.getByPlaceholderText('Search for products...')).toBeInTheDocument();
  });

  it('should allow typing in the search bar', () => {
    renderNavbar();
    const searchInput = screen.getByPlaceholderText('Search for products...');
    fireEvent.change(searchInput, { target: { value: 'sneakers' } });
    expect(searchInput).toHaveValue('sneakers');
  });

  it('should render visual search camera button', () => {
    renderNavbar();
    expect(screen.getByLabelText('Visual Search')).toBeInTheDocument();
  });

  // ─── Cart ────────────────────────────────────────────────────────────────
  it('should render shopping cart button', () => {
    renderNavbar();
    expect(screen.getByLabelText('Shopping cart')).toBeInTheDocument();
  });

  it('should not show cart badge when cart is empty', () => {
    renderNavbar(createMockCartContext({ cartItems: [] }));
    const cartButton = screen.getByLabelText('Shopping cart');
    const badge = cartButton.querySelector('span');
    expect(badge).toBeNull();
  });

  it('should show cart badge with item count', () => {
    const ctx = createMockCartContext({
      cartItems: [
        { _id: '1', name: 'Item 1', price: 10, quantity: 1 },
        { _id: '2', name: 'Item 2', price: 20, quantity: 1 },
        { _id: '3', name: 'Item 3', price: 30, quantity: 1 },
      ],
    });
    renderNavbar(ctx);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should call setIsCartOpen when cart icon is clicked', () => {
    const mockSetIsCartOpen = vi.fn();
    const ctx = createMockCartContext({ setIsCartOpen: mockSetIsCartOpen });
    renderNavbar(ctx);

    fireEvent.click(screen.getByLabelText('Shopping cart'));
    expect(mockSetIsCartOpen).toHaveBeenCalledWith(true);
  });

  // ─── Auth state ──────────────────────────────────────────────────────────
  it('should show "Sign In" button when user is not logged in', () => {
    renderNavbar();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });
});
