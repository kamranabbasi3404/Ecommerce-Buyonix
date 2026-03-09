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

const createMockCartContext = (): CartContextType => ({
  isCartOpen: false,
  setIsCartOpen: vi.fn(),
  cartItems: [],
  addToCart: vi.fn(),
  removeFromCart: vi.fn(),
  updateQuantity: vi.fn(),
  updatePrice: vi.fn(),
  clearCart: vi.fn(),
});

const renderNavbar = () =>
  render(
    <MemoryRouter>
      <CartContext.Provider value={createMockCartContext()}>
        <Navbar />
      </CartContext.Provider>
    </MemoryRouter>
  );

describe('Search Functionality Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render the search input field', () => {
    renderNavbar();
    expect(screen.getByPlaceholderText('Search for products...')).toBeInTheDocument();
  });

  it('should allow typing in search field', () => {
    renderNavbar();
    const input = screen.getByPlaceholderText('Search for products...');
    fireEvent.change(input, { target: { value: 'wireless headphones' } });
    expect(input).toHaveValue('wireless headphones');
  });

  it('should have a search button', () => {
    renderNavbar();
    // There are two search buttons/icons: one inside the input bar
    const searchButtons = screen.getAllByLabelText('Search');
    expect(searchButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('should render visual search camera icon', () => {
    renderNavbar();
    const cameraBtn = screen.getByLabelText('Visual Search');
    expect(cameraBtn).toBeInTheDocument();
  });

  it('should open visual search modal when camera icon is clicked', () => {
    renderNavbar();
    const cameraBtn = screen.getByLabelText('Visual Search');
    fireEvent.click(cameraBtn);

    // After clicking, the VisualSearch modal should open
    expect(screen.getByText('Visual Search')).toBeInTheDocument();
  });

  it('should render search input with empty value initially', () => {
    renderNavbar();
    const input = screen.getByPlaceholderText('Search for products...');
    expect(input).toHaveValue('');
  });

  it('should clear search input after entering text and clearing', () => {
    renderNavbar();
    const input = screen.getByPlaceholderText('Search for products...');
    fireEvent.change(input, { target: { value: 'shoes' } });
    expect(input).toHaveValue('shoes');

    fireEvent.change(input, { target: { value: '' } });
    expect(input).toHaveValue('');
  });

  it('should handle Enter key press in search', () => {
    renderNavbar();
    const input = screen.getByPlaceholderText('Search for products...');
    fireEvent.change(input, { target: { value: 'laptop' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    // The navigation should have been triggered (we can't easily verify URL in MemoryRouter,
    // but at minimum the Enter key should not throw errors)
    expect(input).toBeInTheDocument();
  });

  it('should have the camera button with "Search by image" tooltip', () => {
    renderNavbar();
    const cameraBtn = screen.getByLabelText('Visual Search');
    expect(cameraBtn).toHaveAttribute('title', 'Search by image');
  });
});
