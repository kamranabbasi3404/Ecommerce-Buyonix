import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { useContext } from 'react';
import { CartProvider } from '../../context/CartContext';
import { CartContext } from '../../context/CartContextType';
import type { CartContextType } from '../../context/CartContextType';
import ShoppingCart from '../../components/ShoppingCart';

// ─── Helper to access context ───────────────────────────────────────────────
function ContextBridge({ onCtx }: { onCtx: (c: CartContextType) => void }) {
  const ctx = useContext(CartContext);
  if (ctx) onCtx(ctx);
  return null;
}

const renderWithCart = () => {
  let ctx: CartContextType | undefined;
  const result = render(
    <MemoryRouter>
      <CartProvider>
        <ContextBridge onCtx={(c) => (ctx = c)} />
        <ShoppingCart />
      </CartProvider>
    </MemoryRouter>
  );
  return { ...result, getCtx: () => ctx! };
};

describe('Business Rule Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  // ══════════════════════════════════════════════════════════════════════════
  // RULE 1: Cart Subtotal Calculation
  //   subtotal = sum(item.price * item.quantity)
  // ══════════════════════════════════════════════════════════════════════════
  describe('Cart subtotal calculation', () => {
    it('should calculate subtotal as sum of (price × quantity) for all items', () => {
      const { getCtx } = renderWithCart();

      act(() =>
        getCtx().addToCart({
          _id: 'br1',
          name: 'Item A',
          price: 25.0,
          quantity: 2,
          images: [],
        })
      );
      act(() =>
        getCtx().addToCart({
          _id: 'br2',
          name: 'Item B',
          price: 10.0,
          quantity: 3,
          images: [],
        })
      );

      // Subtotal = (25*2) + (10*3) = 80
      expect(screen.getByText('$80.00')).toBeInTheDocument();
    });


  });

  // ══════════════════════════════════════════════════════════════════════════
  // RULE 2: Delivery Fee
  //   $10 flat fee when cart has items, $0 when empty
  // ══════════════════════════════════════════════════════════════════════════
  describe('Delivery fee rule', () => {
    it('should charge $10 delivery fee when cart has items', () => {
      const { getCtx } = renderWithCart();

      act(() =>
        getCtx().addToCart({
          _id: 'del1',
          name: 'Anything',
          price: 5.0,
          quantity: 1,
          images: [],
        })
      );

      expect(screen.getByText('$10.00')).toBeInTheDocument();
    });

    it('should not show delivery fee when cart is empty', () => {
      renderWithCart();
      // When cart is empty, there's no price summary at all (empty state shown)
      expect(screen.queryByText('Delivery Fee')).not.toBeInTheDocument();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // RULE 3: Total = Subtotal + Delivery Fee
  // ══════════════════════════════════════════════════════════════════════════
  describe('Total price calculation', () => {
    it('should compute total = subtotal + delivery fee', () => {
      const { getCtx } = renderWithCart();

      act(() =>
        getCtx().addToCart({
          _id: 'tot1',
          name: 'Gadget',
          price: 45.0,
          quantity: 2,
          images: [],
        })
      );

      // Subtotal: 90, Delivery: 10, Total: 100
      expect(screen.getByText('$100.00')).toBeInTheDocument();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // RULE 4: Quantity minimum enforcement
  //   Quantity ≤ 0 → remove item
  //   addToCart same item → increment quantity
  // ══════════════════════════════════════════════════════════════════════════
  describe('Quantity business rules', () => {
    it('should remove item when quantity set to 0 or negative', () => {
      const { getCtx } = renderWithCart();

      act(() =>
        getCtx().addToCart({
          _id: 'q1',
          name: 'Disposable',
          price: 5.0,
          quantity: 1,
          images: [],
        })
      );

      act(() => getCtx().updateQuantity('q1', 0));

      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    });

    it('should merge quantity when adding a duplicate item', () => {
      const { getCtx } = renderWithCart();

      act(() =>
        getCtx().addToCart({
          _id: 'dup1',
          name: 'Duplicate Item',
          price: 30.0,
          quantity: 1,
          images: [],
        })
      );
      act(() =>
        getCtx().addToCart({
          _id: 'dup1',
          name: 'Duplicate Item',
          price: 30.0,
          quantity: 4,
          images: [],
        })
      );

      // Quantity = 1 + 4 = 5
      expect(screen.getByText('5')).toBeInTheDocument();
      // Item total = 30 * 5 = 150 (also matches subtotal, so use getAllByText)
      const matches = screen.getAllByText('$150.00');
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // RULE 5: Price formatting
  //   All prices should display with 2 decimal places
  // ══════════════════════════════════════════════════════════════════════════
  // describe('Price formatting rules', () => {
  //   it('should display prices with two decimal places', () => {
  //     const { getCtx } = renderWithCart();

  //     act(() =>
  //       getCtx().addToCart({
  //         _id: 'pf1',
  //         name: 'Exact Price',
  //         price: 7, // no decimals
  //         quantity: 1,
  //         images: [],
  //       })
  //     );

  //     expect(screen.getByText('$7.00')).toBeInTheDocument(); // 2 decimals
  //   });
  // });

  // ══════════════════════════════════════════════════════════════════════════
  // RULE 6: Cart persistence rule
  //   Cart data survives page refresh (via localStorage)
  //   clearCart removes from localStorage
  // ══════════════════════════════════════════════════════════════════════════
  describe('Cart persistence rules', () => {
    it('should save cart to localStorage after adding items', () => {
      const { getCtx } = renderWithCart();

      act(() =>
        getCtx().addToCart({
          _id: 'ls1',
          name: 'Persisted Item',
          price: 20,
          quantity: 1,
          images: [],
        })
      );

      const stored = JSON.parse(localStorage.getItem('buyonix_cart_items') || '[]');
      expect(stored).toHaveLength(1);
      expect(stored[0].name).toBe('Persisted Item');
    });


    it('should clear localStorage when cart is cleared', () => {
      const { getCtx } = renderWithCart();

      act(() =>
        getCtx().addToCart({
          _id: 'ls2',
          name: 'Gone Soon',
          price: 5,
          quantity: 1,
          images: [],
        })
      );

      act(() => getCtx().clearCart());

      expect(localStorage.getItem('buyonix_cart_items')).toBe(JSON.stringify([]));
    });

    // ══════════════════════════════════════════════════════════════════════════
    // RULE 7: Cart auto-opens on add
    //   Adding an item should set isCartOpen = true
    // ══════════════════════════════════════════════════════════════════════════
    describe('Cart auto-open rule', () => {
      it('should auto-open the cart when an item is added', () => {
        let ctx: CartContextType | undefined;

        render(
          <CartProvider>
            <ContextBridge onCtx={(c) => (ctx = c)} />
          </CartProvider>
        );

        expect(ctx!.isCartOpen).toBe(false);

        act(() =>
          ctx!.addToCart({
            _id: 'ao1',
            name: 'Auto Open',
            price: 10,
            quantity: 1,
            images: [],
          })
        );

        expect(ctx!.isCartOpen).toBe(true);
      });
    });

    // ══════════════════════════════════════════════════════════════════════════
    // RULE 8: Item count display
    //   "1 item" (singular) vs "N items" (plural)
    // ══════════════════════════════════════════════════════════════════════════
    describe('Item count display rules', () => {
      it('should display "1 item" for a single product', () => {
        const { getCtx } = renderWithCart();

        act(() =>
          getCtx().addToCart({
            _id: 'ic1',
            name: 'Solo',
            price: 10,
            quantity: 1,
            images: [],
          })
        );

        expect(screen.getByText('1 item in your cart')).toBeInTheDocument();
      });

      it('should display "N items" for multiple products', () => {
        const { getCtx } = renderWithCart();

        act(() =>
          getCtx().addToCart({ _id: 'ic2', name: 'One', price: 10, quantity: 1, images: [] })
        );
        act(() =>
          getCtx().addToCart({ _id: 'ic3', name: 'Two', price: 20, quantity: 1, images: [] })
        );

        expect(screen.getByText('2 items in your cart')).toBeInTheDocument();
      });
    });
  });
});
