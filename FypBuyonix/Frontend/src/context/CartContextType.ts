import { createContext } from 'react';

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  images?: Array<string | { url?: string }>;
  colorVariants?: Array<{
    colorName: string;
    colorCode: string;
    image: string;
  }>;
}

export interface CartContextType {
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updatePrice: (itemId: string, newPrice: number) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);
