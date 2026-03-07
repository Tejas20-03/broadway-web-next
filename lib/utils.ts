import { CartItem } from '../types';
import { DELIVERY_FEE, TAX_RATE } from './constants';

export function formatPrice(amount: number): string {
  return `Rs. ${amount.toLocaleString()}`;
}

export function calculateOrderTotals(cartItems: CartItem[]) {
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax + DELIVERY_FEE;
  return { subtotal, tax, deliveryFee: DELIVERY_FEE, total };
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
