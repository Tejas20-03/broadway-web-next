import { CartItem } from '../types';

export function formatPrice(amount: number): string {
  return `Rs. ${amount.toLocaleString()}`;
}

export function calculateOrderTotals(cartItems: CartItem[], deliveryFee = 0, taxRate = 0) {
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * taxRate);
  const total = subtotal + tax + deliveryFee;
  return { subtotal, tax, deliveryFee, total };
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
