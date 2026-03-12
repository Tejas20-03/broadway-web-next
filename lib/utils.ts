import { CartItem } from '../types';

export function formatPrice(amount: number): string {
  return `Rs. ${amount.toLocaleString()}`;
}

// Prices are tax-inclusive (GST is embedded in product prices, matching Cordova).
// taxBreakdown is extracted for display only — it is NOT added on top of the subtotal.
// total = subtotal (food, tax-inclusive) + deliveryFee.
export function calculateOrderTotals(cartItems: CartItem[], deliveryFee = 0, taxRate = 0) {
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const taxBreakdown = Math.round(subtotal * taxRate); // informational — already in price
  const preTaxSubtotal = subtotal - taxBreakdown;
  const total = subtotal + deliveryFee;
  return { subtotal, taxBreakdown, preTaxSubtotal, deliveryFee, total };
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
