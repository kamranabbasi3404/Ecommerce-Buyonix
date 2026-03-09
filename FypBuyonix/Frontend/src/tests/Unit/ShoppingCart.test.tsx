import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { CartContext } from '../../context/CartContextType';
import type { CartContextType, CartItem } from '../../context/CartContextType';
import ShoppingCart from '../../components/ShoppingCart';

// ─── Helpers ────────────────────────────────────────────────────────────────
const mockSetIsCartOpen = vi.fn();
const mockRemoveFromCart = vi.fn();
const mockUpdateQuantity = vi.fn();

const sampleItems: CartItem[] = [
  {
    _id: 'cart-1',
    name: 'Wireless Headphones',
    price: 49.99,
    quantity: 2,
    images: ['https://example.com/headphones.jpg'],
  },
  {
    _id: 'cart-2',
    name: 'Phone Case',
    price: 15.0,
    quantity: 1,
    images: ['https://example.com/case.jpg'],
  },
];

const createCartContext = (items: CartItem[] = [], isOpen = true): CartContextType => ({
  isCartOpen: isOpen,
  setIsCartOpen: mockSetIsCartOpen,
  cartItems: items,
  addToCart: vi.fn(),
  removeFromCart: mockRemoveFromCart,
  updateQuantity: mockUpdateQuantity,
  updatePrice: vi.fn(),
  clearCart: vi.fn(),
});

const renderShoppingCart = (ctx: CartContextType) =>
  render(
    <MemoryRouter>
      <CartContext.Provider value={ctx}>
        <ShoppingCart />
      </CartContext.Provider>
    </MemoryRouter>
  );

describe('ShoppingCart Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Empty state ──────────────────────────────────────────────────────────
  it('should show empty cart message when no items', () => {
    renderShoppingCart(createCartContext([]));
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('should show "Start Shopping" button when cart is empty', () => {
    renderShoppingCart(createCartContext([]));
    expect(screen.getByText(/Start Shopping/)).toBeInTheDocument();
  });

  it('should show "0 items in your cart" when empty', () => {
    renderShoppingCart(createCartContext([]));
    expect(screen.getByText('0 items in your cart')).toBeInTheDocument();
  });

  // ─── Items display ────────────────────────────────────────────────────────
  it('should render item names', () => {
    renderShoppingCart(createCartContext(sampleItems));
    expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
    expect(screen.getByText('Phone Case')).toBeInTheDocument();
  });

  it('should display item prices', () => {
    renderShoppingCart(createCartContext(sampleItems));
    expect(screen.getAllByText('$49.99').length).toBeGreaterThanOrEqual(1);
    // $15.00 appears as both unit price and item total (qty=1)
    expect(screen.getAllByText('$15.00').length).toBeGreaterThanOrEqual(1);
  });

  it('should display item quantities', () => {
    renderShoppingCart(createCartContext(sampleItems));
    expect(screen.getByText('2')).toBeInTheDocument(); // Headphones qty
    expect(screen.getByText('1')).toBeInTheDocument(); // Phone Case qty
  });

  it('should display item total (price * quantity)', () => {
    renderShoppingCart(createCartContext(sampleItems));
    expect(screen.getByText('$99.98')).toBeInTheDocument(); // 49.99 * 2
    // $15.00 appears as both unit price and item total (qty=1)
    expect(screen.getAllByText('$15.00').length).toBeGreaterThanOrEqual(1);
  });

  it('should show cart item count in header', () => {
    renderShoppingCart(createCartContext(sampleItems));
    expect(screen.getByText('2 items in your cart')).toBeInTheDocument();
  });

  it('should show "1 item" (singular) for single item', () => {
    renderShoppingCart(createCartContext([sampleItems[0]]));
    expect(screen.getByText('1 item in your cart')).toBeInTheDocument();
  });

  // ─── Price calculations ───────────────────────────────────────────────────
  it('should calculate and display subtotal', () => {
    renderShoppingCart(createCartContext(sampleItems));
    // Subtotal: (49.99*2) + (15*1) = 114.98
    expect(screen.getByText('$114.98')).toBeInTheDocument();
  });

  it('should show delivery fee of $10.00', () => {
    renderShoppingCart(createCartContext(sampleItems));
    expect(screen.getByText('$10.00')).toBeInTheDocument();
  });

  it('should calculate total including delivery fee', () => {
    renderShoppingCart(createCartContext(sampleItems));
    // Total: 114.98 + 10 = 124.98
    expect(screen.getByText('$124.98')).toBeInTheDocument();
  });

  // ─── Buttons / Actions ────────────────────────────────────────────────────
  it('should show "Proceed to Checkout" button', () => {
    renderShoppingCart(createCartContext(sampleItems));
    expect(screen.getByText(/Proceed to Checkout/)).toBeInTheDocument();
  });

  it('should show "Continue Shopping" button', () => {
    renderShoppingCart(createCartContext(sampleItems));
    expect(screen.getByText('Continue Shopping')).toBeInTheDocument();
  });

  it('should call removeFromCart when delete button is clicked', () => {
    renderShoppingCart(createCartContext(sampleItems));
    const removeButtons = screen.getAllByLabelText('Remove from cart');
    fireEvent.click(removeButtons[0]);
    expect(mockRemoveFromCart).toHaveBeenCalledWith('cart-1');
  });

  it('should close cart when close button is clicked', () => {
    renderShoppingCart(createCartContext(sampleItems));
    const closeBtn = screen.getByLabelText('Close cart');
    fireEvent.click(closeBtn);
    expect(mockSetIsCartOpen).toHaveBeenCalledWith(false);
  });

  it('should render Shopping Cart heading', () => {
    renderShoppingCart(createCartContext(sampleItems));
    expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
  });
});
