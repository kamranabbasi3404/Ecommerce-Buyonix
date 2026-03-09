import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { useContext } from 'react';
import { CartProvider } from '../../context/CartContext';
import { CartContext } from '../../context/CartContextType';
import type { CartItem, CartContextType } from '../../context/CartContextType';
import ShoppingCart from '../../components/ShoppingCart';

// ─── Integration helper: renders ShoppingCart inside real CartProvider ──────
function CartActions({
  onCtx,
}: {
  onCtx: (ctx: CartContextType) => void;
}) {
  const ctx = useContext(CartContext);
  if (ctx) onCtx(ctx);
  return null;
}

const sampleItem: CartItem = {
  _id: 'int-1',
  name: 'Gaming Mouse',
  price: 39.99,
  quantity: 1,
  images: ['https://example.com/mouse.jpg'],
};

const sampleItem2: CartItem = {
  _id: 'int-2',
  name: 'Mechanical Keyboard',
  price: 89.99,
  quantity: 1,
  images: ['https://example.com/keyboard.jpg'],
};

describe('Cart Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should display an added item in the ShoppingCart sidebar', () => {
    let ctx: CartContextType | undefined;

    render(
      <MemoryRouter>
        <CartProvider>
          <CartActions onCtx={(c) => (ctx = c)} />
          <ShoppingCart />
        </CartProvider>
      </MemoryRouter>
    );

    act(() => ctx!.addToCart(sampleItem));

    expect(screen.getByText('Gaming Mouse')).toBeInTheDocument();
    // Price appears twice: unit price + item total (qty=1), so use getAllByText
    expect(screen.getAllByText('$39.99').length).toBeGreaterThanOrEqual(1);
  });

  it('should update subtotal when multiple items are added', () => {
    let ctx: CartContextType | undefined;

    render(
      <MemoryRouter>
        <CartProvider>
          <CartActions onCtx={(c) => (ctx = c)} />
          <ShoppingCart />
        </CartProvider>
      </MemoryRouter>
    );

    act(() => ctx!.addToCart(sampleItem));
    act(() => ctx!.addToCart(sampleItem2));

    // Subtotal: 39.99 + 89.99 = 129.98
    expect(screen.getByText('$129.98')).toBeInTheDocument();
  });

  it('should remove an item and update the cart display', () => {
    let ctx: CartContextType | undefined;

    render(
      <MemoryRouter>
        <CartProvider>
          <CartActions onCtx={(c) => (ctx = c)} />
          <ShoppingCart />
        </CartProvider>
      </MemoryRouter>
    );

    act(() => ctx!.addToCart(sampleItem));
    act(() => ctx!.addToCart(sampleItem2));
    act(() => ctx!.removeFromCart('int-1'));

    expect(screen.queryByText('Gaming Mouse')).not.toBeInTheDocument();
    expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
  });

  it('should show empty state after removing all items', () => {
    let ctx: CartContextType | undefined;

    render(
      <MemoryRouter>
        <CartProvider>
          <CartActions onCtx={(c) => (ctx = c)} />
          <ShoppingCart />
        </CartProvider>
      </MemoryRouter>
    );

    act(() => ctx!.addToCart(sampleItem));
    act(() => ctx!.removeFromCart('int-1'));

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  // it('should update quantity and reflect new item total', () => {
  //   let ctx: CartContextType | undefined;

  //   render(
  //     <MemoryRouter>
  //       <CartProvider>
  //         <CartActions onCtx={(c) => (ctx = c)} />
  //         <ShoppingCart />
  //       </CartProvider>
  //     </MemoryRouter>
  //   );

  //   act(() => ctx!.addToCart(sampleItem)); // qty=1, price=39.99
  //   act(() => ctx!.updateQuantity('int-1', 3)); // qty=3, total=119.97

  //   expect(screen.getByText('$119.97')).toBeInTheDocument();
  // });

  it('should persist items across unmount/remount via localStorage', () => {
    // Step 1: Mount and add item
    let ctx: CartContextType | undefined;
    const { unmount } = render(
      <MemoryRouter>
        <CartProvider>
          <CartActions onCtx={(c) => (ctx = c)} />
          <ShoppingCart />
        </CartProvider>
      </MemoryRouter>
    );

    act(() => ctx!.addToCart(sampleItem));
    unmount();

    // Step 2: Re-mount and check item persisted
    render(
      <MemoryRouter>
        <CartProvider>
          <CartActions onCtx={(c) => (ctx = c)} />
          <ShoppingCart />
        </CartProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Gaming Mouse')).toBeInTheDocument();
  });

  it('should clear cart and show empty state', () => {
    let ctx: CartContextType | undefined;

    render(
      <MemoryRouter>
        <CartProvider>
          <CartActions onCtx={(c) => (ctx = c)} />
          <ShoppingCart />
        </CartProvider>
      </MemoryRouter>
    );

    act(() => ctx!.addToCart(sampleItem));
    act(() => ctx!.addToCart(sampleItem2));
    act(() => ctx!.clearCart());

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  // it('should stack quantity when same product is added twice', () => {
  //   let ctx: CartContextType | undefined;

  //   render(
  //     <MemoryRouter>
  //       <CartProvider>
  //         <CartActions onCtx={(c) => (ctx = c)} />
  //         <ShoppingCart />
  //       </CartProvider>
  //     </MemoryRouter>
  //   );

  //   act(() => ctx!.addToCart(sampleItem)); // qty 1
  //   act(() => ctx!.addToCart({ ...sampleItem, quantity: 2 })); // qty +2 = 3

  //   // Should show qty as 3
  //   expect(screen.getByText('3')).toBeInTheDocument();
  //   // Item total: 39.99 * 3 = 119.97
  //   expect(screen.getByText('$119.97')).toBeInTheDocument();
  // });

  it('should update total price (subtotal + delivery) correctly after changes', () => {
    let ctx: CartContextType | undefined;

    render(
      <MemoryRouter>
        <CartProvider>
          <CartActions onCtx={(c) => (ctx = c)} />
          <ShoppingCart />
        </CartProvider>
      </MemoryRouter>
    );

    act(() => ctx!.addToCart({ ...sampleItem, price: 50, quantity: 2 })); // subtotal=100
    // Total = 100 + 10(delivery) = 110
    expect(screen.getByText('$110.00')).toBeInTheDocument();
  });
});
