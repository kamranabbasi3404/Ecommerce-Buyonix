import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useContext } from 'react';
import { CartProvider } from '../../context/CartContext';
import { CartContext } from '../../context/CartContextType';
import type { CartItem, CartContextType } from '../../context/CartContextType';

// ─── Helper component to interact with CartContext ──────────────────────────
function CartConsumer({
  onReady,
}: {
  onReady: (ctx: CartContextType) => void;
}) {
  const ctx = useContext(CartContext);

  if (!ctx) {
    throw new Error('CartContext must be used within CartProvider');
  }

  onReady(ctx);

  return (
    <div>
      <span data-testid="cart-count">{ctx.cartItems.length}</span>
      <span data-testid="is-open">{ctx.isCartOpen ? 'open' : 'closed'}</span>
    </div>
  );
}

const sampleItem: CartItem = {
  _id: 'item-1',
  name: 'Test Sneakers',
  price: 99.99,
  quantity: 1,
  images: ['https://example.com/sneakers.jpg'],
};

const sampleItem2: CartItem = {
  _id: 'item-2',
  name: 'Blue Jacket',
  price: 149.0,
  quantity: 2,
  images: ['https://example.com/jacket.jpg'],
};

// ─── Tests ──────────────────────────────────────────────────────────────────
describe('CartContext Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should provide default empty cart', () => {
    let ctx!: CartContextType;

    render(
      <CartProvider>
        <CartConsumer onReady={(c) => (ctx = c)} />
      </CartProvider>
    );

    expect(ctx.cartItems).toEqual([]);
    expect(ctx.isCartOpen).toBe(false);
  });

  it('should add an item to the cart', () => {
    let ctx!: CartContextType;

    render(
      <CartProvider>
        <CartConsumer onReady={(c) => (ctx = c)} />
      </CartProvider>
    );

    act(() => ctx.addToCart(sampleItem));

    expect(ctx.cartItems).toHaveLength(1);
    expect(ctx.cartItems[0].name).toBe('Test Sneakers');
  });

  it('should increase quantity when adding the same item again', () => {
    let ctx!: CartContextType;

    render(
      <CartProvider>
        <CartConsumer onReady={(c) => (ctx = c)} />
      </CartProvider>
    );

    act(() => ctx.addToCart(sampleItem));
    act(() => ctx.addToCart({ ...sampleItem, quantity: 3 }));

    expect(ctx.cartItems).toHaveLength(1);
    expect(ctx.cartItems[0].quantity).toBe(4);
  });

  it('should add multiple different items', () => {
    let ctx!: CartContextType;

    render(
      <CartProvider>
        <CartConsumer onReady={(c) => (ctx = c)} />
      </CartProvider>
    );

    act(() => ctx.addToCart(sampleItem));
    act(() => ctx.addToCart(sampleItem2));

    expect(ctx.cartItems).toHaveLength(2);
  });

  it('should remove an item from the cart', () => {
    let ctx!: CartContextType;

    render(
      <CartProvider>
        <CartConsumer onReady={(c) => (ctx = c)} />
      </CartProvider>
    );

    act(() => ctx.addToCart(sampleItem));
    act(() => ctx.addToCart(sampleItem2));
    act(() => ctx.removeFromCart('item-1'));

    expect(ctx.cartItems).toHaveLength(1);
    expect(ctx.cartItems[0]._id).toBe('item-2');
  });

  it('should update item quantity', () => {
    let ctx!: CartContextType;

    render(
      <CartProvider>
        <CartConsumer onReady={(c) => (ctx = c)} />
      </CartProvider>
    );

    act(() => ctx.addToCart(sampleItem));
    act(() => ctx.updateQuantity('item-1', 5));

    expect(ctx.cartItems[0].quantity).toBe(5);
  });

  it('should remove item when quantity is set to 0', () => {
    let ctx!: CartContextType;

    render(
      <CartProvider>
        <CartConsumer onReady={(c) => (ctx = c)} />
      </CartProvider>
    );

    act(() => ctx.addToCart(sampleItem));
    act(() => ctx.updateQuantity('item-1', 0));

    expect(ctx.cartItems).toHaveLength(0);
  });

  it('should update item price', () => {
    let ctx!: CartContextType;

    render(
      <CartProvider>
        <CartConsumer onReady={(c) => (ctx = c)} />
      </CartProvider>
    );

    act(() => ctx.addToCart(sampleItem));
    act(() => ctx.updatePrice('item-1', 79.99));

    expect(ctx.cartItems[0].price).toBe(79.99);
  });

  it('should clear all items from cart', () => {
    let ctx!: CartContextType;

    render(
      <CartProvider>
        <CartConsumer onReady={(c) => (ctx = c)} />
      </CartProvider>
    );

    act(() => ctx.addToCart(sampleItem));
    act(() => ctx.addToCart(sampleItem2));
    act(() => ctx.clearCart());

    expect(ctx.cartItems).toHaveLength(0);
  });

  it('should open cart when item is added', () => {
    let ctx!: CartContextType;

    render(
      <CartProvider>
        <CartConsumer onReady={(c) => (ctx = c)} />
      </CartProvider>
    );

    expect(ctx.isCartOpen).toBe(false);

    act(() => ctx.addToCart(sampleItem));

    expect(ctx.isCartOpen).toBe(true);
  });

  it('should set cart open/closed state', () => {
    let ctx!: CartContextType;

    render(
      <CartProvider>
        <CartConsumer onReady={(c) => (ctx = c)} />
      </CartProvider>
    );

    act(() => ctx.setIsCartOpen(true));
    expect(ctx.isCartOpen).toBe(true);

    act(() => ctx.setIsCartOpen(false));
    expect(ctx.isCartOpen).toBe(false);
  });

  it('should persist cart to localStorage', () => {
    let ctx!: CartContextType;

    render(
      <CartProvider>
        <CartConsumer onReady={(c) => (ctx = c)} />
      </CartProvider>
    );

    act(() => ctx.addToCart(sampleItem));

    const saved = localStorage.getItem('buyonix_cart_items');

    expect(saved).not.toBeNull();

    const parsed = JSON.parse(saved!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].name).toBe('Test Sneakers');
  });

  it('should load cart from localStorage on mount', () => {
    localStorage.setItem('buyonix_cart_items', JSON.stringify([sampleItem]));

    let ctx!: CartContextType;

    render(
      <CartProvider>
        <CartConsumer onReady={(c) => (ctx = c)} />
      </CartProvider>
    );

    expect(ctx.cartItems).toHaveLength(1);
    expect(ctx.cartItems[0].name).toBe('Test Sneakers');
  });

  it('should clear localStorage when clearCart is called', () => {
    let ctx!: CartContextType;

    render(
      <CartProvider>
        <CartConsumer onReady={(c) => (ctx = c)} />
      </CartProvider>
    );

    act(() => ctx.addToCart(sampleItem));
    act(() => ctx.clearCart());

    expect(localStorage.getItem('buyonix_cart_items')).toBe(JSON.stringify([]));
  });
});