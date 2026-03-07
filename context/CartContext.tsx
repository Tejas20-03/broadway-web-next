'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { cartActions } from '../store/slices/cartSlice';
import type { AddToCartPayload } from '../store/slices/cartSlice';

export type { AddToCartPayload };

export function useCart() {
  const dispatch = useAppDispatch();
  const { items: cartItems, isOpen: isCartOpen } = useAppSelector((state) => state.cart);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return {
    cartItems,
    cartCount,
    isCartOpen,
    addToCart: useCallback((item: AddToCartPayload) => dispatch(cartActions.addToCart(item)), [dispatch]),
    updateQuantity: useCallback((cartId: string, delta: number) => dispatch(cartActions.updateQuantity({ cartId, delta })), [dispatch]),
    clearCart: useCallback(() => dispatch(cartActions.clearCart()), [dispatch]),
    openCart: useCallback(() => dispatch(cartActions.openCart()), [dispatch]),
    closeCart: useCallback(() => dispatch(cartActions.closeCart()), [dispatch]),
  };
}

// Kept for any imports that reference the provider — StoreProvider in layout.tsx handles this now
export function CartProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
