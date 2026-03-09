import { render, act, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useContext } from 'react';
import { CartProvider } from '../../context/CartContext';
import { CartContext } from '../../context/CartContextType';
import type { CartContextType, CartItem } from '../../context/CartContextType';

function CartConsumer({ onReady }: { onReady: (ctx: CartContextType) => void }) {
    const ctx = useContext(CartContext);

    if (!ctx) {
        throw new Error('CartContext must be used within CartProvider');
    }

    onReady(ctx);

    return (
        <div>
            <span data-testid="cart-count">{ctx.cartItems.length}</span>

            {ctx.cartItems.map((item) => (
                <span key={item._id}>
                    ${item.price.toFixed(2)}
                </span>
            ))}
        </div>
    );
}

function renderWithCart() {
    let ctx!: CartContextType;

    render(
        <CartProvider>
            <CartConsumer onReady={(c) => (ctx = c)} />
        </CartProvider>
    );

    return {
        getCtx: () => ctx,
    };
}

describe('Ecommerce Business Rule Tests', () => {

    beforeEach(() => {
        localStorage.clear();
    });

    it('should add product to cart', () => {
        const { getCtx } = renderWithCart();

        act(() =>
            getCtx().addToCart({
                _id: 'p1',
                name: 'Running Shoes',
                price: 120,
                quantity: 1,
                images: [],
            })
        );

        expect(getCtx().cartItems).toHaveLength(1);
    });

    it('should increase quantity if same product added again', () => {
        const { getCtx } = renderWithCart();

        act(() =>
            getCtx().addToCart({
                _id: 'p1',
                name: 'Running Shoes',
                price: 120,
                quantity: 1,
                images: [],
            })
        );

        act(() =>
            getCtx().addToCart({
                _id: 'p1',
                name: 'Running Shoes',
                price: 120,
                quantity: 2,
                images: [],
            })
        );

        expect(getCtx().cartItems[0].quantity).toBe(3);
    });

    it('should remove item from cart', () => {
        const { getCtx } = renderWithCart();

        act(() =>
            getCtx().addToCart({
                _id: 'p2',
                name: 'Jacket',
                price: 150,
                quantity: 1,
                images: [],
            })
        );

        act(() => getCtx().removeFromCart('p2'));

        expect(getCtx().cartItems).toHaveLength(0);
    });

    it('should clear the cart', () => {
        const { getCtx } = renderWithCart();

        act(() =>
            getCtx().addToCart({
                _id: 'p3',
                name: 'Cap',
                price: 20,
                quantity: 1,
                images: [],
            })
        );

        act(() => getCtx().clearCart());

        expect(getCtx().cartItems).toHaveLength(0);
    });

    it('should remove item if quantity becomes zero', () => {
        const { getCtx } = renderWithCart();

        act(() =>
            getCtx().addToCart({
                _id: 'p4',
                name: 'T-Shirt',
                price: 30,
                quantity: 1,
                images: [],
            })
        );

        act(() => getCtx().updateQuantity('p4', 0));

        expect(getCtx().cartItems).toHaveLength(0);
    });

    it('should format price with two decimal places', () => {
        const { getCtx } = renderWithCart();

        act(() =>
            getCtx().addToCart({
                _id: 'p5',
                name: 'Exact Price',
                price: 7,
                quantity: 1,
                images: [],
            })
        );

        expect(screen.getByText('$7.00')).toBeInTheDocument();
    });

    it('should correctly calculate total price', () => {
        const { getCtx } = renderWithCart();

        act(() =>
            getCtx().addToCart({
                _id: 'p6',
                name: 'Shoes',
                price: 50,
                quantity: 2,
                images: [],
            })
        );

        const total = getCtx().cartItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        expect(total).toBe(100);
    });

    it('should store cart items in localStorage', () => {
        const { getCtx } = renderWithCart();

        act(() =>
            getCtx().addToCart({
                _id: 'p7',
                name: 'Bag',
                price: 60,
                quantity: 1,
                images: [],
            })
        );

        const stored = JSON.parse(
            localStorage.getItem('buyonix_cart_items') || '[]'
        );

        expect(stored).toHaveLength(1);
    });

    it('should load cart items from localStorage', () => {
        const item: CartItem = {
            _id: 'p8',
            name: 'Watch',
            price: 200,
            quantity: 1,
            images: [],
        };

        localStorage.setItem('buyonix_cart_items', JSON.stringify([item]));

        const { getCtx } = renderWithCart();

        expect(getCtx().cartItems).toHaveLength(1);
    });

    it('should clear localStorage when cart is cleared', () => {
        const { getCtx } = renderWithCart();

        act(() =>
            getCtx().addToCart({
                _id: 'p9',
                name: 'Gone Soon',
                price: 5,
                quantity: 1,
                images: [],
            })
        );

        act(() => getCtx().clearCart());

        const stored = JSON.parse(
            localStorage.getItem('buyonix_cart_items') || '[]'
        );

        expect(stored).toHaveLength(0);
    });

});